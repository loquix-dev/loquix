import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixGenerationControls } from '@loquix/core/classes/loquix-generation-controls';
import '@loquix/core/define/define-generation-controls';
import type { LoquixStopDetail, LoquixPauseDetail, LoquixResumeDetail } from '@loquix/core';

export const GenerationControls = createComponent({
  tagName: 'loquix-generation-controls',
  elementClass: LoquixGenerationControls,
  react: React,
  events: {
    onStop: 'loquix-stop' as EventName<CustomEvent<LoquixStopDetail>>,
    onPause: 'loquix-pause' as EventName<CustomEvent<LoquixPauseDetail>>,
    onResume: 'loquix-resume' as EventName<CustomEvent<LoquixResumeDetail>>,
    onRegenerate: 'loquix-regenerate' as EventName<CustomEvent>,
  },
});
