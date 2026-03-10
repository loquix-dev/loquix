import { LoquixModeSelector } from './loquix-mode-selector.js';

if (!customElements.get('loquix-mode-selector')) {
  customElements.define('loquix-mode-selector', LoquixModeSelector);
}
