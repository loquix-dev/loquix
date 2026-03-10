import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .heading {
    font-size: var(--loquix-gallery-heading-font-size, 1.125rem);
    font-weight: 600;
    margin: 0 0 12px;
  }

  .categories {
    display: flex;
    gap: 4px;
    margin-bottom: 14px;
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
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
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

  /* Grid variant */
  .gallery--grid {
    display: grid;
    grid-template-columns: repeat(var(--loquix-gallery-columns, 3), 1fr);
    gap: var(--loquix-gallery-gap, 12px);
  }

  /* List variant */
  .gallery--list {
    display: flex;
    flex-direction: column;
    gap: var(--loquix-gallery-gap, 8px);
  }

  /* Carousel variant */
  .gallery--carousel {
    display: flex;
    gap: var(--loquix-gallery-gap, 12px);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 4px;
  }

  .gallery--carousel .item {
    scroll-snap-align: start;
    min-width: 240px;
    flex-shrink: 0;
  }

  .item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: var(--loquix-gallery-item-padding, 12px 14px);
    border: 1px solid var(--loquix-gallery-item-border-color, rgba(0, 0, 0, 0.1));
    border-radius: var(--loquix-gallery-item-border-radius, 10px);
    background: var(--loquix-gallery-item-bg, #fff);
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    text-align: left;
    font-family: inherit;
    color: inherit;
    width: 100%;
  }

  .item:hover {
    border-color: var(--loquix-gallery-item-hover-border-color, rgba(0, 0, 0, 0.2));
    box-shadow: var(--loquix-shadow-sm);
  }

  .item:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: 2px;
  }

  .item__header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .item__icon {
    flex-shrink: 0;
    font-size: 1.1em;
  }

  .item__title {
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.3;
  }

  .item__description {
    font-size: 0.8125rem;
    color: var(--loquix-gallery-item-desc-color, rgba(0, 0, 0, 0.6));
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Responsive: fewer columns on narrow widths */
  @media (max-width: 600px) {
    .gallery--grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }
`;
