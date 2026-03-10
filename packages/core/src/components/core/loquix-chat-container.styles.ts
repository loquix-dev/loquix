import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    font-family: var(--loquix-font-family, sans-serif);
    color: var(--loquix-text-color, #1e293b);
  }

  /* ------------------------------------------------------------------ */
  /* Flex layout                                                        */
  /* ------------------------------------------------------------------ */

  .container {
    display: flex;
    width: 100%;
    height: 100%;
    background: var(--loquix-container-bg, var(--loquix-surface-color, #ffffff));
    overflow: hidden;
  }

  .sidebar {
    display: none;
    width: var(--loquix-sidebar-width, 260px);
    flex-shrink: 0;
    border-right: 1px solid var(--loquix-border-color, #e2e8f0);
    overflow-y: auto;
  }

  /* Show sidebar when it has slotted content */
  .sidebar:has(::slotted(*)) {
    display: block;
  }

  .main {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  /* ------------------------------------------------------------------ */
  /* Layout: full                                                       */
  /* ------------------------------------------------------------------ */

  :host([layout='full']) {
    max-width: var(--loquix-container-max-width, 900px);
    margin: 0 auto;
  }

  /* ------------------------------------------------------------------ */
  /* Layout: panel                                                      */
  /* ------------------------------------------------------------------ */

  :host([layout='panel']) {
    /* Fits parent container — no special overrides needed. */
  }

  /* ------------------------------------------------------------------ */
  /* Layout: floating                                                   */
  /* ------------------------------------------------------------------ */

  :host([layout='floating']) {
    position: absolute;
    bottom: 16px;
    right: 16px;
    width: 400px;
    height: 600px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 32px);
    border-radius: var(--loquix-container-border-radius, 16px);
    box-shadow: var(
      --loquix-container-shadow,
      0 8px 30px rgba(0, 0, 0, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.06)
    );
    overflow: hidden;
  }

  :host([layout='floating']) .container {
    border-radius: inherit;
  }

  /* ------------------------------------------------------------------ */
  /* Layout: inline                                                     */
  /* ------------------------------------------------------------------ */

  :host([layout='inline']) {
    height: auto;
  }

  :host([layout='inline']) .container {
    border: 1px solid var(--loquix-border-color, #e2e8f0);
    border-radius: var(--loquix-container-border-radius, 8px);
  }

  :host([layout='inline']) .sidebar {
    display: none;
  }
`;

export default styles;
