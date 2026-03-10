import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixMessageAttachments } from '@loquix/core/classes/loquix-message-attachments';
import '@loquix/core/define/define-message-attachments';
import type { LoquixAttachmentClickDetail, LoquixAttachmentRemoveDetail } from '@loquix/core';

export const MessageAttachments = createComponent({
  tagName: 'loquix-message-attachments',
  elementClass: LoquixMessageAttachments,
  react: React,
  events: {
    onAttachmentClick: 'loquix-attachment-click' as EventName<
      CustomEvent<LoquixAttachmentClickDetail>
    >,
    onAttachmentRemove: 'loquix-attachment-remove' as EventName<
      CustomEvent<LoquixAttachmentRemoveDetail>
    >,
  },
});
