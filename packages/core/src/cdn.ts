/**
 * CDN entry point for Loquix.
 *
 * Usage:
 *   <script src="https://cdn.jsdelivr.net/npm/@loquix/core/cdn/loquix.min.js"></script>
 *
 * This bundle:
 * - Injects design tokens (CSS variables + light theme) into <head>
 * - Registers all custom elements
 * - Bundles lit + @floating-ui/dom (no external dependencies)
 */

// Inject tokens first
import './tokens-inject.js';

// Register core components (side-effect imports)
import './components/core/define-message-avatar.js';
import './components/core/define-typing-indicator.js';
import './components/core/define-disclosure-badge.js';
import './components/core/define-caveat-notice.js';
import './components/core/define-action-button.js';
import './components/core/define-action-copy.js';
import './components/core/define-action-feedback.js';
import './components/core/define-action-edit.js';
import './components/core/define-message-actions.js';
import './components/core/define-message-content.js';
import './components/core/define-generation-controls.js';
import './components/core/define-prompt-input.js';
import './components/core/define-chat-composer.js';
import './components/core/define-message-item.js';
import './components/core/define-message-list.js';
import './components/core/define-chat-header.js';
import './components/core/define-chat-container.js';
import './components/core/define-suggestion-chips.js';
import './components/core/define-welcome-screen.js';
import './components/core/define-follow-up-suggestions.js';
import './components/core/define-nudge-banner.js';
import './components/core/define-template-card.js';
import './components/core/define-template-picker.js';
import './components/core/define-example-gallery.js';
import './components/core/define-composer-toolbar.js';
import './components/core/define-dropdown-select.js';
import './components/core/define-attachment-chip.js';
import './components/core/define-mode-selector.js';
import './components/core/define-model-selector.js';
import './components/core/define-attachment-panel.js';
import './components/core/define-parameter-panel.js';
import './components/core/define-filter-bar.js';
import './components/core/define-drop-zone.js';
import './components/core/define-scroll-anchor.js';
import './components/core/define-message-attachments.js';
import './components/core/define-search-input.js';
import './components/core/define-search-footer.js';
import './components/core/define-search-dialog.js';
import './components/core/define-search-panel.js';
import './components/core/define-search-answer.js';
import './components/core/define-search-sources.js';
import './components/core/define-search-result.js';
import './components/core/define-search-results.js';

// Re-export everything for window.Loquix access
export * from './index.js';
