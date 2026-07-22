import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixToolCallList } from '@loquix/core/classes/loquix-tool-call-list';
import '@loquix/core/define/define-tool-call-list';
import type { LoquixToolGroupToggleDetail } from '@loquix/core';

export const ToolCallList = createComponent({
  tagName: 'loquix-tool-call-list',
  elementClass: LoquixToolCallList,
  react: React,
  events: {
    onToolGroupToggle: 'loquix-tool-group-toggle' as EventName<
      CustomEvent<LoquixToolGroupToggleDetail>
    >,
  },
});
