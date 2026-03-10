import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixChatHeader } from '@loquix/core/classes/loquix-chat-header';
import '@loquix/core/define/define-chat-header';

export const ChatHeader = createComponent({
  tagName: 'loquix-chat-header',
  elementClass: LoquixChatHeader,
  react: React,
});
