import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixSearchDialog } from '@loquix/core/classes/loquix-search-dialog';
import '@loquix/core/define/define-search-dialog';
import type {
  LoquixChangeDetail,
  LoquixSearchAskDetail,
  LoquixSearchDialogCloseDetail,
  LoquixSearchDialogOpenDetail,
  LoquixSearchResultClickDetail,
  LoquixSearchSourceSelectDetail,
  LoquixSearchSubmitDetail,
} from '@loquix/core';

export const SearchDialog = createComponent({
  tagName: 'loquix-search-dialog',
  elementClass: LoquixSearchDialog,
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
    onSearchDialogOpen: 'loquix-search-dialog-open' as EventName<
      CustomEvent<LoquixSearchDialogOpenDetail>
    >,
    onSearchDialogClose: 'loquix-search-dialog-close' as EventName<
      CustomEvent<LoquixSearchDialogCloseDetail>
    >,
  },
});
