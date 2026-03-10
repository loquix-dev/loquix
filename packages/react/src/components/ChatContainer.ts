import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixChatContainer } from '@loquix/core/classes/loquix-chat-container';
import '@loquix/core/define/define-chat-container';

export const ChatContainer = createComponent({
  tagName: 'loquix-chat-container',
  elementClass: LoquixChatContainer,
  react: React,
});
