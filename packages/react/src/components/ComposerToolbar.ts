import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixComposerToolbar } from '@loquix/core/classes/loquix-composer-toolbar';
import '@loquix/core/define/define-composer-toolbar';

export const ComposerToolbar = createComponent({
  tagName: 'loquix-composer-toolbar',
  elementClass: LoquixComposerToolbar,
  react: React,
});
