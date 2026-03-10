import { css } from 'lit';

export default css`
  :host {
    display: contents;
  }

  dialog {
    max-width: var(--loquix-picker-max-width, 720px);
    width: 90vw;
    min-height: min(560px, 80vh);
    max-height: 80vh;
    padding: 0;
    border: 1px solid var(--loquix-picker-border-color, rgba(0, 0, 0, 0.1));
    border-radius: var(--loquix-picker-border-radius, 16px);
    background: var(--loquix-picker-bg, #fff);
    color: inherit;
    overflow: hidden;
    box-shadow: var(--loquix-picker-shadow, 0 16px 48px rgba(0, 0, 0, 0.12));
  }

  dialog::backdrop {
    background: var(--loquix-picker-backdrop, rgba(0, 0, 0, 0.4));
  }

  dialog[open] {
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--loquix-border-subtle);
    flex-shrink: 0;
  }

  .heading {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }

  .close-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.15s ease, background 0.15s ease;
  }

  .close-btn:hover {
    opacity: 0.8;
    background: var(--loquix-overlay-light);
  }

  .close-btn:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: 2px;
  }

  .close-btn svg {
    width: 16px;
    height: 16px;
  }

  .controls {
    padding: 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
  }

  .search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--loquix-overlay-medium);
    border-radius: 8px;
    background: var(--loquix-picker-search-bg, rgba(0, 0, 0, 0.02));
    font-family: inherit;
    font-size: 0.875rem;
    color: inherit;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s ease;
  }

  .search-input:focus {
    border-color: var(--loquix-ai-color, #7c3aed);
  }

  .search-input::placeholder {
    color: var(--loquix-input-placeholder-color, #9ca3af);
  }

  .categories {
    display: flex;
    gap: 4px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .categories::-webkit-scrollbar {
    display: none;
  }

  .category-btn {
    padding: 4px 12px;
    border: 1px solid var(--loquix-border-subtle);
    border-radius: 9999px;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 0.8125rem;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .category-btn:hover:not(.category-btn--active) {
    background: var(--loquix-overlay-subtle);
  }

  .category-btn--active {
    background: var(--loquix-ai-color, #7c3aed);
    color: #fff;
    border-color: var(--loquix-ai-color, #7c3aed);
  }

  .category-btn--active:hover {
    background: var(--loquix-ai-color-hover, #6d28d9);
  }

  .category-btn:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: 2px;
  }

  .body {
    flex: 1;
    overflow-y: auto;
    padding: 12px 20px 20px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(var(--loquix-picker-card-min-width, 240px), 1fr)
    );
    gap: var(--loquix-picker-gap, 12px);
  }

  .empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--loquix-text-muted);
    font-size: 0.875rem;
  }
`;
