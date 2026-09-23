---
'@loquix/adapter-http': minor
---

Add `@loquix/adapter-http`, which turns an HTTP endpoint into an `AgentProvider`.

`AgentProvider` has existed since the first release with no implementation to
point at, so every integration started by writing streaming, cancellation and
error handling by hand. This package covers the shape almost everyone needs: a
POST to your own backend returning server-sent events, newline-delimited JSON, or
plain text.

It has no runtime dependencies and holds no credentials — the endpoint it calls
is yours, which is what keeps provider keys on the server where they belong.
