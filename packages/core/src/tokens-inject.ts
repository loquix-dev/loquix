/**
 * Injects Loquix design tokens into the document head for CDN consumers.
 * This file is used by the CDN bundle (cdn.ts) to ensure variables and
 * theme styles are available globally when loaded via a <script> tag.
 */

// @ts-expect-error — Vite handles ?inline imports
import variablesCSS from './tokens/variables.css?inline';
// @ts-expect-error — Vite handles ?inline imports
import lightCSS from './tokens/themes/light.css?inline';

const style = document.createElement('style');
style.setAttribute('data-loquix-tokens', '');
style.textContent = variablesCSS + '\n' + lightCSS;
document.head.prepend(style);
