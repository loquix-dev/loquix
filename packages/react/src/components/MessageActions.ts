import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixMessageActions } from '@loquix/core/classes/loquix-message-actions';
import '@loquix/core/define/define-message-actions';

export const MessageActions = createComponent({
  tagName: 'loquix-message-actions',
  elementClass: LoquixMessageActions,
  react: React,
});
