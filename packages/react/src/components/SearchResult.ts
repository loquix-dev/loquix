import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixSearchResult } from '@loquix/core/classes/loquix-search-result';
import '@loquix/core/define/define-search-result';
import type { LoquixSearchResultClickDetail } from '@loquix/core';

export const SearchResult = createComponent({
  tagName: 'loquix-search-result',
  elementClass: LoquixSearchResult,
  react: React,
  events: {
    onSearchResultClick: 'loquix-search-result-click' as EventName<
      CustomEvent<LoquixSearchResultClickDetail>
    >,
  },
});
