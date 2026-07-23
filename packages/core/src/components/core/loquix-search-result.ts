import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import type { SearchResult } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import { safeHttpUrl } from '../../utility/safe-url.js';
import styles from './loquix-search-result.styles.js';

/**
 * @tag loquix-search-result
 * @summary Single smart search result row with source, title, URL, snippet, and citation reference.
 *
 * @csspart row - The clickable row element.
 * @csspart rank - Rank column.
 * @csspart source - Source label.
 * @csspart title - Result title.
 * @csspart snippet - Result snippet.
 *
 * @fires loquix-search-result-click - Cancelable. Detail: `{ result, index }`.
 */
export class LoquixSearchResult extends LitElement {
  static override styles = [styles];

  /** Full result object. Property-only — no JSON attribute parsing. */
  @property({ attribute: false })
  result?: SearchResult;

  /** 1-based rank override. */
  @property({ type: Number })
  rank?: number;

  /** Source name fallback when `result` is not supplied. */
  @property({ type: String, attribute: 'source-name' })
  sourceName?: string;

  /** Source icon fallback when `result` is not supplied. */
  @property({ type: String, attribute: 'source-icon' })
  sourceIcon?: string;

  /** Result title fallback when `result` is not supplied. */
  @property({ type: String })
  title = '';

  /** Result URL fallback when `result` is not supplied. */
  @property({ type: String })
  url?: string;

  /** Display URL fallback when `result` is not supplied. */
  @property({ type: String, attribute: 'display-url' })
  displayUrl?: string;

  /** Snippet fallback when `result` is not supplied. */
  @property({ type: String })
  snippet?: string;

  /** Metadata fallback when `result` is not supplied. */
  @property({ type: String })
  meta?: string;

  /** Citation reference fallback when `result` is not supplied. */
  @property({ type: Number, attribute: 'citation-ref' })
  citationRef?: number;

  /** Whether the row is disabled. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  private _resolvedResult(): SearchResult {
    const base: SearchResult = {
      title: this.title,
      url: this.url,
      displayUrl: this.displayUrl,
      snippet: this.snippet,
      meta: this.meta,
      citationRef: this.citationRef,
      rank: this.rank,
      source:
        this.sourceName || this.sourceIcon
          ? {
              id: this.sourceName ?? 'source',
              name: this.sourceName ?? '',
              icon: this.sourceIcon,
            }
          : undefined,
    };
    const result = this.result ? { ...base, ...this.result } : base;
    return {
      ...result,
      rank: result.rank ?? this.rank,
    };
  }

  private _handleClick(e: MouseEvent, result: SearchResult, safeUrl: string | null): void {
    if (this.disabled) {
      e.preventDefault();
      return;
    }
    const ev = createLoquixEvent(
      'loquix-search-result-click',
      { result, index: result.rank ?? this.rank },
      { cancelable: true },
    );
    this.dispatchEvent(ev);
    if (!safeUrl || ev.defaultPrevented) {
      e.preventDefault();
    }
  }

  private _renderRow(result: SearchResult): TemplateResult {
    const safeUrl = safeHttpUrl(result.url);
    const row = html`
      ${result.rank != null ? html`<span part="rank" class="rank">${result.rank}.</span>` : nothing}
      <span class="body">
        <span class="top">
          ${result.source
            ? html`<span part="source" class="source">
                ${result.source.icon
                  ? html`<span class="source-icon" aria-hidden="true">${result.source.icon}</span>`
                  : nothing}
                <span>${result.source.name}</span>
              </span>`
            : nothing}
          ${result.displayUrl || result.url
            ? html`${result.source ? html`<span class="sep">/</span>` : nothing}
                <span class="url">${result.displayUrl ?? result.url}</span>`
            : nothing}
          ${result.meta
            ? html`<span class="sep">/</span><span class="meta">${result.meta}</span>`
            : nothing}
          ${result.citationRef != null
            ? html`<span class="citation">cited as [${result.citationRef}]</span>`
            : nothing}
        </span>
        <span part="title" class="title">${result.title}</span>
        ${result.snippet
          ? html`<span part="snippet" class="snippet">${result.snippet}</span>`
          : nothing}
      </span>
    `;

    if (safeUrl) {
      return html`<a
        part="row"
        class="row"
        href=${safeUrl}
        target="_blank"
        rel="noreferrer"
        @click=${(e: MouseEvent) => this._handleClick(e, result, safeUrl)}
        >${row}</a
      >`;
    }

    return html`<button
      part="row"
      class="row"
      type="button"
      ?disabled=${this.disabled}
      @click=${(e: MouseEvent) => this._handleClick(e, result, safeUrl)}
    >
      ${row}
    </button>`;
  }

  protected override render() {
    return this._renderRow(this._resolvedResult());
  }
}
