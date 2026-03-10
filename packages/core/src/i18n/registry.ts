import type { ReactiveControllerHost } from 'lit';
import type { LoquixTranslations } from './types.js';
import { en } from './translations/en.js';

/**
 * Global singleton registry that stores locale overrides and notifies
 * subscribed components when translations change.
 *
 * SECURITY NOTE: The `term()` method returns plain strings intended for
 * use in Lit templates (text nodes, attributes). Lit auto-escapes HTML,
 * so XSS is impossible as long as the result is NEVER passed to
 * `unsafeHTML()` or `innerHTML`.
 *
 * Limitations:
 * - Singleton — one locale per page; concurrent locales are not supported.
 * - SSR — call `resetLocale()` before each render request to avoid
 *   locale leakage between requests.
 * - Tests — call `resetLocale()` in `afterEach` / `setup` to isolate tests.
 */
class I18nRegistry {
  private _overrides: Partial<LoquixTranslations> = {};
  private _subscribers = new Set<ReactiveControllerHost>();
  private _pendingNotify = false;

  /** Replace all overrides at once. */
  setLocale(translations: Partial<LoquixTranslations>): void {
    this._overrides = { ...translations };
    this._scheduleNotify();
  }

  /** Merge additional overrides into the current locale. */
  updateLocale(translations: Partial<LoquixTranslations>): void {
    Object.assign(this._overrides, translations);
    this._scheduleNotify();
  }

  /** Clear all overrides, reverting to the default English locale. */
  resetLocale(): void {
    this._overrides = {};
    this._scheduleNotify();
  }

  /** Return a shallow copy of the current overrides. */
  getLocale(): Partial<LoquixTranslations> {
    return { ...this._overrides };
  }

  /**
   * Resolve a translation key with optional `{variable}` interpolation.
   * Priority: override > default English.
   */
  term(key: keyof LoquixTranslations, values?: Record<string, string | number>): string {
    let str = this._overrides[key] ?? en[key];
    if (values) {
      for (const [k, v] of Object.entries(values)) {
        str = str.replaceAll(`{${k}}`, String(v));
      }
    }
    return str;
  }

  /** Subscribe a host to locale change notifications. */
  subscribe(host: ReactiveControllerHost): void {
    this._subscribers.add(host);
  }

  /** Unsubscribe a host from locale change notifications. */
  unsubscribe(host: ReactiveControllerHost): void {
    this._subscribers.delete(host);
  }

  /**
   * Microtask-batched notification — multiple calls to `setLocale` /
   * `updateLocale` within the same microtask only trigger a single
   * `requestUpdate()` per component.
   */
  private _scheduleNotify(): void {
    if (this._pendingNotify) return;
    this._pendingNotify = true;
    queueMicrotask(() => {
      this._pendingNotify = false;
      this._subscribers.forEach(host => {
        try {
          host.requestUpdate();
        } catch {
          /* component may have been garbage-collected */
        }
      });
    });
  }
}

export const registry = new I18nRegistry();
