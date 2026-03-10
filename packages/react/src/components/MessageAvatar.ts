import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixMessageAvatar } from '@loquix/core/classes/loquix-message-avatar';
import '@loquix/core/define/define-message-avatar';

export const MessageAvatar = createComponent({
  tagName: 'loquix-message-avatar',
  elementClass: LoquixMessageAvatar,
  react: React,
});
