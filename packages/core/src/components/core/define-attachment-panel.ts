import { LoquixAttachmentPanel } from './loquix-attachment-panel.js';
import './define-attachment-chip.js';

if (!customElements.get('loquix-attachment-panel')) {
  customElements.define('loquix-attachment-panel', LoquixAttachmentPanel);
}
