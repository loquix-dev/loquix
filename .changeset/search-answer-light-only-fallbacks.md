---
'@loquix/core': patch
---

Fix source chips and footer actions in `loquix-search-answer` being unreadable on
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
