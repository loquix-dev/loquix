import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixMessageItem } from '@loquix/core/classes/loquix-message-item';
import '@loquix/core/define/define-message-item';
import type {
  LoquixCopyDetail,
  LoquixRegenerateDetail,
  LoquixFeedbackDetail,
  LoquixEditStartDetail,
  LoquixEditSubmitDetail,
  LoquixEditCancelDetail,
} from '@loquix/core';

export const MessageItem = createComponent({
  tagName: 'loquix-message-item',
  elementClass: LoquixMessageItem,
  react: React,
  events: {
    onCopy: 'loquix-copy' as EventName<CustomEvent<LoquixCopyDetail>>,
    onRegenerate: 'loquix-regenerate' as EventName<CustomEvent<LoquixRegenerateDetail>>,
    onFeedback: 'loquix-feedback' as EventName<CustomEvent<LoquixFeedbackDetail>>,
    onEditStart: 'loquix-edit-start' as EventName<CustomEvent<LoquixEditStartDetail>>,
    onEditSubmit: 'loquix-edit-submit' as EventName<CustomEvent<LoquixEditSubmitDetail>>,
    onEditCancel: 'loquix-edit-cancel' as EventName<CustomEvent<LoquixEditCancelDetail>>,
  },
});
