import { LitElement, html, nothing, svg } from 'lit';
import { property, queryAssignedNodes, state } from 'lit/decorators.js';
import type { SearchAnswerState, Source } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import './define-citation-popover.js';
import './define-typing-indicator.js';
import styles from './loquix-search-answer.styles.js';

const sparkleSvg = svg`
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
    <path d="M19 14.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3z" />
  </svg>
`;

const copySvg = svg`
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.8" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.8" />
  </svg>
`;

const regenerateSvg = svg`
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-2.6-6.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    <path d="M21 3v6h-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`;

/**
 * @tag loquix-search-answer
 * @summary AI-generated answer block for smart search results, with citations and footer actions.
 *
 * @csspart container - Outer answer block.
 * @csspart header - Header row.
 * @csspart icon - AI icon.
 * @csspart title - Header title.
 * @csspart body - Answer content area.
 * @csspart generating - In-progress generation indicator.
 * @csspart footer - Footer metadata/actions row.
 * @csspart meta - Generated-by metadata.
 * @csspart sources - Cited source chips.
 * @csspart source - Single cited source chip.
 * @csspart actions - Built-in and slotted actions group.
 * @csspart action - Built-in action button.
 *
 * @slot - Answer body. Use this when inline citation chips are needed.
 * @slot actions - Optional extra footer actions.
 *
 * @fires loquix-copy - When the built-in copy action is clicked. Detail: `{ content }`.
 * @fires loquix-regenerate - When the built-in regenerate action is clicked.
 */
export class LoquixSearchAnswer extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** Plain-text answer body. Ignored when the default slot has content. */
  @property({ type: String })
  content = '';

  /** Answer lifecycle state. */
  @property({ type: String, reflect: true })
  state: SearchAnswerState = 'complete';

  /** Heading override. */
  @property({ type: String })
  heading?: string;

  /** Model name shown in the footer. */
  @property({ type: String })
  model?: string;

  /** Generation duration label, such as "1.8s". */
  @property({ type: String, attribute: 'generated-in' })
  generatedIn?: string;

  /** Cited sources shown as footer chips. Property-only; no JSON attribute parsing. */
  @property({ attribute: false })
  sources: Source[] = [];

  /** Show built-in Copy action. */
  @property({ type: Boolean, attribute: 'show-copy' })
  showCopy = true;

  /** Show built-in Regenerate action. */
  @property({ type: Boolean, attribute: 'show-regenerate' })
  showRegenerate = true;

  /** Accessible label override for cited sources. */
  @property({ type: String, attribute: 'sources-label' })
  sourcesLabel?: string;

  @queryAssignedNodes({ flatten: true })
  private _defaultSlotNodes!: Node[];

  @state()
  private _hasSlotContent = false;

  private _onSlotChange(): void {
    this._hasSlotContent = this._defaultSlotNodes.some(node => {
      if (node.nodeType === Node.ELEMENT_NODE) return true;
      if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').trim().length > 0;
      return false;
    });
  }

  private _copyText(): string {
    if (this.content.trim()) return this.content.trim();
    return this._defaultSlotNodes
      .map(node => node.textContent ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private _onCopy(): void {
    this.dispatchEvent(createLoquixEvent('loquix-copy', { content: this._copyText() }));
  }

  private _onRegenerate(): void {
    this.dispatchEvent(createLoquixEvent('loquix-regenerate', {}));
  }

  private _renderMeta() {
    if (!this.model && !this.generatedIn) return nothing;
    const modelText = this.model;
    return html`
      <span part="meta" class="meta">
        ${modelText}${modelText && this.generatedIn
          ? html` <span class="dot">/</span> `
          : nothing}${this.generatedIn ?? nothing}
      </span>
    `;
  }

  private _renderSources() {
    if (this.sources.length === 0) return nothing;
    const label = this.sourcesLabel ?? this._localize.term('searchAnswer.sourcesLabel');
    return html`
      <div part="sources" class="sources" aria-label=${label}>
        ${this.sources.map(
          (source, index) => html`
            <span part="source" class="source">
              <loquix-citation-popover
                .index=${index + 1}
                .source=${source}
              ></loquix-citation-popover>
              <span class="source-title">${source.host ?? source.title}</span>
            </span>
          `,
        )}
      </div>
    `;
  }

  private _renderGenerating() {
    if (this.state !== 'generating') return nothing;
    return html`
      <div part="generating" class="generating">
        <loquix-typing-indicator variant="dots"></loquix-typing-indicator>
      </div>
    `;
  }

  private _renderActions() {
    const showBuiltInActions = this.state !== 'generating';

    return html`
      <div part="actions" class="actions">
        ${showBuiltInActions && this.showCopy
          ? html`<button part="action" class="action" type="button" @click=${this._onCopy}>
              ${copySvg}<span>${this._localize.term('searchAnswer.copyLabel')}</span>
            </button>`
          : nothing}
        ${showBuiltInActions && this.showRegenerate
          ? html`<button part="action" class="action" type="button" @click=${this._onRegenerate}>
              ${regenerateSvg}<span>${this._localize.term('searchAnswer.regenerateLabel')}</span>
            </button>`
          : nothing}
        <slot name="actions"></slot>
      </div>
    `;
  }

  protected override render() {
    const heading = this.heading ?? this._localize.term('searchAnswer.title');

    return html`
      <section part="container" class="container">
        <div part="header" class="header">
          <span part="icon" class="icon">${sparkleSvg}</span>
          <span part="title" class="title">${heading}</span>
        </div>
        <div part="body" class="body">
          <slot @slotchange=${this._onSlotChange}></slot>
          ${this._hasSlotContent ? nothing : this.content} ${this._renderGenerating()}
        </div>
        <div part="footer" class="footer">
          <div class="footer-left">${this._renderMeta()}${this._renderSources()}</div>
          ${this._renderActions()}
        </div>
      </section>
    `;
  }
}
