import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    width: 100%;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  dialog {
    width: min(var(--loquix-search-dialog-width, 760px), calc(100vw - 32px));
    max-width: var(--loquix-search-dialog-max-width, 760px);
    max-height: min(var(--loquix-search-dialog-max-height, 760px), calc(100vh - 32px));
    padding: 0;
    border: 1px solid var(--loquix-search-dialog-border-color, var(--loquix-border-color, #e5e7eb));
    border-radius: var(--loquix-search-dialog-border-radius, 16px);
    background: var(--loquix-search-dialog-bg, var(--loquix-surface-bg, #ffffff));
    color: var(--loquix-search-dialog-color, var(--loquix-text-color, #111827));
    overflow: hidden;
    box-shadow: var(--loquix-search-dialog-shadow, 0 24px 72px rgb(17 24 39 / 0.18));
    opacity: 0;
    transform: translateY(6px) scale(0.985);
    transition:
      opacity 140ms ease,
      transform 140ms ease;
  }

  dialog::backdrop {
    background: transparent;
    backdrop-filter: blur(0);
    transition:
      background 140ms ease,
      backdrop-filter 140ms ease;
  }

  dialog[open] {
    display: flex;
    flex-direction: column;
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  dialog[open]::backdrop {
    background: var(--loquix-search-dialog-backdrop, rgb(17 24 39 / 0.42));
    backdrop-filter: blur(var(--loquix-search-dialog-backdrop-blur, 2px));
  }

  dialog.is-closing {
    opacity: 0;
    transform: translateY(6px) scale(0.985);
  }

  dialog.is-closing::backdrop {
    background: transparent;
    backdrop-filter: blur(0);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px 10px;
    flex: 0 0 auto;
  }

  .heading {
    margin: 0;
    color: var(--loquix-search-dialog-heading-color, var(--loquix-text-secondary-color, #6b7280));
    font: 600 0.8125rem/1.3 var(--loquix-font-family, system-ui, sans-serif);
  }

  .close {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--loquix-text-tertiary-color, #9ca3af);
    cursor: pointer;
    transition:
      background 150ms ease,
      color 150ms ease;
  }

  .close:hover {
    background: var(--loquix-overlay-light, rgb(0 0 0 / 0.06));
    color: var(--loquix-text-color, #111827);
  }

  .close:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color, #7c3aed));
    outline-offset: 2px;
  }

  .close svg {
    display: block;
    width: 16px;
    height: 16px;
  }

  .query {
    padding: 0 16px 14px;
    flex: 0 0 auto;
  }

  .sources {
    padding: 0 16px 14px;
    flex: 0 0 auto;
  }

  .body {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
    padding: 0 16px 16px;
  }

  .answer[hidden],
  .results[hidden] {
    display: none;
  }

  .footer {
    border-top: 1px solid var(--loquix-border-subtle, var(--loquix-border-color, #e5e7eb));
    flex: 0 0 auto;
  }

  @media (max-width: 560px) {
    dialog {
      width: calc(100vw - 16px);
      max-height: calc(100vh - 16px);
      border-radius: 14px;
    }

    .header {
      padding: 12px 12px 8px;
    }

    .query,
    .sources {
      padding-inline: 12px;
    }

    .body {
      padding: 0 12px 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    dialog,
    dialog::backdrop {
      transition: none;
    }
  }
`;

export default styles;
