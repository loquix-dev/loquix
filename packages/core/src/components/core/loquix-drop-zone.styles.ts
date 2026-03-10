import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    position: relative;
  }

  /* === Content wrapper (holds slotted children) === */

  .content {
    transition:
      filter 0.2s ease-out,
      opacity 0.2s ease-out;
  }

  :host([drag-over]) .content {
    filter: blur(var(--loquix-drop-zone-content-blur, 1.5px));
    opacity: var(--loquix-drop-zone-content-opacity, 0.5);
  }

  /* === Overlay (always in DOM for CSS transition) === */

  .overlay {
    position: absolute;
    inset: var(--loquix-drop-zone-overlay-inset, 0);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: var(--loquix-drop-zone-border-radius, 16px);
    border: 2px dashed var(--loquix-drop-zone-border-color, var(--loquix-ai-color, #7c3aed));
    background: var(--loquix-drop-zone-bg, rgba(124, 58, 237, 0.06));
    backdrop-filter: blur(var(--loquix-drop-zone-overlay-blur, 2px));
    color: var(--loquix-drop-zone-color, var(--loquix-ai-color, #7c3aed));
    pointer-events: none;
    opacity: 0;
    transition:
      opacity 0.2s ease-out,
      backdrop-filter 0.2s ease-out;
  }

  :host([drag-over]) .overlay {
    opacity: 1;
  }

  /* === Overlay icon === */

  .overlay__icon {
    width: var(--loquix-drop-zone-icon-size, 40px);
    height: var(--loquix-drop-zone-icon-size, 40px);
    opacity: 0.8;
  }

  .overlay__icon svg {
    width: 100%;
    height: 100%;
  }

  /* === Overlay label === */

  .overlay__label {
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
    font-size: 13px;
    font-weight: 500;
  }
`;

export default styles;
