import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixToolCall } from '@loquix/core/classes/loquix-tool-call';
import '@loquix/core/define/define-tool-call';
import type { LoquixToolCallToggleDetail } from '@loquix/core';

export const ToolCall = createComponent({
  tagName: 'loquix-tool-call',
  elementClass: LoquixToolCall,
  react: React,
  events: {
    onToolCallToggle: 'loquix-tool-call-toggle' as EventName<
      CustomEvent<LoquixToolCallToggleDetail>
    >,
  },
});
