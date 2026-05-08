import { css } from 'lit';

const styles = css`
  /* Inherit font from surrounding prose — the marker wraps inline text and
     should NOT visually disrupt the paragraph it lives in. (Setting
     font-family on :host would cascade through to slotted content via the
     light DOM tree, making the marker text look heavier or differently-shaped
     than its surroundings. Tooltip below uses an explicit font-family because
     it's a separate shadow-DOM popover, not slotted prose.) */
  :host {
    display: inline;
  }

  .wrapper {
    position: relative;
    display: inline;
  }

  .marker {
    display: inline;
    cursor: help;
    outline: none;
  }
  .marker:focus-visible .text {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color));
    outline-offset: 2px;
    border-radius: 2px;
  }

  .text {
    color: inherit;
  }

  /* Underline variant — longhand only. Safari resets text-decoration-color
     when the shorthand 'text-decoration: underline wavy' is set, so the
     per-kind colour rules below would no-op in WebKit.
     'skip-ink: none' keeps the wavy line continuous across descenders
     (p, g, y) — Chrome defaults to 'auto' which carves gaps around them,
     making the wave look broken; Safari's default already keeps it solid. */
  .marker--underline .text {
    text-decoration-line: underline;
    text-decoration-style: wavy;
    text-decoration-thickness: 1.5px;
    text-decoration-skip-ink: none;
    text-underline-offset: 3px;
  }
  .marker--underline.marker--unsure .text {
    text-decoration-color: var(--loquix-uncert-unsure-color);
  }
  .marker--underline.marker--needs-verification .text {
    text-decoration-color: var(--loquix-uncert-verify-color);
  }
  .marker--underline.marker--speculative .text {
    text-decoration-color: var(--loquix-uncert-spec-color);
  }

  /* Highlight variant */
  .marker--highlight .text {
    padding: 0 3px;
    border-radius: 3px;
  }
  .marker--highlight.marker--unsure .text {
    background: var(--loquix-uncert-unsure-bg);
  }
  .marker--highlight.marker--needs-verification .text {
    background: var(--loquix-uncert-verify-bg);
  }
  .marker--highlight.marker--speculative .text {
    background: var(--loquix-uncert-spec-bg);
  }

  /* Icon variant */
  .icon {
    display: inline-flex;
    align-items: center;
    vertical-align: 1px;
    margin-left: 2px;
  }
  .icon svg {
    display: block;
  }
  .marker--icon.marker--unsure .icon {
    color: var(--loquix-uncert-unsure-color);
  }
  .marker--icon.marker--needs-verification .icon {
    color: var(--loquix-uncert-verify-color);
  }
  .marker--icon.marker--speculative .icon {
    color: var(--loquix-uncert-spec-color);
  }

  /* Tooltip — CSS-only positioning, hidden by default */
  .tooltip {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--loquix-text-color);
    color: var(--loquix-surface-bg);
    font-family: var(--loquix-font-family);
    font-size: 11.5px;
    font-weight: 500;
    padding: 5px 9px;
    border-radius: 6px;
    white-space: nowrap;
    z-index: 100;
    pointer-events: none;
    box-shadow: var(--loquix-shadow-md);
    opacity: 0;
    transition: opacity 120ms var(--loquix-transition-easing);
  }
  .tooltip.is-open {
    opacity: 1;
  }
  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--loquix-text-color);
  }
`;

export default styles;
