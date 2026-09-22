import type { AgentProvider, AgentResponse } from '@loquix/core';
import { performRequest } from './request.js';
import { decode } from './transports.js';
import type { HttpAgentProviderOptions } from './types.js';

export type { HttpAgentProviderOptions, HttpTransport } from './types.js';

let counter = 0;
const nextId = () => globalThis.crypto?.randomUUID?.() ?? `http-${Date.now()}-${++counter}`;

export function createHttpAgentProvider(options: HttpAgentProviderOptions): AgentProvider {
  return {
    name: options.name ?? 'HTTP',
    async send(messages, sendOptions): Promise<AgentResponse> {
      const response = await performRequest(options, messages, sendOptions);
      const transport = options.transport ?? 'sse';

      return {
        id: nextId(),
        stream: decode(response.body as ReadableStream<Uint8Array>, transport, options.parse),
      };
    },
  };
}
