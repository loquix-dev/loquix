import { LoquixMessageItem } from './loquix-message-item.js';

if (!customElements.get('loquix-message-item')) {
  customElements.define('loquix-message-item', LoquixMessageItem);
}
