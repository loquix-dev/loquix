import React from 'react';
import { createComponent, type EventName } from '@lit/react';
import { LoquixExampleGallery } from '@loquix/core/classes/loquix-example-gallery';
import '@loquix/core/define/define-example-gallery';
import type { LoquixGallerySelectDetail } from '@loquix/core';

export const ExampleGallery = createComponent({
  tagName: 'loquix-example-gallery',
  elementClass: LoquixExampleGallery,
  react: React,
  events: {
    onGallerySelect: 'loquix-gallery-select' as EventName<CustomEvent<LoquixGallerySelectDetail>>,
  },
});
