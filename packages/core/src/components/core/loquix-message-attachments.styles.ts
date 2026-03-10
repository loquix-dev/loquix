import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  .grid {
    display: flex;
    flex-direction: column;
    gap: var(--loquix-message-attachments-gap, 8px);
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--loquix-message-attachments-gap, 8px);
  }

  /* === Card === */

  .card {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px solid var(--loquix-message-attachments-card-border-color, rgba(0, 0, 0, 0.08));
    border-radius: var(--loquix-message-attachments-card-border-radius, 8px);
    background: var(--loquix-message-attachments-card-bg, rgba(0, 0, 0, 0.03));
    overflow: hidden;
    transition: box-shadow 0.15s ease;
  }

  .card:hover {
    box-shadow: var(--loquix-message-attachments-card-hover-shadow, 0 1px 4px rgba(0, 0, 0, 0.1));
  }

  /* Size variants */
  .card--sm {
    width: var(--loquix-message-attachments-sm-size, 48px);
  }
  .card--md {
    width: var(--loquix-message-attachments-md-size, 80px);
  }
  .card--lg {
    width: var(--loquix-message-attachments-lg-size, 120px);
  }

  /* xs: horizontal card layout */
  .card--xs {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    width: auto;
    max-width: 100%;
    padding: 4px 8px;
  }

  /* === Action (inner clickable area) === */

  .card__action {
    display: flex;
    flex-direction: column;
    color: inherit;
    width: 100%;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    text-align: start;
  }

  .card__action:focus-visible {
    outline: 2px solid var(--loquix-focus-color, #4f8fff);
    outline-offset: -2px;
    border-radius: var(--loquix-message-attachments-card-border-radius, 8px);
  }

  /* === Thumbnail === */

  .card__thumbnail {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--loquix-overlay-subtle);
  }

  .card--xs .card__thumbnail {
    width: var(--loquix-message-attachments-xs-size, 28px);
    height: var(--loquix-message-attachments-xs-size, 28px);
    flex-shrink: 0;
    border-radius: 4px;
  }

  .card--sm .card__thumbnail {
    width: 100%;
    height: var(--loquix-message-attachments-sm-size, 48px);
  }
  .card--md .card__thumbnail {
    width: 100%;
    height: var(--loquix-message-attachments-md-size, 80px);
  }
  .card--lg .card__thumbnail {
    width: 100%;
    height: var(--loquix-message-attachments-lg-size, 120px);
  }

  .card__thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .card__icon {
    font-size: 1.5em;
    line-height: 1;
    user-select: none;
  }

  .card--xs .card__icon {
    font-size: 1.125em;
  }

  .card--lg .card__icon {
    font-size: 2em;
  }

  /* === Info (filename + filesize) === */

  .card__info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 4px 6px;
    min-width: 0;
  }

  .card__filename {
    font-size: 0.6875rem;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--loquix-text-color, inherit);
  }

  .card__filesize {
    font-size: 0.625rem;
    line-height: 1.2;
    color: var(--loquix-text-muted, rgba(0, 0, 0, 0.6));
  }

  /* xs: horizontal info layout */
  .card--xs .card__info {
    flex-direction: row;
    align-items: baseline;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  /* xs: inner action uses row layout */
  .card--xs .card__action {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  /* === Remove button === */

  .card__remove {
    position: absolute;
    top: 2px;
    right: 2px;
    display: none;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--loquix-message-attachments-remove-bg, #555);
    color: #fff;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    z-index: 1;
    transition: background 0.1s ease;
  }

  .card__remove:hover {
    background: var(--loquix-message-attachments-remove-hover-bg, #333);
  }

  .card__remove:focus-visible {
    outline: 2px solid var(--loquix-focus-color, #4f8fff);
    outline-offset: 1px;
  }

  :host([removable]) .card__remove {
    display: flex;
  }

  /* xs: remove button inline instead of absolute (card too small for overlay) */
  .card--xs .card__remove {
    position: static;
    flex-shrink: 0;
    align-self: center;
  }

  /* === Overflow button === */

  .overflow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    border: 1px solid var(--loquix-message-attachments-card-border-color, rgba(0, 0, 0, 0.08));
    border-radius: var(--loquix-message-attachments-card-border-radius, 8px);
    background: var(--loquix-message-attachments-card-bg, rgba(0, 0, 0, 0.03));
    color: var(--loquix-text-muted, rgba(0, 0, 0, 0.6));
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.15s ease;
    align-self: flex-start;
  }

  .overflow:hover {
    background: var(--loquix-overlay-light);
  }

  .overflow:focus-visible {
    outline: 2px solid var(--loquix-focus-color, #4f8fff);
    outline-offset: 1px;
  }

  /* xs: horizontal flow with smaller gap */
  :host([size='xs']) .list {
    gap: 4px;
  }
`;

export default styles;
