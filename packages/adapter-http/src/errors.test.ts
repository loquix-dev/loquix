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

  it('rejects with an HttpAgentError when the response has no body', async () => {
    const { fetch } = fakeFetch(null);
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    let caught: unknown;
    try {
      await provider.send([userMessage('hi')], {});
    } catch (error) {
      caught = error;
    }

    expect(caught).to.be.instanceOf(HttpAgentError);
    expect((caught as HttpAgentError).status).to.equal(502);
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

    let rejected = false;
    try {
      await reader.read();
    } catch {
      rejected = true;
    }

    expect(rejected, 'an aborted send must surface on the stream').to.be.true;
    expect(cancelled).to.equal(1);
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
});
