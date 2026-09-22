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
  body: ReadableStream<Uint8Array> | null,
  init: { status?: number; json?: unknown } = {},
): FakeFetchResult {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const status = init.status ?? 200;

  const impl = (async (url: string, requestInit: RequestInit) => {
    calls.push({ url, init: requestInit });
    if (init.json !== undefined) {
      return new Response(JSON.stringify(init.json), { status });
    }
    // A real fetch errors the body stream when its signal aborts. Reproduce that
    // by piping through the signal rather than cancelling the body directly:
    // `new Response(body).body` IS `body`, the decoder has already locked it, and
    // cancelling a locked stream rejects — which would make the abort test hang
    // rather than fail. Taking the signal from the request also proves the
    // adapter forwarded it.
    const wired =
      body && requestInit?.signal
        ? body.pipeThrough(new TransformStream(), { signal: requestInit.signal })
        : body;

    return new Response(wired, { status });
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
