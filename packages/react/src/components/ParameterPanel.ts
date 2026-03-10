import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixParameterPanel } from '@loquix/core/classes/loquix-parameter-panel';
import '@loquix/core/define/define-parameter-panel';
import type {
  LoquixParameterChangeDetail,
  LoquixParameterCommitDetail,
  LoquixPresetChangeDetail,
} from '@loquix/core';

export const ParameterPanel = createComponent({
  tagName: 'loquix-parameter-panel',
  elementClass: LoquixParameterPanel,
  react: React,
  events: {
    onParameterChange: 'loquix-parameter-change' as EventName<
      CustomEvent<LoquixParameterChangeDetail>
    >,
    onParameterCommit: 'loquix-parameter-commit' as EventName<
      CustomEvent<LoquixParameterCommitDetail>
    >,
    onPresetChange: 'loquix-preset-change' as EventName<CustomEvent<LoquixPresetChangeDetail>>,
  },
});
