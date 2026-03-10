import { LoquixPromptInput } from './loquix-prompt-input.js';

if (!customElements.get('loquix-prompt-input')) {
  customElements.define('loquix-prompt-input', LoquixPromptInput);
}
