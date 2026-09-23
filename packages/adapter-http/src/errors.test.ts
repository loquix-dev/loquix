import { expect } from '@open-wc/testing';
import { createHttpAgentProvider, HttpAgentError } from './index.js';
import { fakeFetch, sseBody, readAll, userMessage } from './test-helpers.js';

describe('errors', () => {
  it('rejects with the status on a non-2xx response', async () => {
    const { fetch } = fakeFetch(null, { status: 503, json: { message: 'upstream busy' } });
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    let caught: unknown;
    try {
      await provider.send([userMessage('hi')], {});
    } catch (error) {
      caught = error;
    }

    expect(caught).to.be.instanceOf(HttpAgentError);
    expect((caught as HttpAgentError).status).to.equal(503);
    expect((caught as Error).message).to.contain('upstream busy');
  });

  it('still rejects when the error body is not JSON', async () => {
    const { fetch } = fakeFetch(null, { status: 500 });
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    let caught: unknown;
    try {
      await provider.send([userMessage('hi')], {});
    } catch (error) {
      caught = error;
    }

    expect((caught as HttpAgentError).status).to.equal(500);
  });

  it('rejects with an HttpAgentError carrying the real status when the response has no body', async () => {
    // A no-content success status (204) is a realistic case for "no body" — the
    // error must report what the server actually said, not a fabricated 502.
    const { fetch } = fakeFetch(null, { status: 204 });
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    let caught: unknown;
    try {
      await provider.send([userMessage('hi')], {});
    } catch (error) {
      caught = error;
    }

    expect(caught).to.be.instanceOf(HttpAgentError);
    expect((caught as HttpAgentError).status).to.equal(204);
    expect((caught as Error).message).to.contain('204');
  });

  it('extracts the nested message from an OpenAI/Anthropic-style error body', async () => {
    // Measured against a real 429: {"error":{"message":"Rate limit reached…","code":"rate_limit_exceeded"}}
    // used to yield only "HTTP 429: Too Many Requests" because `typeof
    // body.message === 'string'` rejected the nested object.
    const { fetch } = fakeFetch(null, {
      status: 429,
      json: { error: { message: 'Rate limit reached for requests', code: 'rate_limit_exceeded' } },
    });
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    let caught: unknown;
    try {
      await provider.send([userMessage('hi')], {});
    } catch (error) {
      caught = error;
    }

    expect((caught as Error).message).to.contain('Rate limit reached for requests');
  });

  it('stringifies a FastAPI-style validation-error detail array', async () => {
    // Measured against a real 422: {"detail":[{"loc":[...],"msg":"field required"}]}
    // used to yield only "HTTP 422: Unprocessable Entity".
    const { fetch } = fakeFetch(null, {
      status: 422,
      json: { detail: [{ loc: ['body', 'model'], msg: 'field required', type: 'value_error' }] },
    });
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    let caught: unknown;
    try {
      await provider.send([userMessage('hi')], {});
    } catch (error) {
      caught = error;
    }

    expect((caught as Error).message).to.contain('field required');
  });

  it('carries the parsed body on the error, for a consumer that wants e.g. a retry_after', async () => {
    const { fetch } = fakeFetch(null, {
      status: 429,
      json: { error: { message: 'slow down', code: 'rate_limit_exceeded', retry_after: 30 } },
    });
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    let caught: unknown;
    try {
      await provider.send([userMessage('hi')], {});
    } catch (error) {
      caught = error;
    }

    const body = (caught as HttpAgentError).body as { error: { retry_after: number } };
    expect(body.error.retry_after).to.equal(30);
  });

  it('does not hang awaiting .json() on a non-JSON, still-open error body', async () => {
    // Measured: a 500 with content-type: text/event-stream that writes one
    // frame and never closes left `errorFromResponse`'s `.json()` pending
    // indefinitely, which left `send()` pending indefinitely too.
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: still going\n\n'));
        // Deliberately never closed.
      },
    });
    const { fetch } = fakeFetch(body, {
      status: 500,
      headers: { 'content-type': 'text/event-stream' },
    });
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    let caught: unknown;
    try {
      await provider.send([userMessage('hi')], {});
    } catch (error) {
      caught = error;
    }

    expect(caught).to.be.instanceOf(HttpAgentError);
    expect((caught as HttpAgentError).status).to.equal(500);
  });

  it('sets code "http" for a non-2xx response', async () => {
    const { fetch } = fakeFetch(null, { status: 503, json: { message: 'upstream busy' } });
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    let caught: unknown;
    try {
      await provider.send([userMessage('hi')], {});
    } catch (error) {
      caught = error;
    }

    expect((caught as HttpAgentError).code).to.equal('http');
  });

  it('sets code "no_body" when the response has no body', async () => {
    const { fetch } = fakeFetch(null, { status: 204 });
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    let caught: unknown;
    try {
      await provider.send([userMessage('hi')], {});
    } catch (error) {
      caught = error;
    }

    expect((caught as HttpAgentError).code).to.equal('no_body');
  });
});

describe('cancellation', () => {
  it('cancels the underlying body when the consumer cancels', async () => {
    let cancelled = 0;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode('data: first\n\n'));
        controller.enqueue(encoder.encode('data: second\n\n'));
      },
      cancel() {
        cancelled += 1;
      },
    });
    const { fetch } = fakeFetch(body);
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});
    const reader = response.stream.getReader();
    const { value } = await reader.read();
    await reader.cancel();

    expect(value).to.equal('first');
    expect(cancelled, 'the response body must be cancelled too').to.equal(1);
  });

  it('errors the stream when the send signal aborts mid-response', async () => {
    const controller = new AbortController();
    let cancelled = 0;
    const body = new ReadableStream<Uint8Array>({
      start(bodyController) {
        bodyController.enqueue(new TextEncoder().encode('data: first\n\n'));
      },
      cancel() {
        cancelled += 1;
      },
    });
    const { fetch } = fakeFetch(body);
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], { signal: controller.signal });
    const reader = response.stream.getReader();
    await reader.read();
    controller.abort();

    let caught: unknown;
    try {
      await reader.read();
    } catch (error) {
      caught = error;
    }

    expect(caught).to.be.instanceOf(DOMException);
    expect((caught as DOMException).name).to.equal('AbortError');
    expect(cancelled).to.equal(1);
  });

  it('cancels the underlying body after [DONE], even if the server never closes it', async () => {
    let cancelled = 0;
    const body = new ReadableStream<Uint8Array>({
      start(bodyController) {
        const encoder = new TextEncoder();
        bodyController.enqueue(encoder.encode('data: hello\n\n'));
        bodyController.enqueue(encoder.encode('data: [DONE]\n\n'));
        // Deliberately never closed: a server can hold the connection open
        // past the logical end of the reply, and the decoder must not depend
        // on it closing to stop reading.
      },
      cancel() {
        cancelled += 1;
      },
    });
    const { fetch } = fakeFetch(body);
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('hello');
    expect(cancelled, 'a body the server left open must still be cancelled').to.equal(1);
  });
});

describe('parse hook', () => {
  it('replaces the default payload handling', async () => {
    const { fetch } = fakeFetch(sseBody('{"choices":[{"delta":{"content":"x"}}]}', '[DONE]'));
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      fetch,
      parse: chunk => {
        const parsed = JSON.parse(chunk) as { choices: Array<{ delta: { content?: string } }> };
        return parsed.choices[0]?.delta?.content ?? null;
      },
    });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('x');
  });

  it('errors the stream with the exact error a throwing hook raises', async () => {
    const { fetch } = fakeFetch(sseBody('anything'));
    const boom = new Error('consumer parse hook exploded');
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      fetch,
      parse: () => {
        throw boom;
      },
    });

    const response = await provider.send([userMessage('hi')], {});

    let caught: unknown;
    try {
      await readAll(response.stream);
    } catch (error) {
      caught = error;
    }

    // The default parser swallows one malformed line so a network hiccup does
    // not fail the whole response. A throwing hook is different: it is the
    // consumer's own code, so its exception must come out unwrapped rather
    // than being treated like a parse failure and silently dropped.
    expect(caught).to.equal(boom);
  });
});
