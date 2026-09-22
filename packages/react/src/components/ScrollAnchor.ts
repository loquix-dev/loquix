import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixScrollAnchor } from '@loquix/core/classes/loquix-scroll-anchor';
import '@loquix/core/define/define-scroll-anchor';

export const ScrollAnchor = createComponent({
  tagName: 'loquix-scroll-anchor',
  elementClass: LoquixScrollAnchor,
  react: React,
  events: {
    onScrollAnchorClick: 'loquix-scroll-anchor-click' as EventName<CustomEvent<void>>,
  },
});
