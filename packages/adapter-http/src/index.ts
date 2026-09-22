import type { AgentProvider, AgentResponse } from '@loquix/core';
import { performRequest } from './request.js';
import type { HttpAgentProviderOptions } from './types.js';

export type { HttpAgentProviderOptions, HttpTransport } from './types.js';

export function createHttpAgentProvider(options: HttpAgentProviderOptions): AgentProvider {
  return {
    name: options.name ?? 'HTTP',
    async send(messages, sendOptions): Promise<AgentResponse> {
      await performRequest(options, messages, sendOptions);

      // The response body isn't decoded yet — that lands in the next task, which
      // also owns generating a real, unique id for this response.
      return {
        id: '',
        stream: new ReadableStream<string>({
          start(controller) {
            controller.close();
          },
        }),
      };
    },
  };
}
