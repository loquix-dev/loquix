import { LoquixMessageAvatar } from './loquix-message-avatar.js';

if (!customElements.get('loquix-message-avatar')) {
  customElements.define('loquix-message-avatar', LoquixMessageAvatar);
}
