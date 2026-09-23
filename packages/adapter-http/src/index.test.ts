import { expect } from '@open-wc/testing';
import { createHttpAgentProvider } from './index.js';

describe('createHttpAgentProvider', () => {
  it('produces a provider with a default name', () => {
    const provider = createHttpAgentProvider({ url: '/api/chat' });
    expect(provider.name).to.equal('HTTP');
  });

  it('accepts a custom name', () => {
    const provider = createHttpAgentProvider({ url: '/api/chat', name: 'My backend' });
    expect(provider.name).to.equal('My backend');
  });

  it('rejects an unknown transport at construction', () => {
    expect(() =>
      createHttpAgentProvider({
        url: '/api/chat',
        transport: 'xml' as unknown as 'sse',
      }),
    ).to.throw(/transport/i);
  });

  it('rejects transport: "text" combined with parse at construction', () => {
    expect(() =>
      createHttpAgentProvider({
        url: '/api/chat',
        transport: 'text',
        parse: chunk => chunk,
      }),
    ).to.throw(/parse/i);
  });
});
