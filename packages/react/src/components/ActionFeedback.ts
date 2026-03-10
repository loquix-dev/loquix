import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixActionFeedback } from '@loquix/core/classes/loquix-action-feedback';
import '@loquix/core/define/define-action-feedback';
import type { LoquixFeedbackDetail } from '@loquix/core';

export const ActionFeedback = createComponent({
  tagName: 'loquix-action-feedback',
  elementClass: LoquixActionFeedback,
  react: React,
  events: {
    onFeedback: 'loquix-feedback' as EventName<CustomEvent<LoquixFeedbackDetail>>,
  },
});
