import type { AgentMessage, AgentSendOptions } from '@loquix/core';
import type { HttpAgentProviderOptions, HttpTransport } from './types.js';

// The wildcard fallback keeps this a hint to proxies/servers doing content
// negotiation rather than a hard constraint: a server that would 406 a bare
// `Accept: text/event-stream` still has a fallback to match against.
const ACCEPT_BY_TRANSPORT: Record<HttpTransport, string> = {
  sse: 'text/event-stream, */*;q=0.1',
  ndjson: 'application/x-ndjson, */*;q=0.1',
  text: 'text/plain, */*;q=0.1',
};

export function defaultBody(messages: AgentMessage[], options: AgentSendOptions): unknown {
  return {
    messages,
    model: options.model,
    params: options.params,
    systemPrompt: options.systemPrompt,
  };
}

export class HttpAgentError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpAgentError';
    this.status = status;
  }
}

export async function errorFromResponse(response: Response): Promise<HttpAgentError> {
  let detail = response.statusText || 'request failed';
  try {
    const body = (await response.json()) as Record<string, unknown>;
    const message = body.message ?? body.error;
    if (typeof message === 'string') detail = message;
  } catch {
    // A non-JSON error body is normal; the status carries the meaning.
  }
  return new HttpAgentError(response.status, `HTTP ${response.status}: ${detail}`);
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
  const transport = options.transport ?? 'sse';

  return doFetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: ACCEPT_BY_TRANSPORT[transport],
      ...lowerExtra,
    },
    body: JSON.stringify(payload),
    credentials: options.credentials ?? 'same-origin',
    signal: sendOptions.signal,
  });
}
