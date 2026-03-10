import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixDisclosureBadge } from '@loquix/core/classes/loquix-disclosure-badge';
import '@loquix/core/define/define-disclosure-badge';

export const DisclosureBadge = createComponent({
  tagName: 'loquix-disclosure-badge',
  elementClass: LoquixDisclosureBadge,
  react: React,
});
