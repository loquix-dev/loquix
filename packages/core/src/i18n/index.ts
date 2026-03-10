import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { LoquixTranslations } from './types.js';
import { registry } from './registry.js';

export type { LoquixTranslations } from './types.js';
export { en } from './translations/en.js';

// ---------------------------------------------------------------------------
// Public API — global locale management
// ---------------------------------------------------------------------------

/**
 * Replace all translation overrides at once.
 *
 * ```ts
 * import { setLocale } from '@aspect/loquix';
 *
 * setLocale({
 *   'chatComposer.placeholder': 'Введите сообщение...',
 *   'chatComposer.sendLabel': 'Отправить',
 * });
 * ```
 */
export function setLocale(translations: Partial<LoquixTranslations>): void {
  registry.setLocale(translations);
}

/**
 * Merge additional overrides into the current locale without
 * removing previously set keys.
 */
export function updateLocale(translations: Partial<LoquixTranslations>): void {
  registry.updateLocale(translations);
}

/** Clear all overrides, reverting to the default English locale. */
export function resetLocale(): void {
  registry.resetLocale();
}

/** Return a shallow copy of the current locale overrides. */
export function getLocale(): Partial<LoquixTranslations> {
  return registry.getLocale();
}

// ---------------------------------------------------------------------------
// LocalizeController — per-component reactive controller
// ---------------------------------------------------------------------------

/**
 * Reactive controller that gives a component access to the current locale.
 *
 * Subscribes to the global registry on `hostConnected` and unsubscribes
 * on `hostDisconnected`. Calls `host.requestUpdate()` automatically when
 * the locale changes.
 *
 * Usage inside a LitElement:
 * ```ts
 * private _localize = new LocalizeController(this);
 *
 * render() {
 *   return html`<button aria-label=${this._localize.term('chatComposer.sendLabel')}>Send</button>`;
 * }
 * ```
 */
export class LocalizeController implements ReactiveController {
  private _host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    this._host = host;
    host.addController(this);
  }

  hostConnected(): void {
    registry.subscribe(this._host);
    // Re-render to pick up any locale changes that occurred while disconnected.
    this._host.requestUpdate();
  }

  hostDisconnected(): void {
    registry.unsubscribe(this._host);
  }

  /**
   * Resolve a translation key with optional `{variable}` interpolation.
   */
  term(key: keyof LoquixTranslations, values?: Record<string, string | number>): string {
    return registry.term(key, values);
  }
}
