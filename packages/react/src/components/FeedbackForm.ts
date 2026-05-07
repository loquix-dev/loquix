import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixFeedbackForm } from '@loquix/core/classes/loquix-feedback-form';
import '@loquix/core/define/define-feedback-form';
import type { LoquixFeedbackSubmitDetail } from '@loquix/core';

export const FeedbackForm = createComponent({
  tagName: 'loquix-feedback-form',
  elementClass: LoquixFeedbackForm,
  react: React,
  events: {
    onFeedbackSubmit: 'loquix-feedback-submit' as EventName<
      CustomEvent<LoquixFeedbackSubmitDetail>
    >,
  },
});
