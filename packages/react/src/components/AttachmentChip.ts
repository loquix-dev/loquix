import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixAttachmentChip } from '@loquix/core/classes/loquix-attachment-chip';
import '@loquix/core/define/define-attachment-chip';
import type { LoquixAttachmentRemoveDetail, LoquixAttachmentRetryDetail } from '@loquix/core';

export const AttachmentChip = createComponent({
  tagName: 'loquix-attachment-chip',
  elementClass: LoquixAttachmentChip,
  react: React,
  events: {
    onRemove: 'loquix-attachment-remove' as EventName<CustomEvent<LoquixAttachmentRemoveDetail>>,
    onRetry: 'loquix-attachment-retry' as EventName<CustomEvent<LoquixAttachmentRetryDetail>>,
  },
});
