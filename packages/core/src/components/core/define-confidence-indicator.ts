import { LoquixConfidenceIndicator } from './loquix-confidence-indicator.js';

if (!customElements.get('loquix-confidence-indicator')) {
  customElements.define('loquix-confidence-indicator', LoquixConfidenceIndicator);
}
