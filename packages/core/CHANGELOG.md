# @loquix/core

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
