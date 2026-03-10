import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixChatComposer } from '@loquix/core/classes/loquix-chat-composer';
import '@loquix/core/define/define-chat-composer';
import type { LoquixSubmitDetail, LoquixStopDetail } from '@loquix/core';

export const ChatComposer = createComponent({
  tagName: 'loquix-chat-composer',
  elementClass: LoquixChatComposer,
  react: React,
  events: {
    onSubmit: 'loquix-submit' as EventName<CustomEvent<LoquixSubmitDetail>>,
    onStop: 'loquix-stop' as EventName<CustomEvent<LoquixStopDetail>>,
  },
});
