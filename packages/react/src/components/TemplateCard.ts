import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixTemplateCard } from '@loquix/core/classes/loquix-template-card';
import '@loquix/core/define/define-template-card';
import type { LoquixTemplateSelectDetail } from '@loquix/core';

export const TemplateCard = createComponent({
  tagName: 'loquix-template-card',
  elementClass: LoquixTemplateCard,
  react: React,
  events: {
    onTemplateSelect: 'loquix-template-select' as EventName<
      CustomEvent<LoquixTemplateSelectDetail>
    >,
  },
});
