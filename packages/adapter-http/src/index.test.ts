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
});
