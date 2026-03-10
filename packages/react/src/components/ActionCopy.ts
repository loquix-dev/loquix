import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixActionCopy } from '@loquix/core/classes/loquix-action-copy';
import '@loquix/core/define/define-action-copy';
import type { LoquixCopyDetail } from '@loquix/core';

export const ActionCopy = createComponent({
  tagName: 'loquix-action-copy',
  elementClass: LoquixActionCopy,
  react: React,
  events: {
    onCopy: 'loquix-copy' as EventName<CustomEvent<LoquixCopyDetail>>,
  },
});
