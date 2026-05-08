import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixReasoningBlock } from '@loquix/core/classes/loquix-reasoning-block';
import '@loquix/core/define/define-reasoning-block';
import type { LoquixReasoningToggleDetail } from '@loquix/core';

export const ReasoningBlock = createComponent({
  tagName: 'loquix-reasoning-block',
  elementClass: LoquixReasoningBlock,
  react: React,
  events: {
    onReasoningToggle: 'loquix-reasoning-toggle' as EventName<
      CustomEvent<LoquixReasoningToggleDetail>
    >,
  },
});
