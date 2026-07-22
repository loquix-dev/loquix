import { LitElement, html, nothing, svg } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';
import type { Source } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import { createLoquixEvent } from '../../events/index.js';
import { safeHttpUrl } from '../../utility/safe-url.js';
import styles from './loquix-citation-popover.styles.js';

let _idCounter = 0;
const nextId = (): number => ++_idCounter;

const linkSvg = svg`
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
      stroke="currentColor"
      stroke-width="1.5"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;

const externalSvg = svg`
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M15 3h6v6M10 14L21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"
      stroke="currentColor"
      stroke-width="1.5"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;

/**
 * @tag loquix-citation-popover
 * @summary Inline numbered citation chip with a hover/focus popover showing
 *   the source's title, host, and snippet.
 *
 * Slotted text remains the chip's accessible name? Actually the chip renders
 * its own number, no slot. Description pattern via `aria-describedby` lets
 * screen readers announce the popover content as a description, not as the
 * accessible name.
 *
 * Popover positioning uses `@floating-ui/dom` with `autoUpdate()` for
 * scroll/resize resilience. The cleanup function is stored and called on
 * close + `disconnectedCallback` to avoid listener leaks.
 *
 * Both `source.url` and `source.favicon` are validated against an `http(s):`
 * allowlist before rendering. Click events fire even for unsafe URLs — the
 * consumer is responsible for navigation.
 *
 * @csspart chip - The clickable chip wrapper (`<button>`).
 * @csspart index - The numeric badge.
 * @csspart popover - The popover panel.
 * @csspart favicon - Favicon container in the popover.
 * @csspart body - Popover text container.
 * @csspart title - Source title.
 * @csspart host - Source host name.
 * @csspart snippet - Source snippet text.
 * @csspart arrow - Trailing external-link icon.
 *
 * @fires loquix-citation-click - When the chip is clicked or activated via
 *   keyboard. Detail: `{ index, source }`.
 *
 * @cssprop [--loquix-ai-color] - Chip foreground / hover background.
 * @cssprop [--loquix-ai-color-subtle] - Chip resting background.
 */
export class LoquixCitationPopover extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);
  private _uid = nextId();

  /** 1-based citation index. */
  @property({ type: Number })
  index = 1;

  /** Source data. Property-only — no JSON-attribute parsing. */
  @property({ attribute: false })
  source: Source = { title: '', url: '' };

  @state()
  private _open = false;

  @state()
  private _placement: 'top' | 'bottom' = 'top';

  /** Cleanup function returned by floating-ui's autoUpdate. */
  private _cleanupAutoUpdate?: () => void;

  @query('.chip')
  private _chip?: HTMLElement;

  @query('.popover')
  private _popover?: HTMLElement;

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardownAutoUpdate();
  }

  // ---------------------------------------------------------------------------
  // Position
  // ---------------------------------------------------------------------------

  private async _updatePosition(): Promise<void> {
    const reference = this._chip;
    const floating = this._popover;
    if (!reference || !floating) return;
    const { x, y, placement } = await computePosition(reference, floating, {
      strategy: 'fixed',
      placement: 'top',
      middleware: [offset(8), flip(), shift({ padding: 8 })],
    });
    floating.style.left = `${x}px`;
    floating.style.top = `${y}px`;
    this._placement = placement.startsWith('top') ? 'top' : 'bottom';
  }

  private _setupAutoUpdate(): void {
    this._teardownAutoUpdate();
    const reference = this._chip;
    const floating = this._popover;
    if (!reference || !floating) return;
    this._cleanupAutoUpdate = autoUpdate(reference, floating, () => {
      void this._updatePosition();
    });
  }

  private _teardownAutoUpdate(): void {
    this._cleanupAutoUpdate?.();
    this._cleanupAutoUpdate = undefined;
  }

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------

  private _show = async (): Promise<void> => {
    if (this._open) return;
    this._open = true;
    await this.updateComplete;
    // Guard against a hide() that ran during the await — without this check,
    // teardown would run before setup, then setup would re-attach autoUpdate
    // after the popover is already closed (listener leak).
    if (!this._open || !this.isConnected) return;
    this._setupAutoUpdate();
  };

  private _hide = (): void => {
    if (!this._open) return;
    this._open = false;
    this._teardownAutoUpdate();
  };

  private _onChipKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._activate();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      this._activate();
    } else if (e.key === 'Escape') {
      this._hide();
    }
  };

  private _activate(): void {
    this.dispatchEvent(
      createLoquixEvent('loquix-citation-click', {
        index: this.index,
        source: this.source,
      }),
    );
  }

  private _onClick = (): void => {
    this._activate();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected override render() {
    const tooltipId = `lq-citation-pop-${this._uid}`;
    const safeFavicon = safeHttpUrl(this.source.favicon);

    // Accessible name is the visible chip text (the index number). The
    // tooltip / popover content provides the description via aria-describedby.
    // This matches the description pattern used by loquix-uncertainty-marker:
    // chip name stays the natural visible text; popover is the description.
    return html`
      <button
        class="chip"
        type="button"
        aria-describedby=${tooltipId}
        aria-expanded=${this._open ? 'true' : 'false'}
        @mouseenter=${this._show}
        @mouseleave=${this._hide}
        @focus=${this._show}
        @blur=${this._hide}
        @keydown=${this._onChipKeydown}
        @click=${this._onClick}
        part="chip"
      >
        <span part="index" class="index">${this.index}</span>
      </button>
      <span
        part="popover"
        class="popover"
        id=${tooltipId}
        role="tooltip"
        ?hidden=${!this._open}
        @mouseenter=${this._show}
        @mouseleave=${this._hide}
      >
        <span part="favicon" class="pop-favicon">
          ${safeFavicon
            ? html`<img
                src=${safeFavicon}
                alt=""
                referrerpolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />`
            : linkSvg}
        </span>
        <span part="body" class="pop-body">
          <span part="title" class="pop-title">${this.source.title}</span>
          ${this.source.host
            ? html`<span part="host" class="pop-host">${this.source.host}</span>`
            : nothing}
          ${this.source.snippet
            ? html`<span part="snippet" class="pop-snippet">${this.source.snippet}</span>`
            : nothing}
        </span>
        <span part="arrow" class="pop-arrow">${externalSvg}</span>
      </span>
    `;
  }
}
