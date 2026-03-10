import { LoquixChatContainer } from './loquix-chat-container.js';

if (!customElements.get('loquix-chat-container')) {
  customElements.define('loquix-chat-container', LoquixChatContainer);
}
