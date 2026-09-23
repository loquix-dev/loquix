---
'@loquix/core': minor
---

Fix `AgentController`'s `sendTimeout` cutting off long-running responses, and add `streamIdleTimeout`.

Previously, `sendTimeout` (default 60s) was composed into the same abort
signal that was handed to `provider.send()` for the entire lifetime of that
signal. A provider that forwards the signal to `fetch` — which is the correct
thing to do, and what `@loquix/adapter-http` does — had the timeout keep
running after the response stream was returned, silently aborting the body.
**Any response that streamed for longer than `sendTimeout` in total was cut
off mid-sentence, moved the controller to `error`, and was never appended to
`messages` — even though the provider had already started responding
normally.**

`sendTimeout` now bounds only the wait for `provider.send()` to resolve with
a stream, matching its documented intent. Once that promise settles, the
timeout is cleared and has no further effect — a stream can now run as long
as it needs to. A negative `sendTimeout` (e.g. `-1`) no longer throws a `RangeError`; it is
treated as disabled, the same as `0`, and a non-finite one falls back to the
default rather than silently removing the guard — the same rule
`UploadController` already applies to its own numeric options.

To fill the gap this leaves — a server that returns headers and then goes
quiet forever — there's a new `streamIdleTimeout` option (default 60_000,
`0` disables). It aborts the stream only when no chunk has arrived for that
long, resetting on every chunk, so a long-but-healthy response is never
punished — only actual silence is. A paused stream is exempt: pausing
suspends idle detection for as long as it's paused.

Because `@loquix/react` is linked with `@loquix/core` in this repo's
changesets config, it receives the same version bump even though none of its
own code changed.

`StreamingController.connect()` takes an optional second argument carrying
that timeout. The parameter is optional, so existing calls are unaffected.

**If you previously set `sendTimeout: 0` to disable timeouts entirely, you
must now also set `streamIdleTimeout: 0`.** `streamIdleTimeout` is a new
option and defaults to _on_ (60_000), so that exact 0.5.0 opt-out
configuration no longer means "no timeouts" — it now arms a 60-second idle
timer against the response stream it never used to touch. If your backend
has a normal gap of more than 60s between chunks (a long-running tool call, a
cold start, a slow retrieval hop), you will start seeing a new failure there:
`onError` fires with a `DOMException` named `TimeoutError`
(`"StreamingController: no chunk received within streamIdleTimeout"`), the
controller moves to `error`, and whatever the stream had already produced is
discarded rather than appended to `messages`. Set `streamIdleTimeout: 0`
alongside `sendTimeout: 0` to restore the old "never times out" behavior.

Separately, `sendTimeout`/`streamIdleTimeout` now treat `±Infinity` as an
explicit "no timeout" (equivalent to `0`) rather than falling back to the
default — see `sanitizeTimeoutMs`'s own doc comment for the reasoning. Only
`NaN` (and other non-finite-but-not-infinite garbage) still falls back to the
default.
