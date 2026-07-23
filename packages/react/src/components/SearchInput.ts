import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixSearchInput } from '@loquix/core/classes/loquix-search-input';
import '@loquix/core/define/define-search-input';
import type {
  LoquixChangeDetail,
  LoquixSearchAskDetail,
  LoquixSearchSubmitDetail,
} from '@loquix/core';

export const SearchInput = createComponent({
  tagName: 'loquix-search-input',
  elementClass: LoquixSearchInput,
  react: React,
  events: {
    onChange: 'loquix-change' as EventName<CustomEvent<LoquixChangeDetail>>,
    onSearchSubmit: 'loquix-search-submit' as EventName<CustomEvent<LoquixSearchSubmitDetail>>,
    onSearchAsk: 'loquix-search-ask' as EventName<CustomEvent<LoquixSearchAskDetail>>,
  },
});
