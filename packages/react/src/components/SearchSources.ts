import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixSearchSources } from '@loquix/core/classes/loquix-search-sources';
import '@loquix/core/define/define-search-sources';
import type { LoquixSearchSourceSelectDetail } from '@loquix/core';

export const SearchSources = createComponent({
  tagName: 'loquix-search-sources',
  elementClass: LoquixSearchSources,
  react: React,
  events: {
    onSearchSourceSelect: 'loquix-search-source-select' as EventName<
      CustomEvent<LoquixSearchSourceSelectDetail>
    >,
  },
});
