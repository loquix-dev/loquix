import type { Preview } from '@storybook/web-components';
import { html } from 'lit';
import '../../packages/core/src/tokens/variables.css';
import '../../packages/core/src/tokens/themes/light.css';
import '../../packages/core/src/tokens/themes/dark.css';

// Import all component registrations
import '@loquix/core/define/define-message-avatar';
import '@loquix/core/define/define-typing-indicator';
import '@loquix/core/define/define-disclosure-badge';
import '@loquix/core/define/define-caveat-notice';
import '@loquix/core/define/define-action-button';
import '@loquix/core/define/define-action-copy';
import '@loquix/core/define/define-action-feedback';
import '@loquix/core/define/define-action-edit';
import '@loquix/core/define/define-message-actions';
import '@loquix/core/define/define-message-content';
import '@loquix/core/define/define-generation-controls';
import '@loquix/core/define/define-prompt-input';
import '@loquix/core/define/define-chat-composer';
import '@loquix/core/define/define-message-item';
import '@loquix/core/define/define-message-list';
import '@loquix/core/define/define-chat-header';
import '@loquix/core/define/define-chat-container';
import '@loquix/core/define/define-suggestion-chips';
import '@loquix/core/define/define-welcome-screen';
import '@loquix/core/define/define-follow-up-suggestions';
import '@loquix/core/define/define-nudge-banner';
import '@loquix/core/define/define-template-card';
import '@loquix/core/define/define-template-picker';
import '@loquix/core/define/define-example-gallery';
import '@loquix/core/define/define-composer-toolbar';
import '@loquix/core/define/define-dropdown-select';
import '@loquix/core/define/define-attachment-chip';
import '@loquix/core/define/define-mode-selector';
import '@loquix/core/define/define-model-selector';
import '@loquix/core/define/define-attachment-panel';
import '@loquix/core/define/define-parameter-panel';
import '@loquix/core/define/define-filter-bar';
import '@loquix/core/define/define-drop-zone';
import '@loquix/core/define/define-scroll-anchor';
import '@loquix/core/define/define-message-attachments';
// Phase 4 PR #2 — Confidence & Uncertainty
import '@loquix/core/define/define-confidence-indicator';
import '@loquix/core/define/define-uncertainty-marker';
import '@loquix/core/define/define-disagreement-marker';
import '@loquix/core/define/define-feedback-form';
import '@loquix/core/define/define-correction-input';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (storyFn, context) => {
      const theme = context.globals.theme || 'light';
      const bg = theme === 'dark' ? '#111827' : '#ffffff';
      const fg = theme === 'dark' ? '#f9fafb' : '#111827';
      return html`
        <div
          data-theme=${theme}
          style="padding:1rem;background:${bg};color:${fg};border-radius:8px;min-height:100%"
        >
          ${storyFn()}
        </div>
      `;
    },
  ],
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
  },
};

export default preview;
