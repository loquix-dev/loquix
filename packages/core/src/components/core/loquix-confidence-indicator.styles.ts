import { css } from 'lit';

const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    font-family: var(--loquix-font-family);
    vertical-align: middle;
  }

  /* === Bar variant === */
  .bar {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--loquix-text-secondary-color);
  }
  .bar__label {
    font-weight: 500;
    color: var(--loquix-text-color);
  }
  .bar__track {
    position: relative;
    width: 80px;
    height: 6px;
    background: var(--loquix-overlay-subtle);
    border-radius: 999px;
    overflow: hidden;
  }
  .bar__fill {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: inherit;
    transition: width 300ms var(--loquix-transition-easing);
  }
  .bar--low .bar__fill {
    background: var(--loquix-conf-low-fill);
  }
  .bar--medium .bar__fill {
    background: var(--loquix-conf-med-fill);
  }
  .bar--high .bar__fill {
    background: var(--loquix-conf-high-fill);
  }
  .bar__val {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    font-size: 11.5px;
  }
  .bar--low .bar__val {
    color: var(--loquix-conf-low-color);
  }
  .bar--medium .bar__val {
    color: var(--loquix-conf-med-color);
  }
  .bar--high .bar__val {
    color: var(--loquix-conf-high-color);
  }

  /* === Dots variant === */
  .dots {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }
  .dots__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--loquix-overlay-subtle);
    transition: background 200ms;
  }
  .dots--low .dots__dot.is-on {
    background: var(--loquix-conf-low-fill);
  }
  .dots--medium .dots__dot.is-on {
    background: var(--loquix-conf-med-fill);
  }
  .dots--high .dots__dot.is-on {
    background: var(--loquix-conf-high-fill);
  }
  .dots__label {
    color: var(--loquix-text-secondary-color);
    margin-left: 4px;
  }

  /* === Badge variant === */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px 2px 7px;
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 600;
    text-transform: capitalize;
  }
  .badge__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .badge__val {
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    opacity: 0.85;
  }
  .badge--low {
    background: var(--loquix-conf-low-bg);
    color: var(--loquix-conf-low-color);
  }
  .badge--low .badge__dot {
    background: var(--loquix-conf-low-fill);
  }
  .badge--medium {
    background: var(--loquix-conf-med-bg);
    color: var(--loquix-conf-med-color);
  }
  .badge--medium .badge__dot {
    background: var(--loquix-conf-med-fill);
  }
  .badge--high {
    background: var(--loquix-conf-high-bg);
    color: var(--loquix-conf-high-color);
  }
  .badge--high .badge__dot {
    background: var(--loquix-conf-high-fill);
  }

  /* === Numeric variant === */
  .num {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.1;
  }
  .num__val {
    font-size: 22px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .num__pct {
    font-size: 13px;
    opacity: 0.65;
    margin-left: 1px;
  }
  .num__label {
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--loquix-text-secondary-color);
    margin-top: 2px;
  }
  .num--low .num__val {
    color: var(--loquix-conf-low-color);
  }
  .num--medium .num__val {
    color: var(--loquix-conf-med-color);
  }
  .num--high .num__val {
    color: var(--loquix-conf-high-color);
  }
`;

export default styles;
