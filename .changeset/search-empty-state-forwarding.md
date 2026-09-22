---
'@loquix/core': patch
---

Let `loquix-search-dialog` and `loquix-search-panel` show an empty or error state.

Both wrapped their built-in `loquix-search-results` in a region hidden whenever
`results` was empty, and neither forwarded `empty-text`. So the empty state that
`loquix-search-results` already renders could never be seen through the dialog or
the panel, and a message like "Service is too busy. Try again." had to be faked as
a result row — which then got a rank number rendered in front of it.

Both components now accept `empty-text` / `emptyText`, forward it to the results
list, and keep the results region visible when an empty message is set with no
results. `rank: null` on a `SearchResult` also opts a row out of numbering, in
blended and sectioned layouts. Behaviour with no results and no empty message is
unchanged: the region stays hidden.
