import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixModeSelector } from '@loquix/core/classes/loquix-mode-selector';
import '@loquix/core/define/define-mode-selector';
import type { LoquixModeChangeDetail } from '@loquix/core';

export const ModeSelector = createComponent({
  tagName: 'loquix-mode-selector',
  elementClass: LoquixModeSelector,
  react: React,
  events: {
    onModeChange: 'loquix-mode-change' as EventName<CustomEvent<LoquixModeChangeDetail>>,
  },
});
