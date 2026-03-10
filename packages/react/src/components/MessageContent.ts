import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixMessageContent } from '@loquix/core/classes/loquix-message-content';
import '@loquix/core/define/define-message-content';

export const MessageContent = createComponent({
  tagName: 'loquix-message-content',
  elementClass: LoquixMessageContent,
  react: React,
});
