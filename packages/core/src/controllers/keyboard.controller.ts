import type { ReactiveController, ReactiveControllerHost } from 'lit';

export interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (event: KeyboardEvent) => void;
}

/**
 * KeyboardController — manages keyboard shortcuts and key bindings.
 *
 * Used in: loquix-prompt-input (Enter to submit), loquix-chat-container (global shortcuts)
 */
export class KeyboardController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private _bindings: KeyBinding[] = [];
  private _target: HTMLElement | null = null;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    // Default to host element
    this.attach(this.host);
  }

  hostDisconnected(): void {
    this.detach();
  }

  /** Attach keyboard listener to a specific element */
  attach(target: HTMLElement): void {
    this.detach();
    this._target = target;
    target.addEventListener('keydown', this._onKeyDown);
  }

  detach(): void {
    if (this._target) {
      this._target.removeEventListener('keydown', this._onKeyDown);
      this._target = null;
    }
  }

  /** Register a key binding */
  addBinding(binding: KeyBinding): void {
    this._bindings.push(binding);
  }

  /** Remove a key binding by key */
  removeBinding(key: string): void {
    this._bindings = this._bindings.filter(b => b.key !== key);
  }

  /** Clear all bindings */
  clearBindings(): void {
    this._bindings = [];
  }

  private _onKeyDown = (event: KeyboardEvent): void => {
    // Skip if composing (IME input)
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    for (const binding of this._bindings) {
      if (this._matchesBinding(event, binding)) {
        binding.handler(event);
        return;
      }
    }
  };

  private _matchesBinding(event: KeyboardEvent, binding: KeyBinding): boolean {
    if (event.key !== binding.key) return false;
    if (binding.ctrl && !event.ctrlKey) return false;
    if (binding.shift && !event.shiftKey) return false;
    if (binding.alt && !event.altKey) return false;
    if (binding.meta && !event.metaKey) return false;

    // If no modifiers specified, ensure none are pressed
    if (!binding.ctrl && event.ctrlKey) return false;
    if (!binding.shift && event.shiftKey) return false;
    if (!binding.alt && event.altKey) return false;
    if (!binding.meta && event.metaKey) return false;

    return true;
  }
}
