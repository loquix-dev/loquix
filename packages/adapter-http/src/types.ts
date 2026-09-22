import type { AgentMessage, AgentSendOptions } from '@loquix/core';

export type HttpTransport = 'sse' | 'ndjson' | 'text';

export interface HttpAgentProviderOptions {
  url: string | ((messages: AgentMessage[], options: AgentSendOptions) => string);
  name?: string;
  transport?: HttpTransport;
  headers?:
    | Record<string, string>
    | (() => Record<string, string> | Promise<Record<string, string>>);
  credentials?: RequestCredentials;
  body?: (messages: AgentMessage[], options: AgentSendOptions) => unknown;
  parse?: (chunk: string) => string | null;
  fetch?: typeof globalThis.fetch;
}
