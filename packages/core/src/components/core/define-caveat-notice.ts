import { LoquixCaveatNotice } from './loquix-caveat-notice.js';

if (!customElements.get('loquix-caveat-notice')) {
  customElements.define('loquix-caveat-notice', LoquixCaveatNotice);
}
