---
'@loquix/core': patch
---

Fix `loquix-search-input` rendering the "Ask AI" button in `mode="plain"`.

`show-ask-affordance` used to win over `mode`, so the plain-mode surfaces of
`loquix-search-dialog` and `loquix-search-panel` — which both set the attribute
on their inner input unconditionally — still showed the button, and clicking it
dispatched a `loquix-search-ask` event the host never opted into. Plain mode now
suppresses the affordance regardless of `show-ask-affordance`.
