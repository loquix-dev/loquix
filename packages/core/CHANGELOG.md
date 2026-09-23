# @loquix/core

## 0.6.0

### Minor Changes

- a4b5156: Fix `AgentController`'s `sendTimeout` cutting off long-running responses, and add `streamIdleTimeout`.

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
  treated as disabled, the same as `0`, and `NaN` falls back to the default
  rather than silently removing the guard — the same rule `UploadController`
  already applies to its own numeric options. (`±Infinity` is handled
  differently — see below.)

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
  that timeout. `connect()` itself defaults it to `0` (disabled), so a bare
  `connect(stream)` — every call that existed before this option was added —
  arms no idle timer and is genuinely unaffected. `AgentController` is the one
  caller that opts into the 60s default described above; it resolves that
  default itself before calling `connect()`, so its own behavior (unlike a
  direct `connect()` call) does change from 0.5.0 in exactly the way the rest
  of this note describes.

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

  `sanitizeTimeoutMs` also now clamps a finite value above `2_147_483_647` (the
  32-bit signed integer `setTimeout` actually accepts) down to that max, instead
  of passing it straight through. Measured: `setTimeout(fn, 2_147_483_648)`
  fires after 1ms, not after the enormous delay the caller asked for — the
  value silently overflows the 32-bit argument, so a very long `sendTimeout` or
  `streamIdleTimeout` used to fail almost instantly instead of effectively never.
  `±Infinity` remains the explicit way to disable a timeout entirely.

## 0.5.0

### Patch Changes

- 4d85316: Fix the popover in `loquix-citation-popover` closing before the pointer can
  reach it.

  The popover is placed with `offset(8)`, so roughly 8px of dead space sits
  between the chip and the panel. `mouseleave` on the chip closed the popover the
  moment the pointer entered that gap, which meant it could never be hovered — even
  though the panel carries its own `mouseenter` and `mouseleave` handlers, and
  shows a trailing external-link affordance, both of which only make sense if it is
  reachable.

  Pointer-driven closing now waits 120ms, and any `mouseenter` on either the chip
  or the popover cancels it, so crossing the gap keeps the panel open. Escape and
  blur still close immediately. The pending timer is cleared on disconnect.

  Note that this does not address the popover being painted under surrounding page
  chrome: its `z-index` is confined to whatever stacking context the host sits in,
  so a consumer layout that isolates the content area — for example one applying
  `isolation: isolate` to a main column — will still draw fixed sidebars over it.
  Escaping that needs the popover to render in the top layer, which is a larger
  change.

- 22d0182: Fix `--loquix-gallery-columns` being impossible to override on
  `loquix-example-gallery`.

  The grid read the column count from `--loquix-gallery-columns`, but the component
  also wrote that same property inline on the grid element from the `columns`
  property. An inline declaration beats anything a consumer can write from outside,
  so the documented custom property silently did nothing — neither a rule on the
  host nor an inline style on it had any effect, which ruled out the obvious use
  for it: dropping to fewer columns in a media query.

  The `columns` property now feeds a private `--_columns`, and the public property
  takes precedence over it. Setting `columns` behaves exactly as before; setting
  `--loquix-gallery-columns` from a stylesheet now wins. Added a regression test
  for the override, and switched the existing columns test from asserting the
  inline style to asserting the resolved track count.

- 61eee81: Fix selecting a preset in `loquix-parameter-panel` discarding every parameter the
  preset does not mention.

  `_handlePresetSelect` replaced the whole map with `{ ...preset.values }`. A
  preset that tunes only `temperature` therefore dropped the user's `max_tokens`,
  `stream`, and anything else they had set, and those controls silently fell back
  to their defaults on the next render. Presets that happened to list every
  parameter hid the problem, which is why the existing tests — which only assert
  the event detail and `activePreset` — did not catch it.

  Preset values are now merged over the current ones, so a preset changes what it
  names and leaves the rest alone. A preset that does list every parameter behaves
  exactly as before. Added a regression test covering a partial preset.

- f037b3f: Fix source chips and footer actions in `loquix-search-answer` being unreadable on
  dark themes.

  Both backgrounds fell back to a near-opaque white — `rgba(255, 255, 255, 0.72)`
  for `.source` and `rgba(255, 255, 255, 0.78)` for `.action`. Unlike the
  neighbouring `border-color` and `color` declarations, which chain through
  `--loquix-border-color` and `--loquix-text-secondary-color`, these two skipped
  the theme token and went straight to a literal. No theme defines
  `--loquix-search-answer-source-bg` or `--loquix-search-answer-action-bg`, so the
  light fallback won everywhere: on the dark theme the chips rendered as light
  surfaces carrying the dark theme's grey text, measuring 1.38:1 against a
  required 4.5:1.

  Both now fall back to `--loquix-surface-secondary-bg`, matching the pattern used
  by the surrounding properties. The dark theme reaches 5.78:1 and the light theme
  4.63:1, both above the 4.5:1 threshold. The light theme changes only in that the
  chips become opaque rather than 72% white over the answer tint. The two
  component-level custom properties still override as before.

- a0f0121: Fix the clear button opening the search surface in `loquix-search-dialog` and
  `loquix-search-panel`.

  Clicking the clear button on a closed `loquix-search-dialog` trigger cleared the
  query and opened the modal, because `loquix-search-input` let the click bubble to
  the host — which opens on `click` — and then refocused the input, which the host
  also treats as an open request via `focusin`. `loquix-search-panel` had both
  paths too. Hosts could not work around it: cancelling the click during capture
  also cancelled the clear.

  `loquix-search-input` now keeps the clear interaction to itself. It stops the
  clear click from propagating, and stops the `focusin` raised by the clear button
  taking focus and by the refocus that follows a clear. Ordinary focus, `input`,
  and `loquix-change` events are unaffected.

- a0f0121: Let `loquix-search-dialog` and `loquix-search-panel` show an empty or error state.

  Both wrapped their built-in `loquix-search-results` in a region hidden whenever
  `results` was empty, and neither forwarded `empty-text`. So the empty state that
  `loquix-search-results` already renders could never be seen through the dialog or
  the panel, and a message like "Service is too busy. Try again." had to be faked as
  a result row — which then got a rank number rendered in front of it.

  Both components now accept `empty-text` / `emptyText`, forward it to the results
  list, and keep the results region visible when an empty message is set with no
  results. `rank: null` on a `SearchResult` also opts a row out of numbering, in
  blended and sectioned layouts. Behaviour with no results and no empty message is
  unchanged: the region stays hidden.

## 0.4.1

### Patch Changes

- 7b6b593: Fix `loquix-search-input` rendering the "Ask AI" button in `mode="plain"`.

  `show-ask-affordance` used to win over `mode`, so the plain-mode surfaces of
  `loquix-search-dialog` and `loquix-search-panel` — which both set the attribute
  on their inner input unconditionally — still showed the button, and clicking it
  dispatched a `loquix-search-ask` event the host never opted into. Plain mode now
  suppresses the affordance regardless of `show-ask-affordance`.

## 0.4.0

### Minor Changes

- Add smart search primitives for AI-powered knowledge search workflows.
  - Add search input, footer, dialog, anchored panel, generated answer, source filters, result row, and result list components.
  - Add smart search lifecycle states, source/result data types, keyboard footer metadata, and typed search events.
  - Add Storybook docs, recipe examples, accessibility coverage, and behavioral tests for the new search surfaces.
  - Add React wrappers for all smart search components.

## 0.3.0

### Minor Changes

- 58729e2: Add five new components for surfacing assistant reasoning and tool use:
  - `loquix-reasoning-block` — collapsible "thinking" panel; streams content
    live; shows formatted duration + token count when done. User toggles
    win over later `status` / `defaultOpen` changes so streaming → done
    doesn't re-open a panel the user collapsed mid-stream.
  - `loquix-tool-call` — single tool call with name, args summary, and an
    expandable body for full args (JSON, cyclic-safe) + result/error.
    Status pill (`Queued`/`Running`/`Done`/`Failed`) with appropriate
    default-open behaviour (running/error open, pending/success closed).
  - `loquix-tool-call-list` — group container for parallel tool calls with
    a localised "Used N tools" header. Counts only direct
    `loquix-tool-call` children, ignoring whitespace and stray wrappers.
  - `loquix-citation-popover` — inline numbered chip with hover/focus
    popover (title, host, snippet). Positioned with `@floating-ui/dom`
    and `autoUpdate()` (cleaned up on close + disconnect). 1-based index;
    Enter/Space activation; description-pattern aria so the chip number
    stays the accessible name.
  - `loquix-source-list` — anchored grid or list of sources under a
    message with 1-based numbering matching citation chips. Emits
    `loquix-source-click` as `cancelable: true` so consumers can intercept
    and override default anchor navigation.

  Adds shared scaffolding:
  - `safeHttpUrl()` helper at `@loquix/core/utility/safe-url` — `http(s):`
    allowlist used by citation-popover and source-list for both URLs and
    favicons. Sources with unsafe URLs render as `<span>` rows (visible
    but inert); favicon images with unsafe URLs fall back to a generic
    link icon. Fully unit-tested.
  - New types: `ReasoningStatus`, `ToolCallStatus`, `SourceListLayout`,
    `Source`.
  - New event detail interfaces and `HTMLElementEventMap` entries for all
    five components.
  - New i18n keys for reasoning / tool-call / tool-call-list /
    citation-popover / source-list (component-namespaced camelCase).
  - New tool-call colour tokens (`--loquix-tool-bg`,
    `--loquix-tool-success-bg`, `--loquix-tool-error-bg`,
    `--loquix-tool-result-bg`, `--loquix-tool-result-border`,
    `--loquix-tool-error-border`) with light + dark theme values.
  - React wrappers in `@loquix/react` for all five components, with typed
    custom-event mappings (`onReasoningToggle`, `onToolCallToggle`,
    `onToolGroupToggle`, `onCitationClick`, `onSourceClick`).

  Plan and code went through 2 rounds of `/codex-review` before
  implementation.

## 0.2.0

### Minor Changes

- f1f5ee2: Add five new components for surfacing assistant confidence and user
  disagreement / corrections in a conversation:
  - `loquix-confidence-indicator` — score 0–1 rendered as bar / dots /
    badge / numeric. Auto-derives `low` / `medium` / `high` from
    `low-threshold` / `high-threshold`; invalid or inverted thresholds
    reset to defaults so derivation still tracks the value. Exposes
    `role="meter"` with `aria-valuetext` on every variant.
  - `loquix-uncertainty-marker` — wraps an inline phrase as `unsure`,
    `needs-verification`, or `speculative`. Variants: `underline` (wavy),
    `highlight` (background), `icon` (trailing glyph). Tooltip opens on
    hover/focus, closes on mouseleave/blur/Escape. Uses
    `aria-describedby` so the slotted text remains the accessible name.
    Enter and Space activate. Emits `loquix-uncertainty-click` with
    `{ kind, reason? }`.
  - `loquix-disagreement-marker` — inline pill or full banner attached
    to a disputed message. Banner can show a "Mark resolved" button via
    the `resolvable` attribute. Emits `loquix-disagreement-resolve`.
  - `loquix-feedback-form` — higher-order flow that composes two
    `loquix-action-feedback` buttons with a reasons + comment card.
    Parent state drives the children's `active`; the inner
    `loquix-feedback` is intercepted and never leaks. Emits
    `loquix-feedback-submit` with `{ sentiment, reason?, comment? }` —
    `reason` is a stable ID, never the localised chip label. Optional
    `require-comment-on-down` enforces a non-empty comment for negative
    feedback. Reasons use radio semantics (`role="radio"` +
    `aria-checked`).
  - `loquix-correction-input` — strikethrough original + correction
    textarea + reason input + Submit / Cancel. Emits
    `loquix-correction-submit` with `{ correction, reason?, original? }`
    and `loquix-correction-cancel`. Submit gated by non-empty correction
    (and non-empty reason when `reason-required`).

  Adds confidence and uncertainty colour tokens, new
  `HTMLElementEventMap` entries, new i18n keys for all five components,
  and React wrappers in `@loquix/react`.

## 0.1.2

### Patch Changes

- Fix drop zone targeting, user message background, and attachment image previews
