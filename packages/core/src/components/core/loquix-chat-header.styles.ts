import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    width: 100%;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--loquix-header-height, 56px);
    padding: 0 var(--loquix-header-padding, 16px);
    background: var(--loquix-header-bg, var(--loquix-surface-color, #ffffff));
    color: var(--loquix-header-color, var(--loquix-text-color, #1e293b));
    border-bottom: 1px solid var(--loquix-border-color, #e2e8f0);
    box-sizing: border-box;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .title {
    font-family: var(--loquix-font-family, sans-serif);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export default styles;
