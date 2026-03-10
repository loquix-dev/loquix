import { css } from 'lit';

export default css`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--loquix-welcome-padding, 32px 16px);
    max-width: var(--loquix-welcome-max-width, 600px);
    margin: 0 auto;
    box-sizing: border-box;
    min-height: 100%;
  }

  /* Split layout: logo left, content right */
  :host([layout='split']) {
    flex-direction: row;
    text-align: left;
    gap: 32px;
    max-width: var(--loquix-welcome-max-width, 720px);
  }

  :host([layout='split']) .content {
    flex: 1;
    align-items: flex-start;
  }

  .logo {
    margin-bottom: 16px;
  }

  :host([layout='split']) .logo {
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .heading {
    margin: 0 0 8px;
    font-size: var(--loquix-welcome-heading-font-size, 1.5rem);
    font-weight: var(--loquix-welcome-heading-font-weight, 600);
    color: var(--loquix-welcome-heading-color, inherit);
    line-height: 1.3;
  }

  :host([layout='split']) .heading {
    text-align: left;
  }

  .subheading {
    margin: 0 0 24px;
    font-size: var(--loquix-welcome-subheading-font-size, 0.9375rem);
    color: var(--loquix-welcome-subheading-color, rgba(0, 0, 0, 0.6));
    line-height: 1.5;
  }

  .suggestions {
    width: 100%;
  }

  :host([layout='split']) .suggestions {
    align-self: flex-start;
  }

  .footer {
    margin-top: 24px;
  }
`;
