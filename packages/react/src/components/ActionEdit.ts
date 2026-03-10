import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixActionEdit } from '@loquix/core/classes/loquix-action-edit';
import '@loquix/core/define/define-action-edit';
import type {
  LoquixEditStartDetail,
  LoquixEditSubmitDetail,
  LoquixEditCancelDetail,
} from '@loquix/core';

export const ActionEdit = createComponent({
  tagName: 'loquix-action-edit',
  elementClass: LoquixActionEdit,
  react: React,
  events: {
    onEditStart: 'loquix-edit-start' as EventName<CustomEvent<LoquixEditStartDetail>>,
    onEditSubmit: 'loquix-edit-submit' as EventName<CustomEvent<LoquixEditSubmitDetail>>,
    onEditCancel: 'loquix-edit-cancel' as EventName<CustomEvent<LoquixEditCancelDetail>>,
  },
});
