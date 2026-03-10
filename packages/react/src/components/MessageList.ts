import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixMessageList } from '@loquix/core/classes/loquix-message-list';
import '@loquix/core/define/define-message-list';

export const MessageList = createComponent({
  tagName: 'loquix-message-list',
  elementClass: LoquixMessageList,
  react: React,
});
