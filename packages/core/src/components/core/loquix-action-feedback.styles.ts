import { css } from 'lit';

const styles = css`
  :host([active]) .action {
    color: var(--loquix-action-active-color, var(--loquix-ai-color, #7c3aed));
  }

  :host([active]) .action:hover {
    color: var(--loquix-action-active-color, var(--loquix-ai-color, #7c3aed));
  }
`;

export default styles;
