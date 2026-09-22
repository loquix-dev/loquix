---
'@loquix/core': patch
---

Fix selecting a preset in `loquix-parameter-panel` discarding every parameter the
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
