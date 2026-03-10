import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixCaveatNotice } from '@loquix/core/classes/loquix-caveat-notice';
import '@loquix/core/define/define-caveat-notice';

export const CaveatNotice = createComponent({
  tagName: 'loquix-caveat-notice',
  elementClass: LoquixCaveatNotice,
  react: React,
});
