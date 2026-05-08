---
'@loquix/core': minor
---

Add five new components for surfacing assistant confidence and user
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
