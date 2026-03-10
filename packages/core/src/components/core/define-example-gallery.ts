import { LoquixExampleGallery } from './loquix-example-gallery.js';

if (!customElements.get('loquix-example-gallery')) {
  customElements.define('loquix-example-gallery', LoquixExampleGallery);
}
