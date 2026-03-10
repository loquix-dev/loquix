import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/PromptInput',
  component: 'loquix-prompt-input',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['chat', 'inline', 'command', 'panel'] },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    rows: { control: 'number' },
    autoResize: { control: 'boolean' },
    submitOnEnter: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Chat: Story = {
  args: { variant: 'chat', placeholder: 'Type a message...' },
  render: args =>
    html`<loquix-prompt-input
      variant=${args.variant}
      placeholder=${args.placeholder}
    ></loquix-prompt-input>`,
};

export const Command: Story = {
  args: { variant: 'command', placeholder: 'Enter a command...' },
  render: args =>
    html`<loquix-prompt-input
      variant=${args.variant}
      placeholder=${args.placeholder}
    ></loquix-prompt-input>`,
};

export const Inline: Story = {
  args: { variant: 'inline', placeholder: 'Ask a question...' },
  render: args =>
    html`<loquix-prompt-input
      variant=${args.variant}
      placeholder=${args.placeholder}
    ></loquix-prompt-input>`,
};

export const MultiRow: Story = {
  args: { variant: 'chat', rows: 4, autoResize: false, placeholder: 'Multi-line input...' },
  render: args =>
    html`<loquix-prompt-input
      variant=${args.variant}
      rows=${args.rows}
      ?auto-resize=${args.autoResize}
      placeholder=${args.placeholder}
    ></loquix-prompt-input>`,
};

export const Disabled: Story = {
  args: { variant: 'chat', disabled: true, placeholder: 'Input disabled' },
  render: args =>
    html`<loquix-prompt-input
      variant=${args.variant}
      placeholder=${args.placeholder}
      ?disabled=${args.disabled}
    ></loquix-prompt-input>`,
};

export const AllVariants: Story = {
  render: () => html` <div style="display:flex;flex-direction:column;gap:16px;width:400px">
    <loquix-prompt-input variant="chat" placeholder="Chat variant"></loquix-prompt-input>
    <loquix-prompt-input variant="inline" placeholder="Inline variant"></loquix-prompt-input>
    <loquix-prompt-input variant="command" placeholder="Command variant"></loquix-prompt-input>
    <loquix-prompt-input variant="panel" placeholder="Panel variant"></loquix-prompt-input>
  </div>`,
};
