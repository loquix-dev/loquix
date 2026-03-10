import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/ChatComposer',
  component: 'loquix-chat-composer',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'contained'] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    submitDisabled: { control: 'boolean' },
    streaming: { control: 'boolean' },
    maxLength: { control: 'number' },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: { variant: 'default', placeholder: 'Type a message...' },
  render: args =>
    html` <div style="width:500px">
      <loquix-chat-composer
        variant=${args.variant}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
      ></loquix-chat-composer>
    </div>`,
};

export const Contained: Story = {
  args: { variant: 'contained', placeholder: 'Ask me anything...' },
  render: args =>
    html` <div style="width:500px">
      <loquix-chat-composer
        variant=${args.variant}
        placeholder=${args.placeholder}
      ></loquix-chat-composer>
    </div>`,
};

export const Streaming: Story = {
  args: { variant: 'contained', streaming: true },
  render: args =>
    html` <div style="width:500px">
      <loquix-chat-composer
        variant=${args.variant}
        ?streaming=${args.streaming}
      ></loquix-chat-composer>
    </div>`,
};

export const WithToolbar: Story = {
  render: () =>
    html` <div style="width:500px">
      <loquix-chat-composer variant="contained">
        <loquix-composer-toolbar slot="toolbar-top" border="bottom">
          <loquix-mode-selector
            slot="start"
            variant="pills"
            .modes=${[
              { value: 'chat', label: 'Chat', icon: '💬' },
              { value: 'research', label: 'Research', icon: '🔍' },
            ]}
            value="chat"
          ></loquix-mode-selector>
        </loquix-composer-toolbar>
      </loquix-chat-composer>
    </div>`,
};

export const Disabled: Story = {
  args: { variant: 'contained', disabled: true, placeholder: 'Composer disabled' },
  render: args =>
    html` <div style="width:500px">
      <loquix-chat-composer
        variant=${args.variant}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
      ></loquix-chat-composer>
    </div>`,
};

export const SubmitDisabled: Story = {
  args: { variant: 'contained', placeholder: 'Attach a file before sending...' },
  render: args =>
    html` <div style="width:500px">
      <loquix-chat-composer
        variant=${args.variant}
        placeholder=${args.placeholder}
        submit-disabled
      ></loquix-chat-composer>
    </div>`,
};
