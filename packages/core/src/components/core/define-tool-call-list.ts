import { LoquixToolCallList } from './loquix-tool-call-list.js';

if (!customElements.get('loquix-tool-call-list')) {
  customElements.define('loquix-tool-call-list', LoquixToolCallList);
}
