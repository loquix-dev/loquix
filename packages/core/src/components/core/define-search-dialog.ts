import { LoquixSearchDialog } from './loquix-search-dialog.js';

if (!customElements.get('loquix-search-dialog')) {
  customElements.define('loquix-search-dialog', LoquixSearchDialog);
}

export { LoquixSearchDialog };
