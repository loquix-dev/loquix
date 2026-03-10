import { css } from 'lit';

const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
    background: var(--loquix-avatar-bg, var(--loquix-ai-color-subtle, #ede9fe));
    color: var(--loquix-avatar-color, var(--loquix-ai-color, #7c3aed));
    transition: box-shadow var(--loquix-transition-duration, 200ms)
      var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  /* Size variants */
  :host([size='sm']) .container {
    width: var(--loquix-avatar-size-sm, 24px);
    height: var(--loquix-avatar-size-sm, 24px);
    font-size: 0.625rem;
  }

  :host([size='md']) .container,
  .container {
    width: var(--loquix-avatar-size-md, 32px);
    height: var(--loquix-avatar-size-md, 32px);
    font-size: 0.75rem;
  }

  :host([size='lg']) .container {
    width: var(--loquix-avatar-size-lg, 40px);
    height: var(--loquix-avatar-size-lg, 40px);
    font-size: 0.875rem;
  }

  /* Pulsing animation for thinking / streaming */
  :host([state='thinking']) .container,
  :host([state='streaming']) .container {
    animation: loquix-pulse 1.5s ease-in-out infinite;
  }

  @keyframes loquix-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 var(--loquix-avatar-pulse-color, rgba(124, 58, 237, 0.4));
    }
    50% {
      box-shadow: 0 0 0 6px var(--loquix-avatar-pulse-color, rgba(124, 58, 237, 0));
    }
  }

  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .initials {
    font-family: var(--loquix-font-family, sans-serif);
    font-weight: 600;
    text-transform: uppercase;
    user-select: none;
    line-height: 1;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon svg {
    width: 60%;
    height: 60%;
    fill: currentColor;
  }
`;

export default styles;
