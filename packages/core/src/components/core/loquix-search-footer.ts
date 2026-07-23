import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import type { SearchShortcut } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-search-footer.styles.js';

/**
 * @tag loquix-search-footer
 * @summary Footer row for search panels and command palettes with keyboard shortcuts.
 *
 * @csspart footer - The outer footer container.
 * @csspart shortcuts - The shortcut list.
 * @csspart shortcut - A single shortcut item.
 * @csspart key - Shortcut key/chord.
 * @csspart label - Shortcut action label.
 * @csspart actions - Optional trailing actions slot container.
 *
 * @slot actions - Optional trailing controls or status text.
 */
export class LoquixSearchFooter extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** Keyboard shortcuts to render. Property-only — no JSON attribute parsing. */
  @property({ attribute: false })
  shortcuts: SearchShortcut[] = [];

  /** Accessible label override. */
  @property({ type: String })
  label?: string;

  protected override render() {
    const label = this.label ?? this._localize.term('searchFooter.ariaLabel');

    return html`
      <footer part="footer" class="footer" aria-label=${label}>
        <div part="shortcuts" class="shortcuts">
          ${this.shortcuts.map(
            shortcut => html`
              <span part="shortcut" class="shortcut">
                <kbd part="key" class="key">${shortcut.key}</kbd>
                <span part="label" class="label">${shortcut.label}</span>
              </span>
            `,
          )}
        </div>
        <div part="actions" class="actions"><slot name="actions"></slot></div>
      </footer>
    `;
  }
}
