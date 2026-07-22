import { LoquixToolCall } from './loquix-tool-call.js';

if (!customElements.get('loquix-tool-call')) {
  customElements.define('loquix-tool-call', LoquixToolCall);
}
