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
): ReadableStream<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const separator = transport === 'sse' ? /\r?\n\r?\n/ : /\r?\n/;
  let buffer = '';
  let finished = false;

  const toText = (frame: string): string | null => {
    const payload = transport === 'sse' ? readSseFrame(frame) : frame;
    if (payload === null) return null;
    if (payload === DONE) return DONE;
    return parse ? parse(payload) : defaultParse(payload, transport);
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
            if (buffer) controller.enqueue(buffer);
          } else if (buffer.trim()) {
            const text = toText(buffer);
            if (text && text !== DONE) controller.enqueue(text);
          }

          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });

        if (transport === 'text') {
          // A chunk can decode to nothing: an empty body part, or the first half
          // of a multibyte character. Enqueuing '' is harmless downstream but
          // shows up as a phantom chunk in tests.
          if (buffer) {
            controller.enqueue(buffer);
            buffer = '';
            return;
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
