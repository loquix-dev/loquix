import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixTypingIndicator } from '@loquix/core/classes/loquix-typing-indicator';
import '@loquix/core/define/define-typing-indicator';

export const TypingIndicator = createComponent({
  tagName: 'loquix-typing-indicator',
  elementClass: LoquixTypingIndicator,
  react: React,
});
