import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/ConfidenceIndicator',
  component: 'loquix-confidence-indicator',
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    variant: { control: 'select', options: ['bar', 'dots', 'badge', 'numeric'] },
    level: { control: 'select', options: [undefined, 'low', 'medium', 'high'] },
    label: { control: 'text' },
    lowThreshold: { control: { type: 'number', step: 0.05 } },
    highThreshold: { control: { type: 'number', step: 0.05 } },
    showValue: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Variants: Story = {
  args: { value: 0.82 },
  render: args =>
    html`<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
      <loquix-confidence-indicator value=${args.value} variant="bar"></loquix-confidence-indicator>
      <loquix-confidence-indicator value=${args.value} variant="dots"></loquix-confidence-indicator>
      <loquix-confidence-indicator
        value=${args.value}
        variant="badge"
      ></loquix-confidence-indicator>
      <loquix-confidence-indicator
        value=${args.value}
        variant="numeric"
      ></loquix-confidence-indicator>
    </div>`,
};

export const Levels: Story = {
  render: () =>
    html`<div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">
      <loquix-confidence-indicator
        value="0.22"
        variant="bar"
        label="Source quality"
      ></loquix-confidence-indicator>
      <loquix-confidence-indicator
        value="0.55"
        variant="bar"
        label="Source quality"
      ></loquix-confidence-indicator>
      <loquix-confidence-indicator
        value="0.88"
        variant="bar"
        label="Source quality"
      ></loquix-confidence-indicator>
      <div style="display:flex;gap:12px;align-items:center;margin-top:8px">
        <loquix-confidence-indicator value="0.22" variant="badge"></loquix-confidence-indicator>
        <loquix-confidence-indicator value="0.55" variant="badge"></loquix-confidence-indicator>
        <loquix-confidence-indicator value="0.88" variant="badge"></loquix-confidence-indicator>
      </div>
      <div style="display:flex;gap:16px;align-items:center;margin-top:8px">
        <loquix-confidence-indicator value="0.22" variant="dots"></loquix-confidence-indicator>
        <loquix-confidence-indicator value="0.55" variant="dots"></loquix-confidence-indicator>
        <loquix-confidence-indicator value="0.88" variant="dots"></loquix-confidence-indicator>
      </div>
    </div>`,
};

export const WithLabel: Story = {
  args: { value: 0.78, variant: 'bar', label: 'Answer confidence' },
  render: args =>
    html`<loquix-confidence-indicator
      value=${args.value}
      variant=${args.variant}
      label=${args.label}
    ></loquix-confidence-indicator>`,
};

export const NumericLarge: Story = {
  args: { value: 0.92 },
  render: args =>
    html`<loquix-confidence-indicator
      value=${args.value}
      variant="numeric"
    ></loquix-confidence-indicator>`,
};
