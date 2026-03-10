import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    width: 100%;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--loquix-composer-toolbar-padding, 4px 16px);
    gap: var(--loquix-composer-toolbar-gap, 8px);
    min-height: var(--loquix-composer-toolbar-min-height, 32px);
  }

  /* Separator between composer and toolbar */
  :host([border='top']) .toolbar {
    border-top: 1px solid
      var(--loquix-composer-toolbar-border-color, var(--loquix-border-color, #e2e8f0));
  }

  :host([border='bottom']) .toolbar {
    border-bottom: 1px solid
      var(--loquix-composer-toolbar-border-color, var(--loquix-border-color, #e2e8f0));
  }

  .toolbar__left {
    display: flex;
    align-items: center;
    gap: var(--loquix-composer-toolbar-item-gap, 4px);
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .toolbar__left::-webkit-scrollbar {
    display: none;
  }

  .toolbar__right {
    display: flex;
    align-items: center;
    gap: var(--loquix-composer-toolbar-item-gap, 4px);
    flex-shrink: 0;
  }
`;

export default styles;
