import { LoquixMessageContent } from './loquix-message-content.js';

if (!customElements.get('loquix-message-content')) {
  customElements.define('loquix-message-content', LoquixMessageContent);
}
