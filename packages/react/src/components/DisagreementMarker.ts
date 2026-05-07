import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixDisagreementMarker } from '@loquix/core/classes/loquix-disagreement-marker';
import '@loquix/core/define/define-disagreement-marker';
import type { LoquixDisagreementResolveDetail } from '@loquix/core';

export const DisagreementMarker = createComponent({
  tagName: 'loquix-disagreement-marker',
  elementClass: LoquixDisagreementMarker,
  react: React,
  events: {
    onResolve: 'loquix-disagreement-resolve' as EventName<
      CustomEvent<LoquixDisagreementResolveDetail>
    >,
  },
});
