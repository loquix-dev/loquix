import { LoquixTemplateCard } from './loquix-template-card.js';

if (!customElements.get('loquix-template-card')) {
  customElements.define('loquix-template-card', LoquixTemplateCard);
}
