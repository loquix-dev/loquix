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
