import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixTemplatePicker } from '@loquix/core/classes/loquix-template-picker';
import '@loquix/core/define/define-template-picker';
import type {
  LoquixTemplateSelectDetail,
  LoquixTemplatePickerOpenDetail,
  LoquixTemplatePickerCloseDetail,
} from '@loquix/core';

export const TemplatePicker = createComponent({
  tagName: 'loquix-template-picker',
  elementClass: LoquixTemplatePicker,
  react: React,
  events: {
    onTemplateSelect: 'loquix-template-select' as EventName<
      CustomEvent<LoquixTemplateSelectDetail>
    >,
    onOpen: 'loquix-template-picker-open' as EventName<CustomEvent<LoquixTemplatePickerOpenDetail>>,
    onClose: 'loquix-template-picker-close' as EventName<
      CustomEvent<LoquixTemplatePickerCloseDetail>
    >,
  },
});
