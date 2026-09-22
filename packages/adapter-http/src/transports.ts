import { HttpAgentError } from './request.js';
import type { HttpTransport } from './types.js';

const DONE = '[DONE]';

/**
 * Turn one server-sent-events frame into text. A frame may carry several `data:`
 * lines, which the spec says to join with a newline, alongside `event:`, `id:`
 * and comment lines that must not reach the caller.
 */
function readSseFrame(frame: string): string | null {
  const data: string[] = [];

  for (const line of frame.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
  }

  return data.length ? data.join('\n') : null;
}

function defaultParse(payload: string, transport: HttpTransport): string | null {
  if (transport === 'sse') return payload || null;
  if (!payload.trim()) return null;
  try {
    const parsed = JSON.parse(payload) as Record<string, unknown>;
    const text = parsed.text ?? parsed.content ?? parsed.delta;
    return typeof text === 'string' ? text : null;
  } catch {
    // One malformed line must not cost the whole response.
    return null;
  }
}

const SSE_LINE_PREFIXES = ['data:', 'event:', 'id:', 'retry:', ':'];

type FrameShape = 'ignorable' | 'recognized' | 'unrecognized';

/**
 * Judge whether a frame has the shape the configured transport actually
 * defines — not whether it carried text. A heartbeat comment, a metadata-only
 * ndjson object, or `{"text":null}` are all correctly-framed and must never
 * be mistaken for a mismatch; only a frame that matches *none* of the
 * transport's own grammar is evidence the transport option is wrong. `text`
 * never reaches this: with no `parse` hook it always enqueues.
 */
function classifyFrame(frame: string, transport: HttpTransport): FrameShape {
  if (transport === 'sse') {
    const lines = frame.split(/\r?\n/).filter(line => line.length > 0);
    if (lines.length === 0) return 'ignorable';
    return lines.some(line => SSE_LINE_PREFIXES.some(prefix => line.startsWith(prefix)))
      ? 'recognized'
      : 'unrecognized';
  }

  // ndjson
  if (!frame.trim()) return 'ignorable';
  try {
    JSON.parse(frame);
    return 'recognized';
  } catch {
    return 'unrecognized';
  }
}

export interface DecodeMeta {
  /** The response's real HTTP status, carried into a mismatch error rather than a fabricated one. */
  status: number;
  contentType?: string | null;
}

export function decode(
  body: ReadableStream<Uint8Array>,
  transport: HttpTransport,
  parse: ((chunk: string) => string | null) | undefined,
  meta: DecodeMeta,
): ReadableStream<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const separator = transport === 'sse' ? /\r?\n\r?\n/ : /\r?\n/;
  let buffer = '';
  let finished = false;
  // A transport mismatch (SSE read as ndjson, a 200 whose body is a bare JSON
  // error object, ...) parses cleanly to nothing every time, which otherwise
  // closes as an ordinary empty stream — a blank assistant message with no
  // diagnostic. But "produced no chunk" is not itself the signal: a heartbeat
  // frame, a metadata-only ndjson object, or `{"text":null}` are all
  // correctly-framed and legitimately carry no text. The signal is whether
  // the decoder ever recognized a single frame of the *configured shape* —
  // that is what actually distinguishes "nothing to say this turn" from
  // "this isn't sse/ndjson at all".
  let receivedBytes = false;
  let enqueuedAny = false;
  let recognizedAny = false;
  let sawUnrecognized = false;
  // A caller's own `parse` hook can legitimately yield nothing for a turn —
  // filtering out tool-call/metadata/heartbeat frames is a normal use of the
  // hook, not evidence of a framing mismatch. Likewise, a `[DONE]` sentinel
  // (even with no preceding content) proves the adapter's own default framing
  // matched what the server sent. Either one rules the mismatch check out.
  let sawDone = false;

  const toText = (frame: string): string | null => {
    const payload = transport === 'sse' ? readSseFrame(frame) : frame;
    if (payload === null) return null;
    if (payload === DONE) return DONE;
    return parse ? parse(payload) : defaultParse(payload, transport);
  };

  const classify = (frame: string): void => {
    if (transport === 'text') return;
    const shape = classifyFrame(frame, transport);
    if (shape === 'recognized') recognizedAny = true;
    else if (shape === 'unrecognized') sawUnrecognized = true;
  };

  const failIfMismatched = (controller: ReadableStreamDefaultController<string>): boolean => {
    if (!receivedBytes || enqueuedAny || parse || sawDone) return false;
    if (!sawUnrecognized || recognizedAny) return false;
    controller.error(
      new HttpAgentError(
        meta.status,
        `HTTP ${meta.status}: the response body never produced a chunk for transport "${transport}" ` +
          `(content-type: ${meta.contentType ?? 'unknown'}). This usually means the transport option ` +
          `doesn't match what the server actually sent.`,
      ),
    );
    return true;
  };

  return new ReadableStream<string>({
    async pull(controller) {
      while (!finished) {
        const { value, done } = await reader.read();

        if (done) {
          finished = true;
          // Flush both the decoder's pending bytes and the last frame, which a
          // server that closes without a trailing separator never terminated.
          buffer += decoder.decode();

          if (transport === 'text') {
            if (buffer) {
              const text = parse ? parse(buffer) : buffer;
              if (text) {
                controller.enqueue(text);
                enqueuedAny = true;
              }
            }
          } else if (buffer.trim()) {
            classify(buffer);
            const text = toText(buffer);
            if (text === DONE) {
              sawDone = true;
            } else if (text) {
              controller.enqueue(text);
              enqueuedAny = true;
            }
          }

          if (failIfMismatched(controller)) return;

          controller.close();
          return;
        }

        if (value.length > 0) receivedBytes = true;
        buffer += decoder.decode(value, { stream: true });

        if (transport === 'text') {
          // A chunk can decode to nothing (an empty body part, or the first
          // half of a multibyte character), and a parse hook can likewise
          // reduce a chunk to ''. Neither should reach the consumer as a
          // phantom empty chunk, so both are filtered the same way the
          // sse/ndjson path filters an empty payload.
          if (buffer) {
            const chunk = buffer;
            buffer = '';
            const text = parse ? parse(chunk) : chunk;
            if (text) {
              controller.enqueue(text);
              enqueuedAny = true;
              return;
            }
          }
          continue;
        }

        let emitted = false;
        let match = separator.exec(buffer);

        while (match) {
          const frame = buffer.slice(0, match.index);
          buffer = buffer.slice(match.index + match[0].length);

          classify(frame);
          const text = toText(frame);

          if (text === DONE) {
            sawDone = true;
            finished = true;
            controller.close();
            void reader.cancel().catch(() => {});
            return;
          }

          if (text) {
            controller.enqueue(text);
            enqueuedAny = true;
            emitted = true;
          }

          match = separator.exec(buffer);
        }

        if (emitted) return;
      }
    },
    cancel(reason) {
      finished = true;
      return reader.cancel(reason);
    },
  });
}
