import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { ConfidenceLevel, ConfidenceVariant } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import type { LoquixTranslations } from '../../i18n/index.js';
import styles from './loquix-confidence-indicator.styles.js';

const LEVEL_KEYS: Record<ConfidenceLevel, keyof LoquixTranslations> = {
  low: 'confidenceIndicator.levelLow',
  medium: 'confidenceIndicator.levelMedium',
  high: 'confidenceIndicator.levelHigh',
};

const DEFAULT_LOW = 0.4;
const DEFAULT_HIGH = 0.75;
const DOTS_TOTAL = 5;

const isFiniteNumber = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);
const isValidThreshold = (n: unknown): n is number => isFiniteNumber(n) && n >= 0 && n <= 1;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * @tag loquix-confidence-indicator
 * @summary Visualises an assistant confidence score (0..1) as a bar / dots / badge / numeric.
 *
 * Auto-derives `level` (`low` / `medium` / `high`) from `value` using `low-threshold`
 * and `high-threshold`. If thresholds are invalid or inverted, both reset to defaults
 * (0.4 / 0.75) so the derived level still tracks the value. Setting `level` explicitly
 * overrides the derived value.
 *
 * @csspart meter - The host element acts as the meter wrapper.
 * @csspart track - The bar variant track.
 * @csspart fill - The bar variant fill.
 * @csspart dot - A dot in the dots variant.
 * @csspart value - The numeric value text.
 * @csspart label - The label text.
 *
 * @cssprop [--loquix-conf-low-bg] - Low-confidence background.
 * @cssprop [--loquix-conf-low-color] - Low-confidence foreground.
 * @cssprop [--loquix-conf-low-fill] - Low-confidence solid fill (bar/dot).
 * @cssprop [--loquix-conf-med-bg] - Medium-confidence background.
 * @cssprop [--loquix-conf-med-color] - Medium-confidence foreground.
 * @cssprop [--loquix-conf-med-fill] - Medium-confidence solid fill (bar/dot).
 * @cssprop [--loquix-conf-high-bg] - High-confidence background.
 * @cssprop [--loquix-conf-high-color] - High-confidence foreground.
 * @cssprop [--loquix-conf-high-fill] - High-confidence solid fill (bar/dot).
 */
export class LoquixConfidenceIndicator extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** Confidence score in [0, 1]. Values outside the range are clamped. */
  @property({ type: Number })
  value = 0;

  /** Visual variant. */
  @property({ type: String, reflect: true })
  variant: ConfidenceVariant = 'bar';

  /** Optional override for the derived level. When set, beats the threshold-based derivation. */
  @property({ type: String, reflect: true })
  level?: ConfidenceLevel;

  /** Optional textual label. Falls back to a localised default for `aria-label`. */
  @property({ type: String })
  label?: string;

  /** Lower threshold — `value < lowThreshold` → `low`. Invalid values fall back to 0.4. */
  @property({ type: Number, attribute: 'low-threshold' })
  lowThreshold = DEFAULT_LOW;

  /** Upper threshold — `value >= highThreshold` → `high`. Invalid values fall back to 0.75. */
  @property({ type: Number, attribute: 'high-threshold' })
  highThreshold = DEFAULT_HIGH;

  /** Whether to render the numeric percentage alongside the visual. */
  @property({ type: Boolean, attribute: 'show-value' })
  showValue = true;

  // ---------------------------------------------------------------------------
  // Derivation
  // ---------------------------------------------------------------------------

  private _deriveLevel(): ConfidenceLevel {
    if (this.level === 'low' || this.level === 'medium' || this.level === 'high') {
      return this.level;
    }
    let effLow = isValidThreshold(this.lowThreshold) ? this.lowThreshold : DEFAULT_LOW;
    let effHigh = isValidThreshold(this.highThreshold) ? this.highThreshold : DEFAULT_HIGH;
    if (effLow >= effHigh) {
      effLow = DEFAULT_LOW;
      effHigh = DEFAULT_HIGH;
    }
    const v = clamp01(isFiniteNumber(this.value) ? this.value : 0);
    if (v >= effHigh) return 'high';
    if (v < effLow) return 'low';
    return 'medium';
  }

  /**
   * The currently effective confidence level, derived from `value`/thresholds
   * unless `level` is explicitly set. Exposed for tests and consumers who need
   * to read the derived value without recomputing it themselves.
   */
  get effectiveLevel(): ConfidenceLevel {
    return this._deriveLevel();
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected override render() {
    const v = clamp01(isFiniteNumber(this.value) ? this.value : 0);
    const pct = Math.round(v * 100);
    const lvl = this._deriveLevel();
    const levelText = this._localize.term(LEVEL_KEYS[lvl]);
    const labelText = this.label ?? this._localize.term('confidenceIndicator.labelDefault');

    if (this.variant === 'badge') {
      return html`
        <span
          part="meter"
          class="badge badge--${lvl}"
          role="meter"
          aria-valuenow=${pct}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuetext=${levelText}
          aria-label=${labelText}
        >
          <span class="badge__dot"></span>
          <span part="label" class="badge__label">${this.label ?? `${levelText}`}</span>
          ${this.showValue ? html`<span part="value" class="badge__val">${pct}%</span>` : nothing}
        </span>
      `;
    }

    if (this.variant === 'numeric') {
      return html`
        <span
          part="meter"
          class="num num--${lvl}"
          role="meter"
          aria-valuenow=${pct}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuetext=${levelText}
          aria-label=${labelText}
        >
          <span part="value" class="num__val">${pct}<span class="num__pct">%</span></span>
          <span part="label" class="num__label">${this.label ?? labelText}</span>
        </span>
      `;
    }

    if (this.variant === 'dots') {
      // 0 dots at value=0, 5 dots at value=1, monotonic in between.
      const filled = Math.round(v * DOTS_TOTAL);
      return html`
        <span
          part="meter"
          class="dots dots--${lvl}"
          role="meter"
          aria-valuenow=${pct}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuetext=${levelText}
          aria-label=${labelText}
        >
          ${Array.from({ length: DOTS_TOTAL }).map(
            (_, i) => html`<span part="dot" class="dots__dot ${i < filled ? 'is-on' : ''}"></span>`,
          )}
          ${this.label
            ? html`<span part="label" class="dots__label">${this.label}</span>`
            : nothing}
        </span>
      `;
    }

    // bar (default)
    return html`
      <span
        part="meter"
        class="bar bar--${lvl}"
        role="meter"
        aria-valuenow=${pct}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuetext=${levelText}
        aria-label=${labelText}
      >
        ${this.label ? html`<span part="label" class="bar__label">${this.label}</span>` : nothing}
        <span part="track" class="bar__track">
          <span part="fill" class="bar__fill" style="width: ${pct}%"></span>
        </span>
        ${this.showValue ? html`<span part="value" class="bar__val">${pct}%</span>` : nothing}
      </span>
    `;
  }
}
