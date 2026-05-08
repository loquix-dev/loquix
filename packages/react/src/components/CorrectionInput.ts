import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixCorrectionInput } from '@loquix/core/classes/loquix-correction-input';
import '@loquix/core/define/define-correction-input';
import type { LoquixCorrectionSubmitDetail, LoquixCorrectionCancelDetail } from '@loquix/core';

export const CorrectionInput = createComponent({
  tagName: 'loquix-correction-input',
  elementClass: LoquixCorrectionInput,
  react: React,
  events: {
    onCorrectionSubmit: 'loquix-correction-submit' as EventName<
      CustomEvent<LoquixCorrectionSubmitDetail>
    >,
    onCorrectionCancel: 'loquix-correction-cancel' as EventName<
      CustomEvent<LoquixCorrectionCancelDetail>
    >,
  },
});
