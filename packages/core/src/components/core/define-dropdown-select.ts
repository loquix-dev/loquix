import { LoquixDropdownSelect } from './loquix-dropdown-select.js';

if (!customElements.get('loquix-dropdown-select')) {
  customElements.define('loquix-dropdown-select', LoquixDropdownSelect);
}
