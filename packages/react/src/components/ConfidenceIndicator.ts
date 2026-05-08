import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixConfidenceIndicator } from '@loquix/core/classes/loquix-confidence-indicator';
import '@loquix/core/define/define-confidence-indicator';

export const ConfidenceIndicator = createComponent({
  tagName: 'loquix-confidence-indicator',
  elementClass: LoquixConfidenceIndicator,
  react: React,
  events: {},
});
