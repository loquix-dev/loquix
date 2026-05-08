/**
 * URL allowlist helpers for components that render user-supplied URLs (anchors,
 * favicon images, etc.). Anything outside `http(s):` returns `null` so callers
 * can render a safe fallback (a `<span>` instead of an `<a>`, a generic icon
 * instead of an `<img>`).
 */

/**
 * Returns the input URL if it parses successfully and uses an `http:` or
 * `https:` scheme; otherwise `null`. Never throws.
 *
 * Rejects: `javascript:`, `data:`, `blob:`, `file:`, `mailto:`, `ftp:`,
 * relative URLs without a base, empty/whitespace-only strings, and anything
 * that isn't a string.
 */
export function safeHttpUrl(input: unknown): string | null {
  if (typeof input !== 'string' || input.trim().length === 0) return null;
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}
