import { LitElement, html, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import type { PromptVariant } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type { LoquixPasteFilesDetail } from '../../events/index.js';
import { KeyboardController } from '../../controllers/keyboard.controller.js';
import { ResizeController } from '../../controllers/resize.controller.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-prompt-input.styles.js';

/**
 * @tag loquix-prompt-input
 * @summary A textarea-based prompt input with keyboard shortcuts and auto-resize.
 *
 * @csspart container - Outer wrapper of the input.
 * @csspart input - The native `<textarea>` element.
 *
 * @fires loquix-change - When the input value changes.
 * @fires loquix-submit - When the user submits (Enter key or programmatic).
 * @fires loquix-paste-files - When files are pasted from the clipboard.
 *
 * @cssprop [--loquix-input-bg] - Background colour of the textarea.
 * @cssprop [--loquix-input-color] - Text colour.
 * @cssprop [--loquix-input-border-color] - Border colour.
 * @cssprop [--loquix-input-focus-border-color] - Border colour when focused.
 * @cssprop [--loquix-input-placeholder-color] - Placeholder text colour.
 * @cssprop [--loquix-input-font-family] - Font family.
 * @cssprop [--loquix-input-font-size] - Font size.
 * @cssprop [--loquix-input-padding] - Inner padding.
 * @cssprop [--loquix-input-border-radius] - Border radius.
 */
export class LoquixPromptInput extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Visual variant of the input. */
  @property({ type: String, reflect: true })
  variant: PromptVariant = 'chat';

  /** Current value of the textarea. */
  @property({ type: String })
  value = '';

  /** Initial number of visible rows. */
  @property({ type: Number })
  rows = 1;

  /** Whether the textarea auto-grows with content. */
  @property({ type: Boolean, attribute: 'auto-resize' })
  autoResize = true;

  /** Whether pressing Enter submits (without Shift). */
  @property({ type: Boolean, attribute: 'submit-on-enter' })
  submitOnEnter = true;

  /** Placeholder text. */
  @property({ type: String })
  placeholder?: string;

  /** Whether the input is disabled. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  @query('textarea')
  private _textarea!: HTMLTextAreaElement;

  private _keyboard = new KeyboardController(this);
  private _resize = new ResizeController(this);

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    // Re-attach controllers on reconnection
    if (this.hasUpdated && this._textarea) {
      this._attachControllers(this._textarea);
    }
  }

  protected firstUpdated(): void {
    const textarea = this._textarea;
    if (!textarea) return;
    this._attachControllers(textarea);
  }

  protected updated(changed: PropertyValues): void {
    // Handle autoResize toggle at runtime
    if (changed.has('autoResize') && this._textarea) {
      if (this.autoResize) {
        this._resize.attach(this._textarea);
      } else {
        this._resize.detach();
      }
    }
  }

  private _attachControllers(textarea: HTMLTextAreaElement): void {
    // Attach keyboard controller to the textarea
    this._keyboard.attach(textarea);

    this._keyboard.addBinding({
      key: 'Enter',
      handler: e => {
        if (!this.submitOnEnter) return;
        e.preventDefault();
        this._handleSubmit();
      },
    });

    // Attach resize controller if auto-resize is enabled
    if (this.autoResize) {
      this._resize.attach(textarea);
    }
  }

  // ---------------------------------------------------------------------------
  // Event helpers
  // ---------------------------------------------------------------------------

  private _handleInput(e: Event): void {
    const textarea = e.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.dispatchEvent(createLoquixEvent('loquix-change', { value: this.value }));
  }

  private _handlePaste(e: ClipboardEvent): void {
    // Extract files from clipboardData.files first, then fall back to
    // clipboardData.items for WebKit which may not populate .files for
    // screenshots / in-app copies.
    const files: File[] = Array.from(e.clipboardData?.files ?? []);

    if (files.length === 0 && e.clipboardData?.items) {
      for (const item of Array.from(e.clipboardData.items)) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
    }

    if (files.length === 0) return;

    // Prevent the browser from inserting the filename as text
    e.preventDefault();

    this.dispatchEvent(createLoquixEvent<LoquixPasteFilesDetail>('loquix-paste-files', { files }));
  }

  private _handleSubmit(): void {
    const content = this.value.trim();
    if (!content) return;
    this.dispatchEvent(createLoquixEvent('loquix-submit', { content }));
    // Clear the input after submit
    this.value = '';
    if (this._textarea) {
      this._textarea.value = '';
    }
    this._resize.resize();
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected render() {
    return html`
      <div part="container" class="container">
        <textarea
          part="input"
          class="input"
          aria-label=${this.placeholder ?? this._localize.term('promptInput.placeholder')}
          .value=${this.value}
          rows=${this.rows}
          placeholder=${this.placeholder ?? this._localize.term('promptInput.placeholder')}
          ?disabled=${this.disabled}
          @input=${this._handleInput}
          @paste=${this._handlePaste}
        ></textarea>
      </div>
    `;
  }
}
