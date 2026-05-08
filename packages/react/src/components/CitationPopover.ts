import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixCitationPopover } from '@loquix/core/classes/loquix-citation-popover';
import '@loquix/core/define/define-citation-popover';
import type { LoquixCitationClickDetail } from '@loquix/core';

export const CitationPopover = createComponent({
  tagName: 'loquix-citation-popover',
  elementClass: LoquixCitationPopover,
  react: React,
  events: {
    onCitationClick: 'loquix-citation-click' as EventName<CustomEvent<LoquixCitationClickDetail>>,
  },
});
