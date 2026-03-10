import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixModelSelector } from '@loquix/core/classes/loquix-model-selector';
import '@loquix/core/define/define-model-selector';
import type { LoquixModelChangeDetail } from '@loquix/core';

export const ModelSelector = createComponent({
  tagName: 'loquix-model-selector',
  elementClass: LoquixModelSelector,
  react: React,
  events: {
    onModelChange: 'loquix-model-change' as EventName<CustomEvent<LoquixModelChangeDetail>>,
  },
});
