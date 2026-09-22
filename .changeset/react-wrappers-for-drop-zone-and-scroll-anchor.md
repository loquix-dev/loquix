---
'@loquix/react': minor
---

Add the missing `DropZone` and `ScrollAnchor` wrappers.

They were the only two components without one, so `@loquix/react` covered 51 of
the 53 elements `@loquix/core` exports while describing itself as covering all of
them. Reaching either from React meant dropping to the custom element and wiring
`ref` and `addEventListener` by hand.

`DropZone` maps `loquix-drop` to `onDrop` and `ScrollAnchor` maps
`loquix-scroll-anchor-click` to `onScrollAnchorClick`. Note that `onDrop` on this
wrapper is the component's files event rather than React's native drag handler —
the same shadowing the existing `ActionCopy` wrapper applies to `onCopy`.
