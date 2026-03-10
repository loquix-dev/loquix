import { LoquixNudgeBanner } from './loquix-nudge-banner.js';

if (!customElements.get('loquix-nudge-banner')) {
  customElements.define('loquix-nudge-banner', LoquixNudgeBanner);
}
