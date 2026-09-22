import { expect } from '@open-wc/testing';
import { createHttpAgentProvider } from './index.js';
import { fakeFetch, sseBody, textBody, readAll, userMessage } from './test-helpers.js';

describe('sse transport', () => {
  it('concatenates data payloads', async () => {
    const { fetch } = fakeFetch(sseBody('Hel', 'lo', '[DONE]'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('Hello');
  });

  it('stops at [DONE] and ignores anything after it', async () => {
    const { fetch } = fakeFetch(sseBody('one', '[DONE]', 'two'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('one');
  });

  it('survives a payload split across two network chunks', async () => {
    const { fetch } = fakeFetch(
      new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode('data: par'));
          controller.enqueue(encoder.encode('tial\n\ndata: [DONE]\n\n'));
          controller.close();
        },
      }),
    );
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('partial');
  });

  it('joins several data lines in one frame', async () => {
    const { fetch } = fakeFetch(textBody('data: a\ndata: b\n\n'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('a\nb');
  });

  it('ignores event, id and comment lines', async () => {
    const { fetch } = fakeFetch(textBody(': keepalive\n\nevent: message\nid: 7\ndata: hi\n\n'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('hi');
  });

  it('accepts CRLF framing', async () => {
    const { fetch } = fakeFetch(textBody('data: a\r\n\r\ndata: [DONE]\r\n\r\n'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('a');
  });

  it('emits the last frame when the body ends without a separator', async () => {
    const { fetch } = fakeFetch(textBody('data: a\n\ndata: b'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('ab');
  });

  it('gives every response a distinct id', async () => {
    const { fetch } = fakeFetch(sseBody('[DONE]'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const first = await provider.send([userMessage('a')], {});
    const second = await provider.send([userMessage('b')], {});

    expect(first.id).to.be.a('string').and.not.equal(second.id);
  });
});
