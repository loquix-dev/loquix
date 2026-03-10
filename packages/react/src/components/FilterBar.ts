import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixFilterBar } from '@loquix/core/classes/loquix-filter-bar';
import '@loquix/core/define/define-filter-bar';
import type { LoquixFilterChangeDetail } from '@loquix/core';

export const FilterBar = createComponent({
  tagName: 'loquix-filter-bar',
  elementClass: LoquixFilterBar,
  react: React,
  events: {
    onFilterChange: 'loquix-filter-change' as EventName<CustomEvent<LoquixFilterChangeDetail>>,
  },
});
