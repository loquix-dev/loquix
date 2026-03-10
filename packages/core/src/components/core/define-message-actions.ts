import { LoquixMessageActions } from './loquix-message-actions.js';

if (!customElements.get('loquix-message-actions')) {
  customElements.define('loquix-message-actions', LoquixMessageActions);
}
