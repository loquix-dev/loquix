import { LoquixWelcomeScreen } from './loquix-welcome-screen.js';

if (!customElements.get('loquix-welcome-screen')) {
  customElements.define('loquix-welcome-screen', LoquixWelcomeScreen);
}
