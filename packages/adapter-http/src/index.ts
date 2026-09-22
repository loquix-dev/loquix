import type { AgentProvider, AgentResponse } from '@loquix/core';
import { errorFromResponse, HttpAgentError, performRequest } from './request.js';
import { decode } from './transports.js';
import type { HttpAgentProviderOptions } from './types.js';

export type { HttpAgentProviderOptions, HttpTransport } from './types.js';
export { HttpAgentError } from './request.js';

let counter = 0;
const nextId = () => globalThis.crypto?.randomUUID?.() ?? `http-${Date.now()}-${++counter}`;

export function createHttpAgentProvider(options: HttpAgentProviderOptions): AgentProvider {
  return {
    name: options.name ?? 'HTTP',
    async send(messages, sendOptions): Promise<AgentResponse> {
      const response = await performRequest(options, messages, sendOptions);

      if (!response.ok) {
        throw await errorFromResponse(response);
      }

      if (!response.body) {
        throw new HttpAgentError(502, 'HTTP 502: response had no body');
      }

      const transport = options.transport ?? 'sse';

      return {
        id: nextId(),
        stream: decode(response.body, transport, options.parse),
      };
    },
  };
}
