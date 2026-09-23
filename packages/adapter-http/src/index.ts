import type { AgentProvider, AgentResponse } from '@loquix/core';
import { errorFromResponse, HttpAgentError, performRequest } from './request.js';
import { decode } from './transports.js';
import type { HttpAgentProviderOptions } from './types.js';

export type { HttpAgentProviderOptions, HttpTransport } from './types.js';
export type { HttpAgentErrorCode } from './request.js';
export type { SseFrameMeta } from './transports.js';
export { HttpAgentError } from './request.js';

let counter = 0;
const nextId = () => globalThis.crypto?.randomUUID?.() ?? `http-${Date.now()}-${++counter}`;

const VALID_TRANSPORTS = ['sse', 'ndjson', 'text'] as const;

export function createHttpAgentProvider(options: HttpAgentProviderOptions): AgentProvider {
  if (options.transport !== undefined && !VALID_TRANSPORTS.includes(options.transport)) {
    throw new Error(
      `Unknown transport "${String(options.transport)}"; expected "sse", "ndjson", or "text".`,
    );
  }

  // Under transport: 'text', a chunk boundary is wherever the network happened
  // to segment the TCP stream — not something a `parse` hook can reason about
  // or a consumer can control. The same body split differently across chunks
  // produces a different result from the same hook, which is correctness that
  // depends on network timing rather than on anything in this library or the
  // caller's code. This is a configuration mistake, not something to document
  // around: loosening the restriction later would not be a breaking change,
  // but changing established per-chunk semantics to per-body later would be.
  if (options.transport === 'text' && options.parse) {
    throw new Error(
      'transport: "text" cannot be combined with parse: chunk boundaries under "text" follow ' +
        'arbitrary TCP segmentation, so a parse hook would see a different split of the same body ' +
        'on every request. Transform the text after it leaves the stream instead.',
    );
  }

  return {
    name: options.name ?? 'HTTP',
    async send(messages, sendOptions): Promise<AgentResponse> {
      const response = await performRequest(options, messages, sendOptions);

      if (!response.ok) {
        throw await errorFromResponse(response);
      }

      if (!response.body) {
        throw new HttpAgentError(
          response.status,
          `HTTP ${response.status}: response had no body`,
          'no_body',
        );
      }

      const transport = options.transport ?? 'sse';

      return {
        id: nextId(),
        stream: decode(response.body, transport, options.parse, {
          status: response.status,
          contentType: response.headers.get('content-type'),
          redirected: response.redirected,
          url: response.url,
        }),
      };
    },
  };
}
