import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { MessageContentType, StreamingCursorVariant } from '../../types/index.js';
import styles from './loquix-message-content.styles.js';

/**
 * @tag loquix-message-content
 * @summary Renders message content as plain text or a code block with optional streaming cursor.
 *
 * @slot - Default slot for text content (type='text')
 *
 * @csspart content  - Wrapper around text content
 * @csspart code-block - The `<pre>` element for code content
 *
 * @cssprop --loquix-message-font-size
 * @cssprop --loquix-message-line-height
 * @cssprop --loquix-code-font-family
 * @cssprop --loquix-surface-secondary-bg
 * @cssprop --loquix-cursor-color - Cursor color (default: currentColor)
 *
 * @csspart cursor - The streaming cursor indicator
 */
export class LoquixMessageContent extends LitElement {
  static override styles = styles;

  /** The content type to render. */
  @property({ reflect: true })
  type: MessageContentType = 'text';

  /** Whether the message is currently being streamed. */
  @property({ type: Boolean, reflect: true })
  streaming = false;

  /** Streaming cursor style. Only visible when `streaming` is true. */
  @property({ attribute: 'streaming-cursor', reflect: true })
  streamingCursor: StreamingCursorVariant = 'none';

  /** Whether inline action buttons are allowed inside this content block. */
  @property({ type: Boolean, attribute: 'allow-inline-actions', reflect: true })
  allowInlineActions = false;

  /** Raw code string rendered safely inside a code block when type is 'code'. */
  @property()
  code?: string;

  // ── Rendering ──────────────────────────────────────────────

  protected override render() {
    return this.type === 'code' ? this._renderCode() : this._renderText();
  }

  private _renderText() {
    return html` <div class="content" part="content"><slot></slot>${this._renderCursor()}</div> `;
  }

  private _renderCode() {
    return html`
      <pre class="code-block" part="code-block"><code>${this.code ??
      ''}</code>${this._renderCursor()}</pre>
    `;
  }

  private static _validCursors = new Set(['caret', 'block']);

  private _renderCursor() {
    if (!this.streaming || !LoquixMessageContent._validCursors.has(this.streamingCursor))
      return nothing;
    return html`<span
      part="cursor"
      class="streaming-cursor ${this.streamingCursor}"
      aria-hidden="true"
    ></span>`;
  }
}
