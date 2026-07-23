import './define-search-result.js';
import { LoquixSearchResults } from './loquix-search-results.js';

if (!customElements.get('loquix-search-results')) {
  customElements.define('loquix-search-results', LoquixSearchResults);
}
