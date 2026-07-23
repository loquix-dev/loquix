import { LoquixSearchResult } from './loquix-search-result.js';

if (!customElements.get('loquix-search-result')) {
  customElements.define('loquix-search-result', LoquixSearchResult);
}
