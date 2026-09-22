import type { AgentMessage, AgentSendOptions } from '@loquix/core';
import type { HttpAgentProviderOptions } from './types.js';

export function defaultBody(messages: AgentMessage[], options: AgentSendOptions): unknown {
  return {
    messages,
    model: options.model,
    params: options.params,
    systemPrompt: options.systemPrompt,
  };
}

export async function performRequest(
  options: HttpAgentProviderOptions,
  messages: AgentMessage[],
  sendOptions: AgentSendOptions,
): Promise<Response> {
  const url = typeof options.url === 'function' ? options.url(messages, sendOptions) : options.url;
  const extra =
    typeof options.headers === 'function' ? await options.headers() : (options.headers ?? {});
  // Header names are case-insensitive in HTTP; lowercase the caller's keys before
  // merging so e.g. `Content-Type` overrides our `content-type` default instead of
  // sitting beside it as a second, distinct property.
  const lowerExtra = Object.fromEntries(
    Object.entries(extra).map(([key, value]) => [key.toLowerCase(), value]),
  );
  const payload = options.body
    ? options.body(messages, sendOptions)
    : defaultBody(messages, sendOptions);
  const doFetch = options.fetch ?? globalThis.fetch;

  return doFetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...lowerExtra },
    body: JSON.stringify(payload),
    credentials: options.credentials ?? 'same-origin',
    signal: sendOptions.signal,
  });
}
