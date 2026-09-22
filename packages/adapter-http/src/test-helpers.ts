import type { AgentMessage } from '@loquix/core';

export function userMessage(content: string): AgentMessage {
  return { id: 'm1', role: 'user', content };
}

function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

export function sseBody(...payloads: string[]): ReadableStream<Uint8Array> {
  return streamOf(payloads.map(p => `data: ${p}\n\n`));
}

export function ndjsonBody(...objects: unknown[]): ReadableStream<Uint8Array> {
  return streamOf(objects.map(o => `${JSON.stringify(o)}\n`));
}

export function textBody(...chunks: string[]): ReadableStream<Uint8Array> {
  return streamOf(chunks);
}

export interface FakeFetchResult {
  fetch: typeof globalThis.fetch;
  calls: Array<{ url: string; init: RequestInit }>;
}

export function fakeFetch(
  body: ReadableStream<Uint8Array> | null | (() => ReadableStream<Uint8Array>),
  init: { status?: number; json?: unknown; headers?: Record<string, string> } = {},
): FakeFetchResult {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const status = init.status ?? 200;
  // A real server hands every request its own response body. A test that sends
  // twice through one provider must therefore pass a factory: the decoder locks
  // whatever stream it reads the instant it starts pulling, even if the caller
  // never drains the result, so a second call handed the same stream object
  // would find it already disturbed. Do not fork a single stream with `tee()`
  // instead — cancelling one branch leaves the underlying source running, and
  // the cancellation tests assert that cancelling the response reaches the body.
  const impl = (async (url: string, requestInit: RequestInit) => {
    calls.push({ url, init: requestInit });
    if (init.json !== undefined) {
      return new Response(JSON.stringify(init.json), { status, headers: init.headers });
    }

    const out = typeof body === 'function' ? body() : body;

    // A real fetch errors the body stream when its signal aborts. Reproduce that
    // by piping through the signal rather than cancelling the body directly:
    // `new Response(body).body` IS `body`, the decoder has already locked it, and
    // cancelling a locked stream rejects — which would make the abort test hang
    // rather than fail. Taking the signal from the request also proves the
    // adapter forwarded it.
    const wired =
      out && requestInit?.signal
        ? out.pipeThrough(new TransformStream(), { signal: requestInit.signal })
        : out;

    return new Response(wired, { status, headers: init.headers });
  }) as unknown as typeof globalThis.fetch;

  return { fetch: impl, calls };
}

export async function readAll(stream: ReadableStream<string>): Promise<string> {
  const reader = stream.getReader();
  let out = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    out += value;
  }
  return out;
}
