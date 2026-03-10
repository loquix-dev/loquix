import { css } from 'lit';

const styles = css`
  :host {
    display: block;
  }

  /* Hover position: hidden by default, visible on host hover */
  :host([position='hover']) .toolbar {
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--loquix-transition-duration, 200ms)
      var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  :host([position='hover']:hover) .toolbar,
  :host([position='hover']:focus-within) .toolbar {
    opacity: 1;
    pointer-events: auto;
  }

  /* Always visible */
  :host([position='always']) .toolbar {
    opacity: 1;
  }

  /* Show only after streaming completes (handled via host attribute externally) */
  :host([position='on-complete']) .toolbar {
    opacity: 1;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--loquix-actions-gap, 0.25rem);
    padding: var(--loquix-actions-padding, 0.125rem 0);
  }

  :host([direction='vertical']) .toolbar {
    flex-direction: column;
  }
`;

export default styles;
