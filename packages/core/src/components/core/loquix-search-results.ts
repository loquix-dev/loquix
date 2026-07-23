import { LitElement, html, svg, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { SearchResult, SearchResultsLayout, SearchSource } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-search-results.styles.js';

const chevronSvg = svg`
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`;

interface SearchResultGroup {
  key: string;
  source?: SearchSource;
  results: SearchResult[];
}

/**
 * @tag loquix-search-results
 * @summary Smart search result container with blended and source-sectioned layouts.
 *
 * @csspart container - The outer results wrapper.
 * @csspart empty - Empty state text.
 * @csspart section - A grouped source section.
 * @csspart section-header - A source section header.
 * @csspart section-items - Result rows inside a section.
 */
export class LoquixSearchResults extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** Results to render. Property-only — no JSON attribute parsing. */
  @property({ attribute: false })
  results: SearchResult[] = [];

  /** Results layout. */
  @property({ type: String, reflect: true })
  layout: SearchResultsLayout = 'blended';

  /** Empty-state text override. */
  @property({ type: String, attribute: 'empty-text' })
  emptyText?: string;

  private _groupResults(): SearchResultGroup[] {
    const groups = new Map<string, SearchResultGroup>();

    for (const result of this.results) {
      const source = result.source;
      const key = source?.id ?? source?.name ?? 'unknown';
      if (!groups.has(key)) {
        groups.set(key, { key, source, results: [] });
      }
      groups.get(key)!.results.push(result);
    }

    return Array.from(groups.values());
  }

  private _renderResult(result: SearchResult, index: number) {
    const rank = result.rank ?? index + 1;
    return html`<loquix-search-result .result=${{ ...result, rank }}></loquix-search-result>`;
  }

  private _renderBlended() {
    return html`${this.results.map((result, index) => this._renderResult(result, index))}`;
  }

  private _renderSection(group: SearchResultGroup) {
    const sourceName = group.source?.name ?? this._localize.term('searchResults.unknownSource');
    const countLabel =
      group.results.length === 1
        ? this._localize.term('searchResults.resultCountOne')
        : this._localize.term('searchResults.resultCount', { count: group.results.length });

    return html`
      <details part="section" class="section" open>
        <summary part="section-header" class="summary">
          ${group.source?.icon
            ? html`<span class="source-icon" aria-hidden="true">${group.source.icon}</span>`
            : nothing}
          <span class="source-name">${sourceName}</span>
          <span part="count" class="count">${countLabel}</span>
          ${group.source?.duration ? html`<span class="duration">${group.source.duration}</span>` : nothing}
          <span class="chevron">${chevronSvg}</span>
        </summary>
        <div part="section-items" class="items">
          ${group.results.map((result, index) => this._renderResult({ ...result, rank: undefined }, index))}
        </div>
      </details>
    `;
  }

  private _renderSectioned() {
    return html`${this._groupResults().map(group => this._renderSection(group))}`;
  }

  protected override render() {
    if (this.results.length === 0) {
      return html`<div part="empty" class="empty">
        ${this.emptyText ?? this._localize.term('searchResults.empty')}
      </div>`;
    }

    return html`
      <div part="container" class="container">
        ${this.layout === 'sectioned' ? this._renderSectioned() : this._renderBlended()}
      </div>
    `;
  }
}
