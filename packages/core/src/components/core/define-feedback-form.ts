import { LoquixFeedbackForm } from './loquix-feedback-form.js';

if (!customElements.get('loquix-feedback-form')) {
  customElements.define('loquix-feedback-form', LoquixFeedbackForm);
}
