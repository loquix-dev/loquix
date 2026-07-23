import { LoquixSearchInput } from './loquix-search-input.js';

if (!customElements.get('loquix-search-input')) {
  customElements.define('loquix-search-input', LoquixSearchInput);
}
