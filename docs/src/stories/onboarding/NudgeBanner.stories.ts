import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Onboarding/NudgeBanner',
  component: 'loquix-nudge-banner',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['info', 'tip', 'warning'] },
    dismissible: { control: 'boolean' },
    actionLabel: { control: 'text' },
    icon: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj;

export const Info: Story = {
  args: { variant: 'info', icon: 'ℹ️', nudgeId: 'info-1' },
  render: args =>
    html` <div style="width:500px">
      <loquix-nudge-banner
        variant=${args.variant}
        icon=${args.icon}
        nudge-id=${args.nudgeId}
        ?dismissible=${args.dismissible}
      >
        You can use keyboard shortcuts to navigate faster.
      </loquix-nudge-banner>
    </div>`,
};

export const Tip: Story = {
  args: { variant: 'tip', icon: '💡', nudgeId: 'tip-1' },
  render: args =>
    html` <div style="width:500px">
      <loquix-nudge-banner variant=${args.variant} icon=${args.icon} nudge-id=${args.nudgeId}>
        Try asking follow-up questions for more detailed responses.
      </loquix-nudge-banner>
    </div>`,
};

export const Warning: Story = {
  args: { variant: 'warning', icon: '⚠️', nudgeId: 'warn-1' },
  render: args =>
    html` <div style="width:500px">
      <loquix-nudge-banner variant=${args.variant} icon=${args.icon} nudge-id=${args.nudgeId}>
        Your session will expire in 5 minutes.
      </loquix-nudge-banner>
    </div>`,
};

export const WithAction: Story = {
  args: { variant: 'tip', icon: '🔔', actionLabel: 'Learn More', nudgeId: 'action-1' },
  render: args =>
    html` <div style="width:500px">
      <loquix-nudge-banner
        variant=${args.variant}
        icon=${args.icon}
        action-label=${args.actionLabel}
        nudge-id=${args.nudgeId}
      >
        New features are available for your workspace.
      </loquix-nudge-banner>
    </div>`,
};

export const NonDismissible: Story = {
  args: { variant: 'warning', icon: '🔒', dismissible: false, nudgeId: 'nodismiss-1' },
  render: args =>
    html` <div style="width:500px">
      <loquix-nudge-banner
        variant=${args.variant}
        icon=${args.icon}
        ?dismissible=${args.dismissible}
        nudge-id=${args.nudgeId}
      >
        This is a persistent warning that cannot be dismissed.
      </loquix-nudge-banner>
    </div>`,
};
