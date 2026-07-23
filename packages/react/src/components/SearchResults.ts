import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixSearchResults } from '@loquix/core/classes/loquix-search-results';
import '@loquix/core/define/define-search-results';

export const SearchResults = createComponent({
  tagName: 'loquix-search-results',
  elementClass: LoquixSearchResults,
  react: React,
});
