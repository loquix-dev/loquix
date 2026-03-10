import { css } from 'lit';

export default css`
  :host {
    display: block;
    height: 100%;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: 100%;
    box-sizing: border-box;
    padding: var(--loquix-template-card-padding, 14px 16px);
    border: 1px solid var(--loquix-template-card-border-color, rgba(0, 0, 0, 0.1));
    border-radius: var(--loquix-template-card-border-radius, 12px);
    background: var(--loquix-template-card-bg, #fff);
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      background 0.15s ease;
    text-align: left;
    width: 100%;
    font-family: inherit;
    color: inherit;
  }

  .card:hover {
    border-color: var(--loquix-template-card-hover-border-color, rgba(0, 0, 0, 0.2));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .card:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: 2px;
  }

  :host([selected]) .card {
    border-color: var(--loquix-ai-color, #7c3aed);
    background: var(--loquix-template-card-selected-bg, rgba(124, 58, 237, 0.04));
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon {
    flex-shrink: 0;
    font-size: 1.25em;
    display: inline-flex;
    align-items: center;
  }

  .title {
    font-weight: 600;
    font-size: var(--loquix-template-card-title-font-size, 0.9375rem);
    line-height: 1.3;
  }

  .description {
    font-size: var(--loquix-template-card-desc-font-size, 0.8125rem);
    color: var(--loquix-template-card-desc-color, rgba(0, 0, 0, 0.6));
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .footer {
    margin-top: 4px;
  }

  .footer:empty {
    display: none;
  }
`;
