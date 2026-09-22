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

## Documentation

See [loquix.dev](https://loquix.dev) for the full guide, including transport
options, custom parsing, and error handling.

## Security

This package holds no credentials. The URL it POSTs to is your own backend —
any provider API keys stay there, on your server, and never pass through this
library.
