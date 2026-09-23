import type { AgentMessage, AgentSendOptions } from '@loquix/core';
import type { SseFrameMeta } from './transports.js';

/**
 * How the response body is framed and decoded into text chunks.
 *
 * - `'sse'` (default): server-sent events. Frames are separated by a blank
 *   line; the `data:` line(s) of each frame are joined and passed to `parse`
 *   (or, with no `parse`, returned verbatim — the default sse handling does
 *   not parse JSON out of the payload, unlike `ndjson`).
 * - `'ndjson'`: newline-delimited JSON. Each line is parsed as JSON and, with
 *   no `parse` hook, its `text` / `content` / `delta` field (whichever is
 *   present) is used.
 * - `'text'`: the raw body text, chunked however the network happened to
 *   deliver it. Cannot be combined with `parse` — see `parse` below.
 */
export type HttpTransport = 'sse' | 'ndjson' | 'text';

export interface HttpAgentProviderOptions {
  /**
   * The endpoint to POST to. Either a fixed URL, or a function of the
   * outgoing messages and send options — e.g. to route by conversation id or
   * model.
   */
  url: string | ((messages: AgentMessage[], options: AgentSendOptions) => string);

  /** The provider's display name. Default: `'HTTP'`. */
  name?: string;

  /** How to frame and decode the response body. Default: `'sse'`. */
  transport?: HttpTransport;

  /**
   * Extra request headers, merged over this adapter's own `content-type` and
   * `accept` defaults (header names are matched case-insensitively, so e.g.
   * `Content-Type` here overrides the default rather than sitting beside it).
   * A function is called on every send and may be async, so a token can be
   * refreshed just-in-time rather than baked in once at construction.
   */
  headers?:
    | Record<string, string>
    | (() => Record<string, string> | Promise<Record<string, string>>);

  /** Forwarded to `fetch` as `credentials`. Default: `'same-origin'`. */
  credentials?: RequestCredentials;

  /**
   * Builds the request payload from the outgoing messages and send options.
   * Default sends `{ messages, model, params, systemPrompt }`.
   *
   * A `string` return value is sent as the request body as-is (assumed
   * already serialized); any other value is JSON-encoded.
   */
  body?: (messages: AgentMessage[], options: AgentSendOptions) => unknown;

  /**
   * Transforms a decoded payload into the text to enqueue, or `null` to skip
   * it (e.g. to drop a tool-call/metadata/heartbeat frame). Called with the
   * `data:` payload for `sse`, the raw line for `ndjson`; for `sse` the
   * frame's `event:` and `id:` lines are also passed as `frame` — the only
   * way to see a discriminator some backends (e.g. LangServe) put only in
   * `event:` and never in the payload itself, such as `event: error` framing
   * a failure that would otherwise render as ordinary assistant text.
   *
   * A return value that isn't a string or `null` (a hook returning a number,
   * for instance) is coerced with `String(...)` rather than silently dropped.
   *
   * Not called for a payload of exactly `[DONE]` (after trimming whitespace):
   * that sentinel is intercepted before `parse` runs and always ends the
   * stream, so a hook that accumulates state across calls never sees an end
   * signal — end the accumulation some other way (e.g. on stream close).
   *
   * Cannot be combined with `transport: 'text'`: chunk boundaries under
   * `'text'` follow arbitrary TCP segmentation, so the same body could be
   * split differently across requests, making `parse`'s output not
   * reproducible. Passing both throws at construction time.
   */
  parse?: (chunk: string, frame?: SseFrameMeta) => string | null;

  /** Overrides `globalThis.fetch`, e.g. to inject a test double or a wrapped client. */
  fetch?: typeof globalThis.fetch;
}
