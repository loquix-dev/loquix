import { LoquixChatHeader } from './loquix-chat-header.js';

if (!customElements.get('loquix-chat-header')) {
  customElements.define('loquix-chat-header', LoquixChatHeader);
}
