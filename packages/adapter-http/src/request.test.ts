import { expect } from '@open-wc/testing';
import { createHttpAgentProvider } from './index.js';
import { fakeFetch, sseBody, ndjsonBody, userMessage } from './test-helpers.js';

describe('request', () => {
  it('posts JSON with the messages and the send options', async () => {
    const { fetch, calls } = fakeFetch(sseBody('hi', '[DONE]'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    await provider.send([userMessage('hello')], { model: 'gpt-x', systemPrompt: 'be brief' });

    expect(calls).to.have.lengthOf(1);
    expect(calls[0].url).to.equal('/api/chat');
    expect(calls[0].init.method).to.equal('POST');
    const body = JSON.parse(calls[0].init.body as string);
    expect(body.messages[0].content).to.equal('hello');
    expect(body.model).to.equal('gpt-x');
    expect(body.systemPrompt).to.equal('be brief');
  });

  it('resolves a function url against the messages', async () => {
    const { fetch, calls } = fakeFetch(sseBody('[DONE]'));
    const provider = createHttpAgentProvider({
      url: messages => `/api/chat/${messages.length}`,
      fetch,
    });

    await provider.send([userMessage('a'), userMessage('b')], {});

    expect(calls[0].url).to.equal('/api/chat/2');
  });

  it('awaits an async headers function', async () => {
    const { fetch, calls } = fakeFetch(sseBody('[DONE]'));
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      headers: async () => ({ authorization: 'Bearer fresh' }),
      fetch,
    });

    await provider.send([userMessage('a')], {});

    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.authorization).to.equal('Bearer fresh');
    expect(headers['content-type']).to.equal('application/json');
  });

  it('uses a custom body builder when given one', async () => {
    const { fetch, calls } = fakeFetch(sseBody('[DONE]'));
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      body: messages => ({ prompt: messages[0].content }),
      fetch,
    });

    await provider.send([userMessage('only this')], {});

    expect(JSON.parse(calls[0].init.body as string)).to.deep.equal({ prompt: 'only this' });
  });

  it('passes the abort signal through', async () => {
    const { fetch, calls } = fakeFetch(sseBody('[DONE]'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });
    const controller = new AbortController();

    await provider.send([userMessage('a')], { signal: controller.signal });

    expect(calls[0].init.signal).to.equal(controller.signal);
  });

  it('defaults credentials to same-origin', async () => {
    const { fetch, calls } = fakeFetch(sseBody('[DONE]'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    await provider.send([userMessage('a')], {});

    expect(calls[0].init.credentials).to.equal('same-origin');
  });

  it('lets an explicit credentials option override the default', async () => {
    const { fetch, calls } = fakeFetch(sseBody('[DONE]'));
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      credentials: 'include',
      fetch,
    });

    await provider.send([userMessage('a')], {});

    expect(calls[0].init.credentials).to.equal('include');
  });

  it('lets a differently-cased caller header override the default content-type', async () => {
    const { fetch, calls } = fakeFetch(sseBody('[DONE]'));
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      headers: { 'Content-Type': 'text/plain' },
      fetch,
    });

    await provider.send([userMessage('a')], {});

    const headers = calls[0].init.headers as Record<string, string>;
    expect(
      Object.keys(headers).filter(key => key.toLowerCase() === 'content-type'),
    ).to.have.lengthOf(1);
    expect(headers['content-type']).to.equal('text/plain');
  });

  it('derives an Accept header from the sse transport', async () => {
    const { fetch, calls } = fakeFetch(sseBody('[DONE]'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    await provider.send([userMessage('a')], {});

    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.accept).to.equal('text/event-stream');
  });

  it('derives a different Accept header for the ndjson transport', async () => {
    const { fetch, calls } = fakeFetch(ndjsonBody({ text: 'x' }));
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'ndjson', fetch });

    await provider.send([userMessage('a')], {});

    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.accept).to.equal('application/x-ndjson');
  });

  it('lets a caller-supplied Accept header override the transport default', async () => {
    const { fetch, calls } = fakeFetch(sseBody('[DONE]'));
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      headers: { Accept: 'application/json' },
      fetch,
    });

    await provider.send([userMessage('a')], {});

    const headers = calls[0].init.headers as Record<string, string>;
    expect(Object.keys(headers).filter(key => key.toLowerCase() === 'accept')).to.have.lengthOf(1);
    expect(headers.accept).to.equal('application/json');
  });
});
