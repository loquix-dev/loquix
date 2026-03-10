import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/DisclosureBadge',
  component: 'loquix-disclosure-badge',
  tags: ['autodocs'],
  argTypes: {
    agentName: { control: 'text' },
    action: { control: 'select', options: ['generated', 'summarized', 'rewrote', 'suggested'] },
    variant: { control: 'select', options: ['label', 'icon', 'banner'] },
  },
};
export default meta;

type Story = StoryObj;

export const Label: Story = {
  args: { agentName: 'Claude', action: 'generated', variant: 'label' },
  render: args =>
    html`<loquix-disclosure-badge
      agent-name=${args.agentName}
      action=${args.action}
      variant=${args.variant}
    ></loquix-disclosure-badge>`,
};

export const Icon: Story = {
  args: { agentName: 'AI', action: 'summarized', variant: 'icon' },
  render: args =>
    html`<loquix-disclosure-badge
      agent-name=${args.agentName}
      action=${args.action}
      variant=${args.variant}
    ></loquix-disclosure-badge>`,
};

export const Banner: Story = {
  args: { agentName: 'Claude', action: 'rewrote', variant: 'banner' },
  render: args =>
    html`<loquix-disclosure-badge
      agent-name=${args.agentName}
      action=${args.action}
      variant=${args.variant}
    ></loquix-disclosure-badge>`,
};

export const AllActions: Story = {
  render: () =>
    html` <div style="display:flex;flex-direction:column;gap:8px">
      <loquix-disclosure-badge
        agent-name="Claude"
        action="generated"
        variant="label"
      ></loquix-disclosure-badge>
      <loquix-disclosure-badge
        agent-name="Claude"
        action="summarized"
        variant="label"
      ></loquix-disclosure-badge>
      <loquix-disclosure-badge
        agent-name="Claude"
        action="rewrote"
        variant="label"
      ></loquix-disclosure-badge>
      <loquix-disclosure-badge
        agent-name="Claude"
        action="suggested"
        variant="label"
      ></loquix-disclosure-badge>
    </div>`,
};
