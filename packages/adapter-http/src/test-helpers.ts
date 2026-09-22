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
  // A real server hands every request its own response body. This fake is given
  // only one body up front, so it must fork it per call rather than handing the
  // same stream object to two `send()`s — the decoder locks whatever stream it
  // reads from the instant it starts pulling, even if the caller never drains
  // the result, so a second call reusing the original object would find it
  // already disturbed. `tee()` gives each call an independent branch that still
  // sees the same bytes in the same chunks, so chunk-boundary tests (a payload
  // arriving split across two `enqueue` calls) still see that split.
  let remaining = body;

  const impl = (async (url: string, requestInit: RequestInit) => {
    calls.push({ url, init: requestInit });
    if (init.json !== undefined) {
      return new Response(JSON.stringify(init.json), { status });
    }

    let out: ReadableStream<Uint8Array> | null = null;
    if (remaining) {
      const [branch, rest] = remaining.tee();
      remaining = rest;
      out = branch;
    }

    // A real fetch errors the body stream when its signal aborts. Reproduce that
    // by piping through the signal rather than cancelling the body directly:
    // cancelling a tee'd branch only cancels that branch (the other branch, and
    // the underlying source, keep going), so an abort would never surface as an
    // error on this branch — pipeThrough's signal option is what actually errors
    // the branch the decoder is reading. Taking the signal from the request also
    // proves the adapter forwarded it.
    const wired =
      out && requestInit?.signal
        ? out.pipeThrough(new TransformStream(), { signal: requestInit.signal })
        : out;

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
