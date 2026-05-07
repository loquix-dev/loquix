import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixUncertaintyMarker } from '@loquix/core/classes/loquix-uncertainty-marker';
import '@loquix/core/define/define-uncertainty-marker';
import type { LoquixUncertaintyClickDetail } from '@loquix/core';

export const UncertaintyMarker = createComponent({
  tagName: 'loquix-uncertainty-marker',
  elementClass: LoquixUncertaintyMarker,
  react: React,
  events: {
    onUncertaintyClick: 'loquix-uncertainty-click' as EventName<
      CustomEvent<LoquixUncertaintyClickDetail>
    >,
  },
});
