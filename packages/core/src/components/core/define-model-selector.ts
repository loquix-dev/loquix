import { LoquixModelSelector } from './loquix-model-selector.js';

if (!customElements.get('loquix-model-selector')) {
  customElements.define('loquix-model-selector', LoquixModelSelector);
}
