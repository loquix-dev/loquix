import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    position: absolute;
    bottom: var(--loquix-scroll-anchor-bottom, 16px);
    right: var(--loquix-scroll-anchor-right, 16px);
    z-index: 10;
    pointer-events: none;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  :host([visible]) {
    pointer-events: auto;
    opacity: 1;
    transform: translateY(0);
  }

  .anchor-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--loquix-scroll-anchor-size, 36px);
    height: var(--loquix-scroll-anchor-size, 36px);
    padding: 0;
    border: 1px solid var(--loquix-border-color, #e2e8f0);
    border-radius: var(--loquix-scroll-anchor-border-radius, 50%);
    background: var(--loquix-scroll-anchor-bg, var(--loquix-surface-color, #ffffff));
    color: var(--loquix-scroll-anchor-color, var(--loquix-text-secondary-color, #6b7280));
    cursor: pointer;
    box-shadow: var(--loquix-scroll-anchor-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
    transition: background 200ms cubic-bezier(0.4, 0, 0.2, 1),
      color 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .anchor-button:hover {
    background: var(--loquix-scroll-anchor-hover-bg, var(--loquix-surface-secondary-bg, #f9fafb));
    color: var(--loquix-scroll-anchor-hover-color, var(--loquix-text-color, #111827));
  }

  .anchor-button:focus-visible {
    outline: 2px solid var(--loquix-input-focus-color, #7c3aed);
    outline-offset: 1px;
  }

  /* Icon via CSS mask — supports currentColor for theming.
     Override with --loquix-scroll-anchor-icon: url('custom.png') */
  .anchor-button::before {
    content: '';
    display: block;
    width: var(--loquix-scroll-anchor-icon-size, 18px);
    height: var(--loquix-scroll-anchor-icon-size, 18px);
    background-color: currentColor;
    -webkit-mask: var(
        --loquix-scroll-anchor-icon,
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
      )
      center / contain no-repeat;
    mask: var(
        --loquix-scroll-anchor-icon,
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
      )
      center / contain no-repeat;
  }

  @media (prefers-reduced-motion: reduce) {
    :host {
      transition: none;
    }

    .anchor-button {
      transition: none;
    }
  }
`;

export default styles;
