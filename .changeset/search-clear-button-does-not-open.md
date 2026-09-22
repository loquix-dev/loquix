---
'@loquix/core': patch
---

Fix the clear button opening the search surface in `loquix-search-dialog` and
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
