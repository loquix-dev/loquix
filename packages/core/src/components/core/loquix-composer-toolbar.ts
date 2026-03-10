import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './loquix-composer-toolbar.styles.js';

/**
 * @tag loquix-composer-toolbar
 * @summary A simple toolbar bar with left/right slots, placed above or below the chat composer.
 *
 * @csspart toolbar - The outer toolbar wrapper.
 * @csspart left - Left-aligned section.
 * @csspart right - Right-aligned section.
 *
 * @slot actions-left - Items aligned to the left (model selector, permissions, etc.).
 * @slot actions-right - Items aligned to the right (branch selector, settings, etc.).
 *
 * @cssprop [--loquix-composer-toolbar-padding] - Toolbar padding.
 * @cssprop [--loquix-composer-toolbar-gap] - Gap between left and right sections.
 * @cssprop [--loquix-composer-toolbar-item-gap] - Gap between items within a section.
 * @cssprop [--loquix-composer-toolbar-min-height] - Minimum toolbar height.
 * @cssprop [--loquix-composer-toolbar-border-color] - Border colour when border attribute is set.
 */
export class LoquixComposerToolbar extends LitElement {
  static styles = [styles];

  /** Which side to draw a 1px separator: 'none', 'top', or 'bottom'. */
  @property({ type: String, reflect: true })
  border: 'none' | 'top' | 'bottom' = 'none';

  protected render() {
    return html`
      <div part="toolbar" class="toolbar">
        <div part="left" class="toolbar__left">
          <slot name="actions-left"></slot>
        </div>
        <div part="right" class="toolbar__right">
          <slot name="actions-right"></slot>
        </div>
      </div>
    `;
  }
}
