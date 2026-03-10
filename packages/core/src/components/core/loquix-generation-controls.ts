import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { GenerationState } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-generation-controls.styles.js';

/**
 * @tag loquix-generation-controls
 * @summary Control buttons (stop, pause, resume) shown during AI generation.
 *
 * @csspart controls - Outer wrapper.
 * @csspart button - Each individual `<button>`.
 *
 * @fires loquix-stop - When the stop button is clicked.
 * @fires loquix-pause - When the pause button is clicked.
 * @fires loquix-resume - When the resume button is clicked.
 *
 * @cssprop [--loquix-gen-controls-gap] - Gap between buttons.
 * @cssprop [--loquix-gen-button-bg] - Default button background.
 * @cssprop [--loquix-gen-button-color] - Default button text colour.
 * @cssprop [--loquix-gen-stop-bg] - Stop button background.
 * @cssprop [--loquix-gen-stop-color] - Stop button text colour.
 */
export class LoquixGenerationControls extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Current generation state. Controls which buttons are visible. */
  @property({ type: String, reflect: true })
  state: GenerationState = 'idle';

  /** Whether to show a Pause button alongside Stop when running. */
  @property({ type: Boolean, attribute: 'show-pause', reflect: true })
  showPause = false;

  /** Whether to show a Skip button when running (future use). */
  @property({ type: Boolean, attribute: 'show-skip', reflect: true })
  showSkip = false;

  // ---------------------------------------------------------------------------
  // Event helpers
  // ---------------------------------------------------------------------------

  private _emit(name: string, detail: Record<string, unknown> = {}) {
    this.dispatchEvent(createLoquixEvent(name, detail));
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  /** Stop icon (filled square) */
  private _renderStop() {
    return html`
      <button
        part="button"
        class="button button--stop"
        aria-label=${this._localize.term('generationControls.stopLabel')}
        @click=${() => this._emit('loquix-stop', {})}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
        <span>${this._localize.term('generationControls.stop')}</span>
      </button>
    `;
  }

  /** Pause icon */
  private _renderPause() {
    return html`
      <button
        part="button"
        class="button"
        aria-label=${this._localize.term('generationControls.pauseLabel')}
        @click=${() => this._emit('loquix-pause', {})}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
        <span>${this._localize.term('generationControls.pause')}</span>
      </button>
    `;
  }

  /** Resume / play icon */
  private _renderResume() {
    return html`
      <button
        part="button"
        class="button"
        aria-label=${this._localize.term('generationControls.resumeLabel')}
        @click=${() => this._emit('loquix-resume', {})}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span>${this._localize.term('generationControls.resume')}</span>
      </button>
    `;
  }

  protected render() {
    if (this.state === 'idle' || this.state === 'complete' || this.state === 'error') {
      return nothing;
    }

    return html`
      <div
        part="controls"
        class="controls"
        role="toolbar"
        aria-label=${this._localize.term('generationControls.toolbarLabel')}
      >
        ${this.state === 'running'
          ? html` ${this._renderStop()} ${this.showPause ? this._renderPause() : nothing} `
          : nothing}
        ${this.state === 'paused' ? this._renderResume() : nothing}
      </div>
    `;
  }
}
