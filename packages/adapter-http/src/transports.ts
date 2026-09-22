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

export function decode(
  body: ReadableStream<Uint8Array>,
  transport: HttpTransport,
  parse?: (chunk: string) => string | null,
  contentType?: string | null,
): ReadableStream<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const separator = transport === 'sse' ? /\r?\n\r?\n/ : /\r?\n/;
  let buffer = '';
  let finished = false;
  // A transport mismatch (SSE read as ndjson, a 200 whose body is a bare JSON
  // error object, ...) parses cleanly to nothing every time, which otherwise
  // closes as an ordinary empty stream — a blank assistant message with no
  // diagnostic. Distinguish that from a genuinely empty body: only a body that
  // *received* bytes but never produced a single chunk is a mismatch.
  let receivedBytes = false;
  let enqueuedAny = false;

  const toText = (frame: string): string | null => {
    const payload = transport === 'sse' ? readSseFrame(frame) : frame;
    if (payload === null) return null;
    if (payload === DONE) return DONE;
    return parse ? parse(payload) : defaultParse(payload, transport);
  };

  const failIfMismatched = (controller: ReadableStreamDefaultController<string>): boolean => {
    if (!receivedBytes || enqueuedAny) return false;
    controller.error(
      new HttpAgentError(
        502,
        `HTTP adapter: the response body never produced a chunk for transport "${transport}" ` +
          `(content-type: ${contentType ?? 'unknown'}). This usually means the transport option ` +
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
              if (text !== null) {
                controller.enqueue(text);
                enqueuedAny = true;
              }
            }
          } else if (buffer.trim()) {
            const text = toText(buffer);
            if (text && text !== DONE) {
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
          // A chunk can decode to nothing: an empty body part, or the first half
          // of a multibyte character. Enqueuing '' is harmless downstream but
          // shows up as a phantom chunk in tests.
          if (buffer) {
            const chunk = buffer;
            buffer = '';
            const text = parse ? parse(chunk) : chunk;
            if (text !== null) {
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

          const text = toText(frame);

          if (text === DONE) {
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
