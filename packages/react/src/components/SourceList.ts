import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixSourceList } from '@loquix/core/classes/loquix-source-list';
import '@loquix/core/define/define-source-list';
import type { LoquixSourceClickDetail } from '@loquix/core';

export const SourceList = createComponent({
  tagName: 'loquix-source-list',
  elementClass: LoquixSourceList,
  react: React,
  events: {
    onSourceClick: 'loquix-source-click' as EventName<CustomEvent<LoquixSourceClickDetail>>,
  },
});
