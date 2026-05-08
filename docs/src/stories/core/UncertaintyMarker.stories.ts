import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/UncertaintyMarker',
  component: 'loquix-uncertainty-marker',
  tags: ['autodocs'],
  argTypes: {
    kind: { control: 'select', options: ['unsure', 'needs-verification', 'speculative'] },
    variant: { control: 'select', options: ['underline', 'highlight', 'icon'] },
    reason: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj;

export const Underline: Story = {
  args: { kind: 'needs-verification', variant: 'underline' },
  render: args =>
    html`<p style="font-size:14px;max-width:480px">
      The Q3 revenue figure was
      <loquix-uncertainty-marker kind=${args.kind} variant=${args.variant}>
        approximately $4.2M
      </loquix-uncertainty-marker>
      , driven primarily by enterprise contracts.
    </p>`,
};

export const Highlight: Story = {
  args: { kind: 'unsure', variant: 'highlight' },
  render: args =>
    html`<p style="font-size:14px;max-width:480px">
      Customer churn for the same period was
      <loquix-uncertainty-marker kind=${args.kind} variant=${args.variant}>
        around 3.1%
      </loquix-uncertainty-marker>
      , though this excludes mid-cycle cancellations.
    </p>`,
};

export const IconVariant: Story = {
  args: { kind: 'speculative', variant: 'icon' },
  render: args =>
    html`<p style="font-size:14px;max-width:480px">
      Q4 may see growth of
      <loquix-uncertainty-marker kind=${args.kind} variant=${args.variant}>
        15–20%
      </loquix-uncertainty-marker>
      assuming the new pricing tier converts at expected rates.
    </p>`,
};

export const InProse: Story = {
  render: () =>
    html`<p style="font-size:14px;max-width:540px;line-height:1.6">
      The Q3 revenue figure was
      <loquix-uncertainty-marker kind="needs-verification" variant="underline"
        >approximately $4.2M</loquix-uncertainty-marker
      >, driven primarily by enterprise contracts. Customer churn for the same period was
      <loquix-uncertainty-marker kind="unsure" variant="highlight"
        >around 3.1%</loquix-uncertainty-marker
      >, though this excludes mid-cycle cancellations. Looking ahead, Q4 may see growth of
      <loquix-uncertainty-marker kind="speculative" variant="icon"
        >15–20%</loquix-uncertainty-marker
      >
      assuming the new pricing tier converts at expected rates.
    </p>`,
};

export const Matrix: Story = {
  render: () =>
    html`<div style="display:grid;grid-template-columns:80px 1fr;gap:14px 24px;font-size:13px">
      <div style="font-weight:600">Underline</div>
      <div>
        <loquix-uncertainty-marker kind="unsure" variant="underline"
          >unsure</loquix-uncertainty-marker
        >
        ·
        <loquix-uncertainty-marker kind="needs-verification" variant="underline"
          >verify</loquix-uncertainty-marker
        >
        ·
        <loquix-uncertainty-marker kind="speculative" variant="underline"
          >speculative</loquix-uncertainty-marker
        >
      </div>
      <div style="font-weight:600">Highlight</div>
      <div>
        <loquix-uncertainty-marker kind="unsure" variant="highlight"
          >unsure</loquix-uncertainty-marker
        >
        <loquix-uncertainty-marker kind="needs-verification" variant="highlight"
          >verify</loquix-uncertainty-marker
        >
        <loquix-uncertainty-marker kind="speculative" variant="highlight"
          >speculative</loquix-uncertainty-marker
        >
      </div>
      <div style="font-weight:600">Icon</div>
      <div>
        <loquix-uncertainty-marker kind="unsure" variant="icon">unsure</loquix-uncertainty-marker>
        ·
        <loquix-uncertainty-marker kind="needs-verification" variant="icon"
          >verify</loquix-uncertainty-marker
        >
        ·
        <loquix-uncertainty-marker kind="speculative" variant="icon"
          >speculative</loquix-uncertainty-marker
        >
      </div>
    </div>`,
};
