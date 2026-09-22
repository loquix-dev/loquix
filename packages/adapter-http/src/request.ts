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
  const payload = options.body
    ? options.body(messages, sendOptions)
    : defaultBody(messages, sendOptions);
  const doFetch = options.fetch ?? globalThis.fetch;

  return doFetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...extra },
    body: JSON.stringify(payload),
    credentials: options.credentials ?? 'same-origin',
    signal: sendOptions.signal,
  });
}
