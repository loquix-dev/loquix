import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const modes = [
  { value: 'chat', label: 'Chat', icon: '💬', description: 'General conversation' },
  { value: 'research', label: 'Research', icon: '🔍', description: 'Deep analysis' },
  { value: 'build', label: 'Build', icon: '🔧', description: 'Code generation' },
  { value: 'create', label: 'Create', icon: '✨', description: 'Creative writing' },
];

const meta: Meta = {
  title: 'Configuration/ModeSelector',
  component: 'loquix-mode-selector',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['tabs', 'dropdown', 'pills', 'toggle'] },
    value: { control: 'text' },
    showDescription: { control: 'boolean' },
    stacked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Tabs: Story = {
  args: { variant: 'tabs', value: 'chat' },
  render: args =>
    html`<loquix-mode-selector
      variant=${args.variant}
      value=${args.value}
      ?show-description=${args.showDescription}
      ?disabled=${args.disabled}
      .modes=${modes}
    ></loquix-mode-selector>`,
};

export const Pills: Story = {
  args: { variant: 'pills', value: 'chat' },
  render: args =>
    html`<loquix-mode-selector
      variant=${args.variant}
      value=${args.value}
      .modes=${modes}
    ></loquix-mode-selector>`,
};

export const Toggle: Story = {
  args: { variant: 'toggle', value: 'chat' },
  render: args =>
    html`<loquix-mode-selector
      variant=${args.variant}
      value=${args.value}
      .modes=${modes.slice(0, 2)}
    ></loquix-mode-selector>`,
};

export const Dropdown: Story = {
  args: { variant: 'dropdown', value: 'chat' },
  render: args =>
    html` <div style="padding-top:200px">
      <loquix-mode-selector
        variant=${args.variant}
        value=${args.value}
        .modes=${modes}
      ></loquix-mode-selector>
    </div>`,
};

export const WithDescriptions: Story = {
  args: { variant: 'tabs', value: 'research', showDescription: true },
  render: args =>
    html`<loquix-mode-selector
      variant=${args.variant}
      value=${args.value}
      ?show-description=${args.showDescription}
      .modes=${modes}
    ></loquix-mode-selector>`,
};

export const StackedDescriptions: Story = {
  args: { variant: 'tabs', value: 'chat', showDescription: true, stacked: true },
  render: args =>
    html`<loquix-mode-selector
      variant=${args.variant}
      value=${args.value}
      ?show-description=${args.showDescription}
      ?stacked=${args.stacked}
      .modes=${modes}
    ></loquix-mode-selector>`,
};

export const Disabled: Story = {
  args: { variant: 'tabs', value: 'chat', disabled: true },
  render: args =>
    html`<loquix-mode-selector
      variant=${args.variant}
      value=${args.value}
      ?disabled=${args.disabled}
      .modes=${modes}
    ></loquix-mode-selector>`,
};
