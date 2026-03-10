import { css } from 'lit';

export default css`
  :host {
    display: block;
    margin-top: var(--loquix-followup-margin-top, 8px);
  }

  .label {
    font-size: var(--loquix-followup-label-font-size, 0.75rem);
    color: var(--loquix-followup-label-color, rgba(0, 0, 0, 0.65));
    margin-bottom: 6px;
  }

  /* Stacked variant: vertical list */
  :host([variant='stacked']) loquix-suggestion-chips {
    --loquix-chip-gap: var(--loquix-followup-gap, 6px);
  }

  /* Carousel variant: horizontal scroll, no wrap */
  :host([variant='carousel']) loquix-suggestion-chips {
    --loquix-chip-gap: var(--loquix-followup-gap, 6px);
  }

  /* Compact chip sizing for follow-ups */
  loquix-suggestion-chips {
    --loquix-chip-gap: var(--loquix-followup-gap, 6px);
    --loquix-chip-font-size: var(--loquix-followup-font-size, 0.8125rem);
    --loquix-chip-padding: var(--loquix-followup-chip-padding, 6px 12px);
  }
`;
