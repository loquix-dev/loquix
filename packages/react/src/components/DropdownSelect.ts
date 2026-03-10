import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixDropdownSelect } from '@loquix/core/classes/loquix-dropdown-select';
import '@loquix/core/define/define-dropdown-select';
import type { LoquixSelectChangeDetail } from '@loquix/core';

export const DropdownSelect = createComponent({
  tagName: 'loquix-dropdown-select',
  elementClass: LoquixDropdownSelect,
  react: React,
  events: {
    onSelectChange: 'loquix-select-change' as EventName<CustomEvent<LoquixSelectChangeDetail>>,
  },
});
