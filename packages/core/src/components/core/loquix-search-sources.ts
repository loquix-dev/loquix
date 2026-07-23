import { LitElement, html, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import type { SearchSource, SearchSourcesVariant } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-search-sources.styles.js';

const searchSvg = svg`
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
    <path d="m21 21-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
`;

/**
 * @tag loquix-search-sources
 * @summary Source progress strip and filter chips for smart search surfaces.
 *
 * @csspart container - Outer sources wrapper.
 * @csspart header - Progress header row.
 * @csspart spinner - Overall progress spinner.
 * @csspart count - Running total or source result count.
 * @csspart list - Source pill list.
 * @csspart pill - Individual source pill or filter button.
 * @csspart icon - Source icon.
 * @csspart name - Source name.
 *
 * @fires loquix-search-source-select - Fired when a filter source is selected. Detail: `{ sourceId, source }`.
 */
export class LoquixSearchSources extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** Sources to render. Property-only; no JSON attribute parsing. */
  @property({ attribute: false })
  sources: SearchSource[] = [];

  /** Display mode: progress strip or filter chips. */
  @property({ type: String, reflect: true })
  variant: SearchSourcesVariant = 'progress';

  /** Active source id in `filters` variant. Use `all` for the all-sources chip. */
  @property({ type: String, attribute: 'active-source' })
  activeSource = 'all';

  /** Headline override for progress mode. */
  @property({ type: String })
  headline?: string;

  /** Running total shown in progress mode. */
  @property({ type: Number, attribute: 'running-total' })
  runningTotal?: number;

  /** Whether to render an `All` filter chip in filters mode. */
  @property({ type: Boolean, attribute: 'show-all' })
  showAll = true;

  /** Accessible label override. */
  @property({ type: String })
  label?: string;

  private get _hasRunningSource(): boolean {
    return this.sources.some(source => source.status === 'running');
  }

  private get _totalCount(): number | undefined {
    const counts = this.sources.map(source => source.count).filter(count => count != null);
    if (counts.length === 0) return undefined;
    return counts.reduce((total, count) => total + count!, 0);
  }

  private _selectSource(sourceId: string, source?: SearchSource): void {
    this.activeSource = sourceId;
    this.dispatchEvent(createLoquixEvent('loquix-search-source-select', { sourceId, source }));
  }

  private _sourceClass(source: SearchSource): string {
    return ['pill', source.status && `is-${source.status}`].filter(Boolean).join(' ');
  }

  private _renderIcon(source: SearchSource) {
    return html`<span part="icon" class="icon" aria-hidden="true"
      >${(source.icon ?? source.name.charAt(0)) || '?'}</span
    >`;
  }

  private _renderSourceStatus(source: SearchSource) {
    if (source.status === 'running')
      return html`<span class="mini-spinner" aria-hidden="true"></span>`;
    if (source.status === 'error') {
      return html`<span class="status">${this._localize.term('searchSources.errorLabel')}</span>`;
    }
    if (source.count != null) return html`<span part="count" class="count">${source.count}</span>`;
    return nothing;
  }

  private _renderProgressPill(source: SearchSource) {
    return html`
      <span part="pill" class=${this._sourceClass(source)}>
        ${this._renderIcon(source)}
        <span part="name" class="name">${source.name}</span>
        ${this._renderSourceStatus(source)}
      </span>
    `;
  }

  private _renderFilterButton(
    sourceId: string,
    label: string,
    count?: number,
    source?: SearchSource,
  ) {
    const selected = this.activeSource === sourceId;
    return html`
      <button
        part="pill"
        class=${['pill', 'filter', selected && 'is-active', source?.status && `is-${source.status}`]
          .filter(Boolean)
          .join(' ')}
        type="button"
        aria-pressed=${selected ? 'true' : 'false'}
        @click=${() => this._selectSource(sourceId, source)}
      >
        ${source ? this._renderIcon(source) : nothing}
        <span part="name" class="name">${label}</span>
        ${count != null ? html`<span part="count" class="count">${count}</span>` : nothing}
      </button>
    `;
  }

  private _renderHeader() {
    const headline =
      this.headline ??
      this._localize.term('searchSources.searchingSources', { count: this.sources.length });

    return html`
      <div part="header" class="header">
        ${this._hasRunningSource
          ? html`<span part="spinner" class="spinner" aria-hidden="true"></span>`
          : html`<span class="search-icon" aria-hidden="true">${searchSvg}</span>`}
        <span class="headline">${headline}</span>
        ${this.runningTotal != null
          ? html`<span part="count" class="running-count">
              ${this._localize.term('searchSources.resultsSoFar', { count: this.runningTotal })}
            </span>`
          : nothing}
      </div>
    `;
  }

  private _renderProgress() {
    return html`
      ${this._renderHeader()}
      <div part="list" class="list">
        ${this.sources.map(source => this._renderProgressPill(source))}
      </div>
    `;
  }

  private _renderFilters() {
    const totalCount = this._totalCount;

    return html`
      <div part="list" class="list">
        ${this.showAll
          ? this._renderFilterButton(
              'all',
              this._localize.term('searchSources.allLabel'),
              totalCount,
            )
          : nothing}
        ${this.sources.map(source =>
          this._renderFilterButton(source.id, source.name, source.count, source),
        )}
      </div>
    `;
  }

  protected override render() {
    const label = this.label ?? this._localize.term('searchSources.ariaLabel');

    return html`
      <section part="container" class="container" aria-label=${label}>
        ${this.variant === 'filters' ? this._renderFilters() : this._renderProgress()}
      </section>
    `;
  }
}
