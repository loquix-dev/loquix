import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import type { MessageRole, MessageStatus, ActionsPlacement, Size } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-message-item.styles.js';

// Auto-register child components
import './define-message-avatar.js';
import './define-message-content.js';
import './define-message-actions.js';
import './define-typing-indicator.js';
import './define-action-edit.js';

/**
 * @tag loquix-message-item
 * @summary Composite message bubble with optional avatar, content, and action toolbar.
 *
 * @csspart container - Outer wrapper of the message row.
 * @csspart bubble-column - Wrapper around above-bubble slot, bubble, and below-bubble slot.
 * @csspart bubble - The message bubble area.
 * @csspart header - Header area inside the bubble (model name, timestamp).
 * @csspart actions - Actions toolbar area.
 *
 * @slot avatar - Override the default avatar.
 * @slot header - Override the header content.
 * @slot above-bubble - Content rendered above the bubble (e.g. attachments without bubble background).
 * @slot - Default slot for message content.
 * @slot below-bubble - Content rendered below the bubble (e.g. metadata, attachments).
 * @slot actions - Override the default actions toolbar.
 * @slot footer - Footer area below the bubble.
 *
 * @cssprop [--loquix-message-user-bg] - Background for user messages.
 * @cssprop [--loquix-message-assistant-bg] - Background for assistant messages.
 * @cssprop [--loquix-message-error-border-color] - Border colour for error state.
 * @cssprop [--loquix-message-gap] - Gap between avatar and bubble.
 * @cssprop [--loquix-message-bubble-radius] - Border radius of the bubble.
 * @cssprop [--loquix-message-bubble-padding] - Inner padding of the bubble.
 * @cssprop [--loquix-message-max-width] - Maximum width of the bubble.
 */
export class LoquixMessageItem extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Role of the message sender. */
  @property({ type: String, reflect: true })
  sender: MessageRole = 'assistant';

  /** Current status of the message. */
  @property({ type: String, reflect: true })
  status: MessageStatus = 'complete';

  /** Model name to display in the header. */
  @property({ type: String })
  model?: string;

  /** Timestamp string to display in the header. */
  @property({ type: String })
  timestamp?: string;

  /** Unique message identifier. */
  @property({ type: String, attribute: 'message-id' })
  messageId?: string;

  /** Whether private mode is on (hides model info). */
  @property({ type: Boolean, attribute: 'private-mode', reflect: true })
  privateMode = false;

  /** Whether to show the avatar column. Hidden by default. */
  @property({ type: Boolean, attribute: 'show-avatar', reflect: true })
  showAvatar = false;

  /** Size of the built-in avatar when shown. */
  @property({ type: String, attribute: 'avatar-size' })
  avatarSize: Size = 'sm';

  /** Placement of the actions toolbar relative to the bubble. */
  @property({ attribute: 'actions-position', reflect: true })
  actionsPosition: ActionsPlacement = 'bottom-start';

  /** Max height (px) for user message content before collapsing. 0 = no limit. */
  @property({ type: Number, attribute: 'collapse-height' })
  collapseHeight = 120;

  /** Whether the user message is currently collapsed. */
  @state()
  private _collapsed = true;

  /** Whether the content overflows the collapse height. */
  @state()
  private _overflows = false;

  @query('.content')
  private _contentEl!: HTMLDivElement;

  /** Whether inline editing is active. */
  @state()
  private _editing = false;

  /** Content snapshot for inline editing. */
  @state()
  private _editContent = '';

  /** Custom labels captured from the trigger element. */
  private _editSubmitLabel = '';
  private _editCancelLabel = '';
  private _editPlaceholder = '';

  private _resizeObserver: ResizeObserver | null = null;
  private _dispatching = false;

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('loquix-copy', this._onCopy as EventListener);
    this.addEventListener('loquix-regenerate', this._onRegenerate as EventListener);
    this.addEventListener('loquix-feedback', this._onFeedback as EventListener);
    this.addEventListener('loquix-edit-start', this._onEditStart as EventListener);
    this.addEventListener('loquix-edit-submit', this._onEditSubmit as EventListener);
    this.addEventListener('loquix-edit-cancel', this._onEditCancel as EventListener);
  }

  protected override firstUpdated(): void {
    if (this.sender === 'user' && this.collapseHeight > 0) {
      this._observeContent();
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('collapseHeight') && this.sender === 'user') {
      if (this.collapseHeight > 0) {
        // Re-attach observer and re-check if switching from 0 to >0
        if (!this._resizeObserver) {
          this._observeContent();
        }
        this._checkOverflow();
      } else {
        // Switching to 0 (no limit) — detach observer and reset
        this._resizeObserver?.disconnect();
        this._resizeObserver = null;
        this._overflows = false;
      }
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('loquix-copy', this._onCopy as EventListener);
    this.removeEventListener('loquix-regenerate', this._onRegenerate as EventListener);
    this.removeEventListener('loquix-feedback', this._onFeedback as EventListener);
    this.removeEventListener('loquix-edit-start', this._onEditStart as EventListener);
    this.removeEventListener('loquix-edit-submit', this._onEditSubmit as EventListener);
    this.removeEventListener('loquix-edit-cancel', this._onEditCancel as EventListener);
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  private _observeContent(): void {
    const el = this._contentEl;
    if (!el) return;
    this._resizeObserver = new ResizeObserver(() => this._checkOverflow());
    this._resizeObserver.observe(el);
  }

  private _checkOverflow(): void {
    const el = this._contentEl;
    if (!el) return;
    // collapseHeight=0 means "no limit" — never consider it overflowing
    if (this.collapseHeight <= 0) {
      this._overflows = false;
      return;
    }
    this._overflows = el.scrollHeight > this.collapseHeight;
  }

  private _handleToggleCollapse(): void {
    this._collapsed = !this._collapsed;
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  /** True only when the user message actually needs collapsing right now. */
  private get _isCollapsed(): boolean {
    if (this._editing) return false;
    return this.sender === 'user' && this.collapseHeight > 0 && this._overflows && this._collapsed;
  }

  private _renderShowMore() {
    if (this.sender !== 'user' || this.collapseHeight <= 0 || !this._overflows || this._editing)
      return nothing;
    return html`
      <button
        class="show-more"
        aria-expanded=${!this._collapsed}
        @click=${this._handleToggleCollapse}
      >
        ${this._collapsed
          ? this._localize.term('messageItem.showMore')
          : this._localize.term('messageItem.showLess')}
      </button>
    `;
  }

  private _renderHeader() {
    const showModel = this.model && !this.privateMode;
    const showTimestamp = !!this.timestamp;

    if (!showModel && !showTimestamp) return nothing;

    return html`
      <div part="header" class="header">
        <slot name="header">
          ${showModel ? html`<span class="model">${this.model}</span>` : nothing}
          ${showTimestamp ? html`<time class="timestamp">${this.timestamp}</time>` : nothing}
        </slot>
      </div>
    `;
  }

  private _renderContent() {
    // Inline editing: replace content with edit component
    if (this._editing && this.sender === 'user') {
      return html`
        <loquix-action-edit
          editing
          mode="inline"
          message-id=${this.messageId ?? ''}
          .content=${this._editContent}
          submit-label=${this._editSubmitLabel || this._localize.term('actionEdit.submitLabel')}
          cancel-label=${this._editCancelLabel || this._localize.term('actionEdit.cancelLabel')}
          placeholder=${this._editPlaceholder || ''}
        ></loquix-action-edit>
      `;
    }

    if (this.status === 'streaming') {
      return html`
        <slot>
          <loquix-typing-indicator variant="dots"></loquix-typing-indicator>
        </slot>
      `;
    }

    if (this.status === 'pending') {
      return html` <loquix-typing-indicator variant="dots"></loquix-typing-indicator> `;
    }

    return html`<slot></slot>`;
  }

  // ---------------------------------------------------------------------------
  // Action event interception — enrich with messageId + content
  // ---------------------------------------------------------------------------

  /** Extract text content from the default (unnamed) slot, excluding attachment components. */
  private _getMessageText(): string {
    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;
    if (!slot) return '';
    return slot
      .assignedElements()
      .filter(el => !el.matches('loquix-message-attachments'))
      .map(el => el.textContent ?? '')
      .join('\n')
      .trim();
  }

  private _onCopy = (e: Event): void => {
    if (this._dispatching) return;
    e.stopPropagation();
    const content = this._getMessageText();

    navigator.clipboard.writeText(content).catch(() => {
      /* clipboard API may fail in insecure contexts — event still fires */
    });

    this._dispatching = true;
    this.dispatchEvent(
      createLoquixEvent('loquix-copy', {
        messageId: this.messageId ?? '',
        content,
      }),
    );
    this._dispatching = false;
  };

  private _onRegenerate = (e: Event): void => {
    if (this._dispatching) return;
    e.stopPropagation();
    this._dispatching = true;
    this.dispatchEvent(
      createLoquixEvent('loquix-regenerate', {
        messageId: this.messageId ?? '',
      }),
    );
    this._dispatching = false;
  };

  private _onFeedback = (e: Event): void => {
    if (this._dispatching) return;
    e.stopPropagation();
    const detail = (e as CustomEvent).detail;
    this._dispatching = true;
    this.dispatchEvent(
      createLoquixEvent('loquix-feedback', {
        messageId: this.messageId ?? '',
        sentiment: detail?.sentiment ?? 'positive',
      }),
    );
    this._dispatching = false;
  };

  private _onEditStart = (e: Event): void => {
    if (this._dispatching) return;
    e.stopPropagation();

    // Content source: trigger .content property takes precedence over DOM extraction
    const trigger = e.target as HTMLElement | null;
    const triggerContent =
      trigger?.tagName?.toLowerCase() === 'loquix-action-edit'
        ? ((trigger as any).content as string)
        : '';
    const content = triggerContent || this._getMessageText();
    this._editContent = content;
    const triggerMode = trigger?.getAttribute?.('mode') ?? 'inline';

    if (trigger?.tagName?.toLowerCase() === 'loquix-action-edit') {
      this._editSubmitLabel = trigger.getAttribute('submit-label') ?? '';
      this._editCancelLabel = trigger.getAttribute('cancel-label') ?? '';
      this._editPlaceholder = trigger.getAttribute('placeholder') ?? '';
    } else {
      this._editSubmitLabel = '';
      this._editCancelLabel = '';
      this._editPlaceholder = '';
    }

    // Only enter inline editing for inline mode; composer mode is handled externally
    if (triggerMode === 'inline') {
      this._editing = true;
    }

    this._dispatching = true;
    this.dispatchEvent(
      createLoquixEvent('loquix-edit-start', {
        messageId: this.messageId ?? '',
        content,
      }),
    );
    this._dispatching = false;
  };

  private _onEditSubmit = (e: Event): void => {
    if (this._dispatching) return;
    e.stopPropagation();
    const detail = (e as CustomEvent).detail;
    this._editing = false;
    this._editContent = '';
    this._resetEditTriggers();

    this._dispatching = true;
    this.dispatchEvent(
      createLoquixEvent('loquix-edit-submit', {
        messageId: this.messageId ?? '',
        oldContent: detail?.oldContent ?? '',
        newContent: detail?.newContent ?? '',
      }),
    );
    this._dispatching = false;
  };

  private _onEditCancel = (e: Event): void => {
    if (this._dispatching) return;
    e.stopPropagation();
    this._editing = false;
    this._editContent = '';
    this._resetEditTriggers();

    this._dispatching = true;
    this.dispatchEvent(
      createLoquixEvent('loquix-edit-cancel', {
        messageId: this.messageId ?? '',
      }),
    );
    this._dispatching = false;
  };

  /** Reset editing state on any slotted action-edit triggers. */
  private _resetEditTriggers(): void {
    this.querySelectorAll('loquix-action-edit').forEach(el => {
      (el as HTMLElement & { editing: boolean }).editing = false;
    });
  }

  private get _isInline(): boolean {
    return this.actionsPosition === 'inline-start' || this.actionsPosition === 'inline-end';
  }

  /** Whether inline actions go on the same side as the avatar. */
  private get _inlineOnAvatarSide(): boolean {
    if (!this._isInline) return false;
    // Avatar is visually on the left for assistant (row), right for user (row-reverse).
    // inline-start = left side, inline-end = right side.
    if (this.sender === 'user') return this.actionsPosition === 'inline-end';
    return this.actionsPosition === 'inline-start';
  }

  private _renderActions() {
    if (this.status !== 'complete' || this._editing) return nothing;
    const direction = this._isInline ? 'vertical' : 'horizontal';

    return html`
      <div part="actions" class="actions">
        <slot name="actions">
          <loquix-message-actions
            message-role=${this.sender}
            position="always"
            direction=${direction}
          ></loquix-message-actions>
        </slot>
      </div>
    `;
  }

  private _renderErrorRetry() {
    if (this.status !== 'error') return nothing;

    return html`
      <div class="error-bar">
        <span class="error-message">${this._localize.term('messageItem.errorText')}</span>
        <button
          class="retry-button"
          aria-label=${this._localize.term('messageItem.retryLabel')}
          @click=${this._handleRetry}
        >
          ${this._localize.term('messageItem.retryLabel')}
        </button>
      </div>
    `;
  }

  private _handleRetry(): void {
    this.dispatchEvent(
      new CustomEvent('loquix-regenerate', {
        bubbles: true,
        composed: true,
        detail: { messageId: this.messageId ?? '' },
      }),
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected render() {
    const inlineAvatar = this._isInline && this._inlineOnAvatarSide;
    const inlineOpposite = this._isInline && !this._inlineOnAvatarSide;
    const isBottom = !this._isInline;

    // For inline-opposite, actions go inside bubble-group in a row layout
    const inlineBefore = inlineOpposite && this.actionsPosition === 'inline-start';
    const inlineAfter = inlineOpposite && this.actionsPosition === 'inline-end';

    return html`
      <div part="container" class="container">
        ${this.showAvatar
          ? html`
              <div class="avatar-column">
                <slot name="avatar">
                  ${this.sender === 'user'
                    ? html`<loquix-message-avatar
                        name=${this._localize.term('messageItem.userAvatar')}
                        size=${this.avatarSize}
                      ></loquix-message-avatar>`
                    : html`<loquix-message-avatar
                        state=${this.status === 'streaming' ? 'streaming' : 'idle'}
                        size=${this.avatarSize}
                      ></loquix-message-avatar>`}
                </slot>
                ${inlineAvatar ? this._renderActions() : nothing}
              </div>
            `
          : nothing}

        <div class="message-area">
          <div class="bubble-group ${inlineOpposite ? 'bubble-group--inline' : ''}">
            ${inlineBefore ? this._renderActions() : nothing}
            <div part="bubble-column" class="bubble-column">
              <slot name="above-bubble"></slot>
              <div part="bubble" class="bubble ${this._editing ? 'bubble--editing' : ''}">
                ${this._renderHeader()}
                <div
                  class="content ${this._isCollapsed ? 'content--collapsed' : ''}"
                  style=${this._isCollapsed ? `max-height: ${this.collapseHeight}px` : ''}
                >
                  ${this._renderContent()}
                  ${this._isCollapsed ? html`<div class="content-fade"></div>` : nothing}
                </div>
                ${this._renderErrorRetry()}
              </div>
              ${this._renderShowMore()}
              <slot name="below-bubble"></slot>
            </div>
            ${inlineAfter ? this._renderActions() : nothing}
            ${isBottom ? this._renderActions() : nothing}
          </div>
        </div>

        <slot name="footer"></slot>
      </div>
    `;
  }
}
