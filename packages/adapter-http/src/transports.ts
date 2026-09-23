import { HttpAgentError } from './request.js';
import type { HttpTransport } from './types.js';

const DONE = '[DONE]';

/** The SSE frame metadata a `parse` hook can see, alongside the `data:` payload. */
export interface SseFrameMeta {
  event?: string;
  id?: string;
}

interface SseFrame {
  payload: string | null;
  meta: SseFrameMeta;
}

/**
 * Turn one server-sent-events frame into text plus its metadata. A frame may
 * carry several `data:` lines, which the spec says to join with a newline,
 * alongside `event:` and `id:` lines — surfaced here so a `parse` hook can see
 * them (a server like LangServe puts its only failure discriminator in
 * `event:`, never in the payload) — and comment lines, which never reach the
 * caller.
 */
function readSseFrame(frame: string): SseFrame {
  const data: string[] = [];
  const meta: SseFrameMeta = {};

  for (const line of frame.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
    else if (line.startsWith('event:')) meta.event = line.slice(6).replace(/^ /, '');
    else if (line.startsWith('id:')) meta.id = line.slice(3).replace(/^ /, '');
  }

  return { payload: data.length ? data.join('\n') : null, meta };
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
  /** Whether `fetch` followed a redirect to get here — see the redirect note below. */
  redirected?: boolean;
  /** The final URL, once redirected — named in the mismatch error instead of blaming `transport`. */
  url?: string;
}

/**
 * A `parse` hook is typed to return `string | null`, but nothing stops a
 * misbehaving one from returning something else — most likely
 * `parse: c => JSON.parse(c)`, forgetting the `.text` (or `.content`/
 * `.delta`) that turns the parsed object into the string the hook meant to
 * return. Enqueuing that value as-is would put a non-string into a
 * `ReadableStream<string>` and break every consumer downstream that assumes
 * string chunks.
 *
 * We coerce with `JSON.stringify` — falling back to `String(...)` only if
 * that throws, e.g. a circular structure — rather than silently dropping it:
 * a hook that produced *some* value clearly meant to emit something, and
 * dropping it would turn a visible bug (wrong-looking text in the chat) into
 * an invisible one (text silently missing). Plain `String(...)` was tried
 * first and rejected: it renders the likeliest mistake above as
 * `"[object Object]"`, which carries no information about its own cause.
 * `JSON.stringify` instead renders `{"text":"Hel"}`, which points straight at
 * the missing `.text`. This mirrors `stringifyMessage` in `request.ts`,
 * which makes the same choice for the same reason.
 *
 * `undefined` is the one exception, handled above before this function's
 * `String`/`JSON.stringify` branch is ever reached: it is dropped (returns
 * `null`), not coerced, because it's what a hook returns from a bare
 * `return;` or a missing `return` — the ordinary shape of "nothing to emit
 * this turn," not a mistake to surface.
 */
function normalizeParsedText(value: string | null | unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

export function decode(
  body: ReadableStream<Uint8Array>,
  transport: HttpTransport,
  parse: ((chunk: string, frame?: SseFrameMeta) => string | null) | undefined,
  meta: DecodeMeta,
): ReadableStream<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const separator = transport === 'sse' ? /\r?\n\r?\n/ : /\r?\n/;
  let buffer = '';
  let finished = false;
  // A transport mismatch — SSE read as ndjson, or, under sse specifically, a
  // 200 whose body is a bare JSON error object with no `data:` line at all —
  // parses cleanly to nothing every time, which otherwise closes as an
  // ordinary empty stream — a blank assistant message with no diagnostic. But
  // "produced no chunk" is not itself the signal: a heartbeat frame, a
  // metadata-only ndjson object, or `{"text":null}` are all correctly-framed
  // and legitimately carry no text. The signal is whether the decoder ever
  // recognized a single frame of the *configured shape* — that is what
  // actually distinguishes "nothing to say this turn" from "this isn't
  // sse/ndjson at all".
  //
  // Honest limit: under ndjson, a bare `{"error":"..."}` body *is* well-formed
  // JSON, so it is recognized and this check cannot catch it — it silently
  // closes blank rather than erroring. We do not special-case a top-level
  // `error` field to catch it: an earlier version of this check did exactly
  // that and it took two rounds to remove, because it false-positived on
  // legitimate responses whose own protocol has a per-item `error` field. Bare
  // JSON error objects are an sse-only diagnostic, not an ndjson one.
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
    let payload: string | null;
    let frameMeta: SseFrameMeta | undefined;

    if (transport === 'sse') {
      const sse = readSseFrame(frame);
      payload = sse.payload;
      frameMeta = sse.meta;
    } else {
      payload = frame;
    }

    if (payload === null) return null;
    // Compare trimmed: `data: [DONE] \n\n` (trailing whitespace, seen from real
    // servers) must still be recognized as the sentinel rather than leaking
    // into the chat as content and leaving the stream open past the real end.
    if (payload.trim() === DONE) return DONE;
    return normalizeParsedText(
      parse ? parse(payload, frameMeta) : defaultParse(payload, transport),
    );
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
    // A redirect (a 301 turning the original POST into a GET, landing on an
    // HTML login page the framework happily serves as 200) produces exactly
    // this same symptom — a body that never matches the configured transport
    // — but the transport option was never the problem. Name the real cause
    // instead of sending the developer to change a setting that is already
    // correct.
    const redirectNote = meta.redirected
      ? ` The request was redirected to ${meta.url}, which is the more likely cause than a wrong ` +
        `"transport" option — e.g. a POST redirected to a GET login or HTML error page.`
      : '';
    controller.error(
      new HttpAgentError(
        meta.status,
        `HTTP ${meta.status}: the response body never produced a chunk for transport "${transport}" ` +
          `(content-type: ${meta.contentType ?? 'unknown'}). This usually means the transport option ` +
          `doesn't match what the server actually sent.${redirectNote}`,
        'transport_mismatch',
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
              const text = parse ? normalizeParsedText(parse(buffer)) : buffer;
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
            const text = parse ? normalizeParsedText(parse(chunk)) : chunk;
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
