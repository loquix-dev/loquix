---
'@loquix/core': patch
---

Fix `--loquix-gallery-columns` being impossible to override on
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
