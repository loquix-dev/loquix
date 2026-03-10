import { LoquixActionFeedback } from './loquix-action-feedback.js';

if (!customElements.get('loquix-action-feedback')) {
  customElements.define('loquix-action-feedback', LoquixActionFeedback);
}
