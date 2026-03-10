import { LoquixDropZone } from './loquix-drop-zone.js';

if (!customElements.get('loquix-drop-zone')) {
  customElements.define('loquix-drop-zone', LoquixDropZone);
}
