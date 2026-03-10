import { LoquixComposerToolbar } from './loquix-composer-toolbar.js';

if (!customElements.get('loquix-composer-toolbar')) {
  customElements.define('loquix-composer-toolbar', LoquixComposerToolbar);
}
