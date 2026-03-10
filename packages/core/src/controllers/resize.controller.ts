import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * ResizeController — auto-resizes a textarea element based on its content.
 *
 * Used in: loquix-prompt-input (auto-expand textarea)
 */
export class ResizeController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private _textarea: HTMLTextAreaElement | null = null;
  private _minRows = 1;
  private _maxRows = 10;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    options?: { minRows?: number; maxRows?: number },
  ) {
    this.host = host;
    host.addController(this);
    if (options?.minRows) this._minRows = options.minRows;
    if (options?.maxRows) this._maxRows = options.maxRows;
  }

  hostConnected(): void {
    // Will be attached via attach()
  }

  hostDisconnected(): void {
    this.detach();
  }

  /** Attach to a textarea element */
  attach(textarea: HTMLTextAreaElement): void {
    this.detach();
    this._textarea = textarea;
    textarea.addEventListener('input', this._onInput);
    // Initial resize
    this.resize();
  }

  detach(): void {
    if (this._textarea) {
      this._textarea.removeEventListener('input', this._onInput);
      this._textarea = null;
    }
  }

  /** Trigger a resize calculation */
  resize(): void {
    const textarea = this._textarea;
    if (!textarea) return;

    // Reset height to auto to get the scrollHeight
    textarea.style.height = 'auto';

    // Calculate line height from computed styles
    const computed = getComputedStyle(textarea);
    const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.2;
    const paddingTop = parseFloat(computed.paddingTop) || 0;
    const paddingBottom = parseFloat(computed.paddingBottom) || 0;
    const borderTop = parseFloat(computed.borderTopWidth) || 0;
    const borderBottom = parseFloat(computed.borderBottomWidth) || 0;

    const minHeight =
      lineHeight * this._minRows + paddingTop + paddingBottom + borderTop + borderBottom;
    const maxHeight =
      lineHeight * this._maxRows + paddingTop + paddingBottom + borderTop + borderBottom;

    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  private _onInput = (): void => {
    this.resize();
  };
}
