import type { AgentProvider } from '@loquix/core';
import type { HttpAgentProviderOptions } from './types.js';

export type { HttpAgentProviderOptions, HttpTransport } from './types.js';

export function createHttpAgentProvider(options: HttpAgentProviderOptions): AgentProvider {
  return {
    name: options.name ?? 'HTTP',
    async send() {
      throw new Error('not implemented');
    },
  };
}
