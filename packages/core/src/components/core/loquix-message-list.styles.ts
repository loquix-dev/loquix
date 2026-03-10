import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .list {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative; /* positioning context for scroll-anchor */
  }

  .scroll-container {
    flex: 1;
    overflow-y: auto;
    scrollbar-gutter: stable;
    display: flex;
    flex-direction: column;
    gap: var(--loquix-message-gap, 16px);
    padding: var(--loquix-message-list-padding, 16px);
    background: var(--loquix-message-list-bg, transparent);

    /* Smooth scrollbar (webkit) */
    scrollbar-width: thin;
    scrollbar-color: var(--loquix-scrollbar-thumb, #cbd5e1) transparent;
  }

  .scroll-container::-webkit-scrollbar {
    width: 6px;
  }

  .scroll-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .scroll-container::-webkit-scrollbar-thumb {
    background: var(--loquix-scrollbar-thumb, #cbd5e1);
    border-radius: 3px;
  }

  /* Push messages to the bottom when there are few */
  ::slotted(*) {
    flex-shrink: 0;
  }
`;

export default styles;
