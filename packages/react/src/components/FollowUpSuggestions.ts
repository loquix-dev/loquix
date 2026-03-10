import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixFollowUpSuggestions } from '@loquix/core/classes/loquix-follow-up-suggestions';
import '@loquix/core/define/define-follow-up-suggestions';
import type { LoquixSuggestionSelectDetail } from '@loquix/core';

export const FollowUpSuggestions = createComponent({
  tagName: 'loquix-follow-up-suggestions',
  elementClass: LoquixFollowUpSuggestions,
  react: React,
  events: {
    onSuggestionSelect: 'loquix-suggestion-select' as EventName<
      CustomEvent<LoquixSuggestionSelectDetail>
    >,
  },
});
