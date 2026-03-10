import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixAttachmentPanel } from '@loquix/core/classes/loquix-attachment-panel';
import '@loquix/core/define/define-attachment-panel';
import type { LoquixAttachmentAddDetail, LoquixAttachmentRemoveDetail } from '@loquix/core';

export const AttachmentPanel = createComponent({
  tagName: 'loquix-attachment-panel',
  elementClass: LoquixAttachmentPanel,
  react: React,
  events: {
    onAttachmentAdd: 'loquix-attachment-add' as EventName<CustomEvent<LoquixAttachmentAddDetail>>,
    onAttachmentRemove: 'loquix-attachment-remove' as EventName<
      CustomEvent<LoquixAttachmentRemoveDetail>
    >,
  },
});
