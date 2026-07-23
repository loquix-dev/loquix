import { LoquixSearchPanel } from './loquix-search-panel.js';

if (!customElements.get('loquix-search-panel')) {
  customElements.define('loquix-search-panel', LoquixSearchPanel);
}

export { LoquixSearchPanel };
