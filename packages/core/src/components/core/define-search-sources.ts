import { LoquixSearchSources } from './loquix-search-sources.js';

if (!customElements.get('loquix-search-sources')) {
  customElements.define('loquix-search-sources', LoquixSearchSources);
}

export { LoquixSearchSources };
