import { LoquixTemplatePicker } from './loquix-template-picker.js';

if (!customElements.get('loquix-template-picker')) {
  customElements.define('loquix-template-picker', LoquixTemplatePicker);
}
