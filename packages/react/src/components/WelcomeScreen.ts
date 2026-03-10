import React from 'react';
import { createComponent } from '@lit/react';
import { LoquixWelcomeScreen } from '@loquix/core/classes/loquix-welcome-screen';
import '@loquix/core/define/define-welcome-screen';

export const WelcomeScreen = createComponent({
  tagName: 'loquix-welcome-screen',
  elementClass: LoquixWelcomeScreen,
  react: React,
});
