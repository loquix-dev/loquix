import { LitElement, html, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import type { Source, SourceListLayout } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import { createLoquixEvent } from '../../events/index.js';
import { safeHttpUrl } from '../../utility/safe-url.js';
import styles from './loquix-source-list.styles.js';

let _idCounter = 0;
const nextId = (): number => ++_idCounter;

const linkSvg = svg`
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
 * @tag loquix-source-list
 * @summary Anchored grid or list of sources under an assistant message.
 *
 * Indices are 1-based and match the numbering in `loquix-citation-popover`.
 * `loquix-source-click` is dispatched with `cancelable: true` before
 * navigation; consumers can `e.preventDefault()` to keep the user on-page
 * (e.g. open in a side panel instead).
 *
 * Each source's `url` and `favicon` are validated against an `http(s):`
 * allowlist before rendering — sources with unsafe URLs render as a
 * non-anchor `<span>` row (visible but inert).
 *
 * @csspart container - The outer wrapper.
 * @csspart header - The "N sources" header row.
 * @csspart items - The grid/list container.
 * @csspart source - A single source row (`<a>` or `<span>`).
 * @csspart top - The top metadata row inside a source.
 * @csspart index - The numeric badge.
 * @csspart host - The host name.
 * @csspart title - The source title.
 * @csspart snippet - The snippet text.
 *
 * @fires loquix-source-click - Cancelable. Detail: `{ index, source }`.
 *
 * @cssprop [--loquix-ai-color] - Hover border / index foreground.
 * @cssprop [--loquix-ai-color-subtle] - Index background.
 */
export class LoquixSourceList extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);
  private _uid = nextId();

  /** Sources to render. Property-only — no JSON-attribute parsing. */
  @property({ attribute: false })
  sources: Source[] = [];

  /** Display variant. */
  @property({ type: String, reflect: true })
  layout: SourceListLayout = 'grid';

  /** Override the localised heading. */
  @property({ type: String })
  heading?: string;

  // ---------------------------------------------------------------------------
  // Click handler — dispatches a cancelable event and gates anchor navigation.
  // ---------------------------------------------------------------------------

  private _onSourceClick(e: MouseEvent, index: number, source: Source): void {
    const ev = createLoquixEvent('loquix-source-click', { index, source }, { cancelable: true });
    this.dispatchEvent(ev);
    if (ev.defaultPrevented) {
      e.preventDefault();
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected override render() {
    const count = this.sources.length;
    const headerId = `lq-source-list-heading-${this._uid}`;
    const heading =
      this.heading ??
      (count === 1
        ? this._localize.term('sourceList.headingOne')
        : this._localize.term('sourceList.heading', { count }));

    return html`
      <section part="container" class="container" aria-labelledby=${headerId}>
        <div part="header" class="header" id=${headerId}>${linkSvg}<span>${heading}</span></div>
        <div part="items" class="items">
          ${this.sources.map((source, i) => this._renderSource(source, i + 1))}
        </div>
      </section>
    `;
  }

  private _renderSource(source: Source, index: number) {
    const safeUrl = safeHttpUrl(source.url);
    const openLabel = this._localize.term('sourceList.openLabel', { index });

    const inner = html`
      <span part="top" class="source-top">
        <span part="index" class="source-index">${index}</span>
        ${source.host ? html`<span part="host" class="source-host">${source.host}</span>` : nothing}
        ${externalSvg}
      </span>
      <span part="title" class="source-title">${source.title}</span>
      ${source.snippet
        ? html`<span part="snippet" class="source-snippet">${source.snippet}</span>`
        : nothing}
    `;

    if (!safeUrl) {
      return html`<span part="source" class="source">${inner}</span>`;
    }

    return html`<a
      part="source"
      class="source"
      href=${safeUrl}
      target="_blank"
      rel="noreferrer"
      aria-label=${openLabel}
      @click=${(e: MouseEvent) => this._onSourceClick(e, index, source)}
      >${inner}</a
    >`;
  }
}
