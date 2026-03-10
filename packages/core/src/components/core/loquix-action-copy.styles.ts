import { css } from 'lit';

const styles = css`
  :host([copied]) .action {
    color: var(--loquix-action-copied-color, #22c55e);
  }

  :host([copied]) .action:hover {
    color: var(--loquix-action-copied-color, #22c55e);
  }
`;

export default styles;
