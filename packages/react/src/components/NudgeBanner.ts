import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixNudgeBanner } from '@loquix/core/classes/loquix-nudge-banner';
import '@loquix/core/define/define-nudge-banner';
import type { LoquixNudgeDismissDetail, LoquixNudgeActionDetail } from '@loquix/core';

export const NudgeBanner = createComponent({
  tagName: 'loquix-nudge-banner',
  elementClass: LoquixNudgeBanner,
  react: React,
  events: {
    onDismiss: 'loquix-nudge-dismiss' as EventName<CustomEvent<LoquixNudgeDismissDetail>>,
    onAction: 'loquix-nudge-action' as EventName<CustomEvent<LoquixNudgeActionDetail>>,
  },
});
