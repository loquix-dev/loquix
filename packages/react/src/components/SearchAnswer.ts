import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixSearchAnswer } from '@loquix/core/classes/loquix-search-answer';
import '@loquix/core/define/define-search-answer';
import type { LoquixCopyDetail, LoquixRegenerateDetail } from '@loquix/core';

export const SearchAnswer = createComponent({
  tagName: 'loquix-search-answer',
  elementClass: LoquixSearchAnswer,
  react: React,
  events: {
    onCopy: 'loquix-copy' as EventName<CustomEvent<LoquixCopyDetail>>,
    onRegenerate: 'loquix-regenerate' as EventName<CustomEvent<LoquixRegenerateDetail>>,
  },
});
