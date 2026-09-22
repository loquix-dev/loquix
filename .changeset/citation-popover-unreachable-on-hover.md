---
'@loquix/core': patch
---

Fix the popover in `loquix-citation-popover` closing before the pointer can
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
