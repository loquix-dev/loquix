import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixDropZone } from '@loquix/core/classes/loquix-drop-zone';
import '@loquix/core/define/define-drop-zone';
import type { LoquixDropDetail } from '@loquix/core';

export const DropZone = createComponent({
  tagName: 'loquix-drop-zone',
  elementClass: LoquixDropZone,
  react: React,
  events: {
    onDrop: 'loquix-drop' as EventName<CustomEvent<LoquixDropDetail>>,
  },
});
