import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const suggestions = [
  { id: '1', text: 'Write a blog post', icon: '✍️' },
  { id: '2', text: 'Analyze data', icon: '📊' },
  { id: '3', text: 'Create a presentation', icon: '📑' },
  { id: '4', text: 'Help with coding', icon: '💻' },
];

const meta: Meta = {
  title: 'Onboarding/WelcomeScreen',
  component: 'loquix-welcome-screen',
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
    subheading: { control: 'text' },
    layout: { control: 'select', options: ['centered', 'split'] },
    suggestionVariant: { control: 'select', options: ['chip', 'pill', 'card'] },
  },
};
export default meta;

type Story = StoryObj;

export const Centered: Story = {
  args: {
    heading: 'How can I help you?',
    subheading: 'Choose a suggestion or type your own message',
    layout: 'centered',
  },
  render: args =>
    html` <div style="width:600px;height:400px">
      <loquix-welcome-screen
        heading=${args.heading}
        subheading=${args.subheading}
        layout=${args.layout}
        .suggestions=${suggestions}
      ></loquix-welcome-screen>
    </div>`,
};

export const Split: Story = {
  args: {
    heading: 'Welcome back!',
    subheading: 'What would you like to work on?',
    layout: 'split',
  },
  render: args =>
    html` <div style="width:700px;height:400px">
      <loquix-welcome-screen
        heading=${args.heading}
        subheading=${args.subheading}
        layout=${args.layout}
        .suggestions=${suggestions}
      ></loquix-welcome-screen>
    </div>`,
};

export const NoSuggestions: Story = {
  args: { heading: 'Start a conversation', layout: 'centered' },
  render: args =>
    html` <div style="width:600px;height:300px">
      <loquix-welcome-screen heading=${args.heading} layout=${args.layout}></loquix-welcome-screen>
    </div>`,
};
