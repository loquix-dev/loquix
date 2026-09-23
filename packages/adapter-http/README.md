# @loquix/adapter-http

Turn an HTTP endpoint into a Loquix `AgentProvider`. It POSTs the conversation
to a URL you supply and streams the response back as text, whether your
backend replies with server-sent events, newline-delimited JSON, or plain
text.

## Install

```bash
npm install @loquix/adapter-http
```

Peer dependency: `@loquix/core`.

## Quick Start

```ts
import { createHttpAgentProvider } from '@loquix/adapter-http';

const provider = createHttpAgentProvider({
  url: '/api/chat',
});
```

Pass `provider` to `AgentController` (or any `@loquix/core` component that
takes an `AgentProvider`) the same way you would a hand-written one.

By default the adapter POSTs `{ messages, model, params, systemPrompt }` and
reads the response as server-sent events. Set `transport: 'ndjson'` or
`transport: 'text'` to match your backend, or supply `body`, `headers`,
`parse`, and `fetch` to adjust the request and the streamed payload.

**Note on `sse` and JSON payloads:** the default `sse` parser returns each
frame's `data:` payload verbatim — it does not parse JSON, unlike `ndjson`,
which extracts a `text`/`content`/`delta` field automatically. If your
backend sends SSE frames like `data: {"text":"Hi"}`, the Quick Start above
will render that raw JSON string in the chat. Add a `parse` hook to extract
the field yourself:

```ts
const provider = createHttpAgentProvider({
  url: '/api/chat',
  parse: chunk => (JSON.parse(chunk) as { text: string }).text,
});
```

**Close the response, or send `[DONE]`.** The adapter stops reading only when
your handler closes the response body (SSE/ndjson) or sends the `[DONE]`
sentinel — whichever your backend does. If you're fronting a hand-rolled
backend, make sure every code path ends the response: a handler that returns
early without calling `res.end()` (or the equivalent in your framework) leaves
the connection open, and the chat UI keeps showing a streaming indicator
forever even though the model has nothing left to say.

## Documentation

See the [package source and tests](https://github.com/loquix-dev/loquix/tree/main/packages/adapter-http)
in the Loquix repository for the full set of options, transport behavior, and
error handling.

## Security

This package holds no credentials. The URL it POSTs to is your own backend —
any provider API keys stay there, on your server, and never pass through this
library.
