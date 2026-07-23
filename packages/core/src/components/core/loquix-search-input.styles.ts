import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    width: 100%;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  :host([disabled]) {
    opacity: 0.55;
    pointer-events: none;
  }

  .container {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
    min-height: 40px;
    padding: var(--loquix-search-input-padding, 8px 10px);
    border: 1px solid var(--loquix-search-input-border-color, var(--loquix-border-color, #e5e7eb));
    border-radius: var(--loquix-search-input-border-radius, 10px);
    background: var(--loquix-search-input-bg, var(--loquix-surface-bg, #ffffff));
    color: var(--loquix-search-input-color, var(--loquix-text-color, #111827));
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease,
      background 160ms ease;
  }

  :host([size='lg']) .container {
    min-height: 52px;
    gap: 10px;
    padding: var(--loquix-search-input-lg-padding, 12px 14px);
    border-radius: var(--loquix-search-input-lg-border-radius, 14px);
  }

  .container.is-smart {
    background: var(
      --loquix-search-input-smart-bg,
      color-mix(
        in srgb,
        var(--loquix-ai-color-subtle, #ede9fe) 38%,
        var(--loquix-surface-bg, #ffffff)
      )
    );
    border-color: var(
      --loquix-search-input-smart-border-color,
      color-mix(in srgb, var(--loquix-ai-color, #7c3aed) 24%, var(--loquix-border-color, #e5e7eb))
    );
  }

  .container.is-focused {
    border-color: var(--loquix-search-input-focus-border-color, var(--loquix-ai-color, #7c3aed));
    box-shadow: 0 0 0 2px var(--loquix-search-input-focus-ring-color, rgba(124, 58, 237, 0.15));
  }

  .icon,
  .sparkle {
    display: inline-flex;
    flex: 0 0 auto;
    color: var(--loquix-search-input-icon-color, var(--loquix-text-tertiary-color, #9ca3af));
  }

  .sparkle {
    color: var(--loquix-ai-color, #7c3aed);
  }

  .input {
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: var(--loquix-search-input-font-size, 0.875rem);
    line-height: 1.5;
  }

  :host([size='lg']) .input {
    font-size: var(--loquix-search-input-lg-font-size, 1rem);
  }

  .input::placeholder {
    color: var(--loquix-search-input-placeholder-color, var(--loquix-text-tertiary-color, #9ca3af));
  }

  .input::-webkit-search-cancel-button {
    display: none;
    appearance: none;
  }

  .clear {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: var(--loquix-search-input-clear-size, 18px);
    height: var(--loquix-search-input-clear-size, 18px);
    margin: 0 var(--loquix-search-input-clear-inline-margin, -2px);
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: var(--loquix-search-input-clear-bg, rgba(17, 24, 39, 0.48));
    color: var(--loquix-search-input-clear-color, #ffffff);
    cursor: pointer;
  }

  .clear:hover:not(:disabled) {
    background: var(--loquix-search-input-clear-hover-bg, rgba(17, 24, 39, 0.62));
  }

  .clear.is-hidden {
    visibility: hidden;
    pointer-events: none;
  }

  .clear:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color, #7c3aed));
    outline-offset: 2px;
  }

  .clear svg {
    display: block;
    width: 11px;
    height: 11px;
  }

  .ask {
    appearance: none;
    border: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    height: 28px;
    padding: 0 10px;
    border-radius: 7px;
    background: var(--loquix-search-input-ask-bg, var(--loquix-ai-color, #7c3aed));
    color: var(--loquix-search-input-ask-color, #ffffff);
    font: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
  }

  .ask span {
    display: block;
    line-height: 1;
  }

  .ask:hover:not(:disabled) {
    filter: brightness(1.06);
  }

  .ask:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color, #7c3aed));
    outline-offset: 2px;
  }

  .kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border: 1px solid
      var(--loquix-search-input-kbd-border-color, var(--loquix-border-color, #e5e7eb));
    border-radius: 5px;
    background: var(--loquix-search-input-kbd-bg, var(--loquix-surface-secondary-bg, #f9fafb));
    color: var(--loquix-search-input-kbd-color, var(--loquix-text-tertiary-color, #9ca3af));
    font-family: var(--loquix-code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: 0.6875rem;
    line-height: 1;
  }

  .spinner {
    display: inline-flex;
    box-sizing: border-box;
    flex: 0 0 auto;
    width: 14px;
    height: 14px;
    border: 2px solid color-mix(in srgb, var(--loquix-ai-color, #7c3aed) 24%, transparent);
    border-top-color: var(--loquix-ai-color, #7c3aed);
    border-radius: 50%;
    animation: spin 800ms linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default styles;
