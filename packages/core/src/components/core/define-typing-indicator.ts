import { LoquixTypingIndicator } from './loquix-typing-indicator.js';

if (!customElements.get('loquix-typing-indicator')) {
  customElements.define('loquix-typing-indicator', LoquixTypingIndicator);
}
