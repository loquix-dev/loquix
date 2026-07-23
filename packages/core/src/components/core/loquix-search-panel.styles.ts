import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    position: relative;
    width: 100%;
    --_loquix-search-panel-input-height: 40px;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  :host([size='lg']) {
    --_loquix-search-panel-input-height: 52px;
  }

  .container {
    width: 100%;
    box-sizing: border-box;
  }

  .query {
    position: relative;
    z-index: var(--loquix-search-panel-query-z-index, 1001);
  }

  .panel-shell {
    position: absolute;
    top: calc(100% + var(--loquix-search-panel-offset, 8px));
    left: 0;
    z-index: var(--loquix-search-panel-z-index, 1000);
    width: 100%;
    max-height: var(--loquix-search-panel-max-height, min(560px, calc(100vh - 24px)));
    box-sizing: border-box;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-4px) scale(0.995);
    visibility: hidden;
    transition:
      opacity 160ms ease,
      transform 160ms ease,
      visibility 0ms linear 160ms;
  }

  :host([open]) .panel-shell {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scale(1);
    visibility: visible;
    transition:
      opacity 160ms ease,
      transform 160ms ease,
      visibility 0ms;
  }

  .panel {
    display: flex;
    min-height: 0;
    max-height: inherit;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px solid var(--loquix-search-panel-border-color, var(--loquix-border-color, #e5e7eb));
    border-radius: var(--loquix-search-panel-border-radius, 16px);
    background: var(--loquix-search-panel-bg, var(--loquix-surface-bg, #ffffff));
    box-shadow: var(--loquix-search-panel-shadow, 0 18px 48px rgb(17 24 39 / 0.1));
    overflow: hidden;
  }

  :host([variant='integrated']) .panel-shell {
    top: calc(var(--loquix-search-panel-surface-padding, 10px) * -1);
    left: calc(var(--loquix-search-panel-surface-padding, 10px) * -1);
    width: calc(100% + var(--loquix-search-panel-surface-padding, 10px) * 2);
  }

  :host([variant='integrated']) .panel {
    padding-top: calc(
      var(--_loquix-search-panel-input-height) + var(--loquix-search-panel-surface-padding, 10px)
    );
  }

  .sources {
    padding: 12px 12px 10px;
    flex: 0 0 auto;
  }

  .body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    overflow-y: auto;
    padding: 0 12px 12px;
  }

  .suggestions[hidden],
  .answer[hidden],
  .results[hidden] {
    display: none;
  }

  .suggestions {
    padding-top: 12px;
  }

  .suggestions ::slotted(loquix-suggestion-chips) {
    --loquix-chip-bg: var(--loquix-search-panel-suggestion-bg, var(--loquix-surface-bg, #ffffff));
    --loquix-chip-border-color: var(
      --loquix-search-panel-suggestion-border-color,
      var(--loquix-border-color, #e5e7eb)
    );
    --loquix-chip-color: var(
      --loquix-search-panel-suggestion-color,
      var(--loquix-text-color, #111827)
    );
    --loquix-chip-hover-bg: var(
      --loquix-search-panel-suggestion-hover-bg,
      var(--loquix-overlay-subtle, rgb(0 0 0 / 0.04))
    );
    --loquix-chip-padding: 7px 12px;
    --loquix-chip-font-size: 0.8125rem;
  }

  .footer {
    border-top: 1px solid
      var(--loquix-search-panel-divider-color, var(--loquix-border-subtle, #eef2f7));
    flex: 0 0 auto;
  }

  @media (max-width: 560px) {
    .panel {
      border-radius: var(--loquix-search-panel-mobile-border-radius, 14px);
    }

    .sources {
      padding: 10px 10px 8px;
    }

    .body {
      padding: 0 10px 10px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .panel-shell {
      transition: none;
    }
  }
`;

export default styles;
