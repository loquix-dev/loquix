import { LoquixChatComposer } from './loquix-chat-composer.js';

if (!customElements.get('loquix-chat-composer')) {
  customElements.define('loquix-chat-composer', LoquixChatComposer);
}
