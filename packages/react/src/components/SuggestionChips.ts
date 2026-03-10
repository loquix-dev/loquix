import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixSuggestionChips } from '@loquix/core/classes/loquix-suggestion-chips';
import '@loquix/core/define/define-suggestion-chips';
import type { LoquixSuggestionSelectDetail } from '@loquix/core';

export const SuggestionChips = createComponent({
  tagName: 'loquix-suggestion-chips',
  elementClass: LoquixSuggestionChips,
  react: React,
  events: {
    onSuggestionSelect: 'loquix-suggestion-select' as EventName<
      CustomEvent<LoquixSuggestionSelectDetail>
    >,
  },
});
