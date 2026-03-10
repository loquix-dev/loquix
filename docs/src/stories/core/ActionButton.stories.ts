import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

// Simple SVG icons for demo
const starIcon = html`<svg viewBox="0 0 24 24">
  <path
    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
  />
</svg>`;
const refreshIcon = html`<svg viewBox="0 0 24 24">
  <path d="M23 4v6h-6M1 20v-6h6" />
  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
</svg>`;

const meta: Meta = {
  title: 'Core/ActionButton',
  component: 'loquix-action-button',
  tags: ['autodocs'],
  argTypes: {
    action: { control: 'text' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: { action: 'loquix-custom', label: 'Star' },
  render: args =>
    html`<loquix-action-button action=${args.action} label=${args.label} ?disabled=${args.disabled}
      >${starIcon}</loquix-action-button
    >`,
};

export const Regenerate: Story = {
  args: { action: 'loquix-regenerate', label: 'Regenerate' },
  render: args =>
    html`<loquix-action-button action=${args.action} label=${args.label}
      >${refreshIcon}</loquix-action-button
    >`,
};

export const Disabled: Story = {
  args: { action: 'loquix-custom', label: 'Disabled', disabled: true },
  render: args =>
    html`<loquix-action-button action=${args.action} label=${args.label} ?disabled=${args.disabled}
      >${starIcon}</loquix-action-button
    >`,
};

export const ButtonRow: Story = {
  render: () => html` <div style="display:flex;gap:4px">
    <loquix-action-copy></loquix-action-copy>
    <loquix-action-feedback sentiment="positive"></loquix-action-feedback>
    <loquix-action-feedback sentiment="negative"></loquix-action-feedback>
    <loquix-action-button action="loquix-regenerate" label="Regenerate"
      >${refreshIcon}</loquix-action-button
    >
  </div>`,
};
