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

/**
 * What kind of failure produced an `HttpAgentError`, since the same class
 * covers three unrelated situations that a message string alone cannot be
 * reliably told apart by (string-matching a message makes it public API the
 * moment a consumer does it):
 *
 * - `'http'`: the response's status was not 2xx.
 * - `'no_body'`: the response was 2xx but had no body to stream.
 * - `'transport_mismatch'`: the body never produced a single frame recognizable
 *   as the configured `transport` — carries the response's real status (often
 *   200), not a fabricated one.
 */
export type HttpAgentErrorCode = 'http' | 'no_body' | 'transport_mismatch';

export class HttpAgentError extends Error {
  readonly status: number;
  readonly code: HttpAgentErrorCode;
  /**
   * The parsed JSON error body, when the response had one (`code: 'http'`
   * only). The constructor always assigns this field, so `'body' in err` is
   * `true` even when there was no body to parse — check `err.body !==
   * undefined` instead.
   */
  readonly body?: unknown;

  constructor(status: number, message: string, code: HttpAgentErrorCode = 'http', body?: unknown) {
    super(message);
    this.name = 'HttpAgentError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

/**
 * Pull a human-readable message out of a non-string error field. Handles the
 * FastAPI validation-error shape (`detail: [{ loc, msg, type }, ...]`) by
 * joining each item's `msg`, and falls back to `JSON.stringify` for any other
 * object shape rather than surfacing `"[object Object]"`.
 */
function stringifyMessage(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return undefined;

  if (Array.isArray(value)) {
    const parts = value
      .map(item =>
        item && typeof item === 'object' && typeof (item as { msg?: unknown }).msg === 'string'
          ? (item as { msg: string }).msg
          : undefined,
      )
      .filter((part): part is string => part !== undefined);
    if (parts.length) return parts.join('; ');
  }

  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

export async function errorFromResponse(response: Response): Promise<HttpAgentError> {
  let detail = response.statusText || 'request failed';
  let body: unknown;

  // Only attempt to read the body as JSON when the content-type says it is.
  // Awaiting `.json()` on an SSE/streaming error body (a 500 that opens
  // `content-type: text/event-stream` and never closes) hangs this promise
  // forever for a non-JSON body, since `.json()` waits for the stream to
  // end. This gate only fixes that one case — a body that *does* declare
  // `application/json` but never closes still hangs here until the caller's
  // own signal aborts it.
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('json')) {
    try {
      body = await response.json();
      if (body && typeof body === 'object') {
        const record = body as Record<string, unknown>;
        const errorField = record.error;
        const nestedMessage =
          errorField && typeof errorField === 'object' && !Array.isArray(errorField)
            ? (errorField as Record<string, unknown>).message
            : undefined;
        const message = record.message ?? nestedMessage ?? errorField ?? record.detail;
        const stringified = stringifyMessage(message);
        if (stringified) detail = stringified;
      }
    } catch {
      // A non-JSON error body is normal; the status carries the meaning.
    }
  }

  return new HttpAgentError(response.status, `HTTP ${response.status}: ${detail}`, 'http', body);
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
  // A `body` builder that already returns a serialized string (its own
  // protocol, or a pre-encoded JSON string) is sent as-is; anything else is
  // JSON-encoded as before. Without this, a string return value would be
  // JSON-encoded a second time — wrapped in quotes with its own quotes
  // escaped — which is never what a caller returning a string intended.
  const requestBody = typeof payload === 'string' ? payload : JSON.stringify(payload);

  return doFetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: ACCEPT_BY_TRANSPORT[transport],
      ...lowerExtra,
    },
    body: requestBody,
    credentials: options.credentials ?? 'same-origin',
    signal: sendOptions.signal,
  });
}
