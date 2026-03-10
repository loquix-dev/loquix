import { LoquixMessageList } from './loquix-message-list.js';

if (!customElements.get('loquix-message-list')) {
  customElements.define('loquix-message-list', LoquixMessageList);
}
