import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixSearchPanel } from '@loquix/core/classes/loquix-search-panel';
import '@loquix/core/define/define-search-panel';
import type {
  LoquixChangeDetail,
  LoquixSearchAskDetail,
  LoquixSearchPanelCloseDetail,
  LoquixSearchPanelOpenDetail,
  LoquixSearchResultClickDetail,
  LoquixSearchSourceSelectDetail,
  LoquixSearchSubmitDetail,
} from '@loquix/core';

export const SearchPanel = createComponent({
  tagName: 'loquix-search-panel',
  elementClass: LoquixSearchPanel,
  react: React,
  events: {
    onChange: 'loquix-change' as EventName<CustomEvent<LoquixChangeDetail>>,
    onSearchSubmit: 'loquix-search-submit' as EventName<CustomEvent<LoquixSearchSubmitDetail>>,
    onSearchAsk: 'loquix-search-ask' as EventName<CustomEvent<LoquixSearchAskDetail>>,
    onSearchSourceSelect: 'loquix-search-source-select' as EventName<
      CustomEvent<LoquixSearchSourceSelectDetail>
    >,
    onSearchResultClick: 'loquix-search-result-click' as EventName<
      CustomEvent<LoquixSearchResultClickDetail>
    >,
    onSearchPanelOpen: 'loquix-search-panel-open' as EventName<
      CustomEvent<LoquixSearchPanelOpenDetail>
    >,
    onSearchPanelClose: 'loquix-search-panel-close' as EventName<
      CustomEvent<LoquixSearchPanelCloseDetail>
    >,
  },
});
