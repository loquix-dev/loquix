import { LoquixSearchAnswer } from './loquix-search-answer.js';

if (!customElements.get('loquix-search-answer')) {
  customElements.define('loquix-search-answer', LoquixSearchAnswer);
}

export { LoquixSearchAnswer };
