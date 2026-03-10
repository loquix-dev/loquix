import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { AutoScrollController } from '../../controllers/autoscroll.controller.js';
import { createLoquixEvent } from '../../events/index.js';
import styles from './loquix-message-list.styles.js';

// Auto-register scroll-anchor child component
import './define-scroll-anchor.js';

/**
 * @tag loquix-message-list
 * @summary Scrollable container for chat messages with auto-scroll support.
 *
 * @csspart list - Outer list wrapper.
 * @csspart scroll-container - The inner scrollable region.
 * @csspart scroll-anchor - The scroll-to-bottom anchor button.
 *
 * @slot - Default slot for loquix-message-item elements.
 * @slot empty-state - Content shown when no messages are present.
 * @slot loading - Loading indicator content.
 *
 * @fires loquix-scroll-bottom - When scroll reaches the bottom.
 * @fires loquix-scroll-away - When scroll moves away from the bottom.
 *
 * @cssprop [--loquix-message-gap] - Gap between messages.
 * @cssprop [--loquix-message-list-bg] - Background of the message list.
 * @cssprop [--loquix-message-list-padding] - Padding inside the scroll container.
 */
export class LoquixMessageList extends LitElement {
  static override styles = [styles];

  /** Whether to auto-scroll to the bottom on new content. */
  @property({ type: Boolean, attribute: 'auto-scroll' })
  autoScroll = true;

  /** Enable virtual scrolling (no-op in Phase 1). */
  @property({ type: Boolean })
  virtualize = false;

  /** Whether to show timestamps on messages. */
  @property({ type: Boolean, attribute: 'show-timestamps' })
  showTimestamps = false;

  /** Whether to show the scroll-to-bottom anchor button. */
  @property({ type: Boolean, attribute: 'show-scroll-anchor' })
  showScrollAnchor = true;

  /** Whether to auto-scroll to bottom when a loquix-submit event is detected. */
  @property({ type: Boolean, attribute: 'scroll-on-send' })
  scrollOnSend = true;

  @query('.scroll-container')
  private _scrollContainer!: HTMLElement;

  @state()
  private _hasMessages = false;

  @state()
  private _showAnchor = false;

  private _submitRoot: EventTarget | null = null;

  private _autoScrollController = new AutoScrollController(this, {
    onScrollStateChange: (isAtBottom: boolean) => {
      this._showAnchor = !isAtBottom;

      if (isAtBottom) {
        this.dispatchEvent(createLoquixEvent('loquix-scroll-bottom', {}));
      } else {
        this.dispatchEvent(
          createLoquixEvent('loquix-scroll-away', {
            scrollTop: this._scrollContainer?.scrollTop ?? 0,
          }),
        );
      }
    },
  });

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  private _attached = false;

  protected override firstUpdated(): void {
    this._checkForMessages();
    this._attachIfNeeded();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('autoScroll')) {
      if (this.autoScroll) {
        this._attachIfNeeded();
      } else {
        this._detach();
      }
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._submitRoot = this.getRootNode();
    this._submitRoot.addEventListener(
      'loquix-submit',
      this._handleSubmitForScroll as EventListener,
    );
    // Re-attach on reconnection (updated() won't fire for autoScroll if value unchanged)
    if (this.autoScroll && this.hasUpdated) {
      this.updateComplete.then(() => this._attachIfNeeded());
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._submitRoot?.removeEventListener(
      'loquix-submit',
      this._handleSubmitForScroll as EventListener,
    );
    this._submitRoot = null;
    this._attached = false;
  }

  private _attachIfNeeded(): void {
    if (!this.autoScroll || !this._scrollContainer || this._attached) return;
    this._autoScrollController.attach(this._scrollContainer);
    this._observeSlottedElements();
    this._autoScrollController.scrollToBottom('instant');
    this._attached = true;
  }

  private _detach(): void {
    this._autoScrollController.detach();
    this._showAnchor = false;
    this._attached = false;
  }

  // ---------------------------------------------------------------------------
  // Public methods
  // ---------------------------------------------------------------------------

  /** Programmatically scroll to the bottom. */
  public scrollToBottom(behavior: ScrollBehavior = 'smooth'): void {
    this._autoScrollController.scrollToBottom(behavior);
  }

  /**
   * Scroll to a message element by its message-id attribute.
   * @returns true if the message was found and scrolled to.
   */
  public scrollToMessage(messageId: string): boolean {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
    if (!slot) return false;

    const elements = slot.assignedElements({ flatten: true });
    const target = elements.find(el => el.getAttribute('message-id') === messageId) as
      | HTMLElement
      | undefined;

    if (!target) return false;

    this._autoScrollController.scrollToElement(target);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Internal handlers
  // ---------------------------------------------------------------------------

  private _handleSubmitForScroll = (_e: Event): void => {
    if (this.scrollOnSend && this.autoScroll) {
      requestAnimationFrame(() => this._autoScrollController.scrollToBottom('instant'));
    }
  };

  private _handleAnchorClick(): void {
    this._autoScrollController.scrollToBottom('smooth');
  }

  private _handleSlotChange(): void {
    this._checkForMessages();
    this._observeSlottedElements();

    // Auto-scroll when new messages appear (if not user-scrolled).
    // Deferred to next frame so browser has laid out the new content.
    if (this.autoScroll && !this._autoScrollController.isUserScrolled) {
      requestAnimationFrame(() => {
        this._autoScrollController.scrollToBottom('instant');
      });
    }
  }

  private _observeSlottedElements(): void {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
    if (!slot) return;
    const elements = slot.assignedElements({ flatten: true });
    this._autoScrollController.observeElements(elements);
  }

  private _checkForMessages(): void {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
    if (slot) {
      const assigned = slot.assignedElements({ flatten: true });
      this._hasMessages = assigned.length > 0;
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected override render() {
    return html`
      <div part="list" class="list">
        <div part="scroll-container" class="scroll-container">
          <slot name="loading"></slot>

          ${!this._hasMessages ? html`<slot name="empty-state"></slot>` : nothing}

          <slot @slotchange=${this._handleSlotChange}></slot>
        </div>

        ${this.showScrollAnchor && this.autoScroll
          ? html`<loquix-scroll-anchor
              part="scroll-anchor"
              ?visible=${this._showAnchor}
              @loquix-scroll-anchor-click=${this._handleAnchorClick}
            ></loquix-scroll-anchor>`
          : nothing}
      </div>
    `;
  }
}
