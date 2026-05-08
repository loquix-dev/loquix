---
'@loquix/core': minor
'@loquix/react': minor
---

Add five new components for surfacing assistant reasoning and tool use:

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
