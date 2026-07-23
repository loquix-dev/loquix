import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixSearchFooter } from '@loquix/core/classes/loquix-search-footer';
import '@loquix/core/define/define-search-footer';

export const SearchFooter = createComponent({
  tagName: 'loquix-search-footer',
  elementClass: LoquixSearchFooter,
  react: React,
});
