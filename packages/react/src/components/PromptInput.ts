import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixPromptInput } from '@loquix/core/classes/loquix-prompt-input';
import '@loquix/core/define/define-prompt-input';
import type { LoquixChangeDetail, LoquixSubmitDetail } from '@loquix/core';

export const PromptInput = createComponent({
  tagName: 'loquix-prompt-input',
  elementClass: LoquixPromptInput,
  react: React,
  events: {
    onChange: 'loquix-change' as EventName<CustomEvent<LoquixChangeDetail>>,
    onSubmit: 'loquix-submit' as EventName<CustomEvent<LoquixSubmitDetail>>,
  },
});
