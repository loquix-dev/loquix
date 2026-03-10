import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixActionButton } from '@loquix/core/classes/loquix-action-button';
import '@loquix/core/define/define-action-button';

export const ActionButton = createComponent({
  tagName: 'loquix-action-button',
  elementClass: LoquixActionButton,
  react: React,
  events: {
    onAction: 'loquix-action' as EventName<CustomEvent>,
  },
});
