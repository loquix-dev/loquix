import { LoquixMessageAttachments } from './loquix-message-attachments.js';

if (!customElements.get('loquix-message-attachments')) {
  customElements.define('loquix-message-attachments', LoquixMessageAttachments);
}
