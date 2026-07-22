import { LoquixSourceList } from './loquix-source-list.js';

if (!customElements.get('loquix-source-list')) {
  customElements.define('loquix-source-list', LoquixSourceList);
}
