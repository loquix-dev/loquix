import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Recipes/Welcome with Suggestions',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

const suggestions = [
  {
    id: '1',
    text: 'Write a blog post',
    icon: '✍️',
    description: 'Generate a structured article on any topic',
  },
  { id: '2', text: 'Debug my code', icon: '🐛', description: 'Find and fix issues in your code' },
  { id: '3', text: 'Analyze data', icon: '📊', description: 'Extract insights from your dataset' },
  { id: '4', text: 'Plan a project', icon: '📋', description: 'Create a detailed project roadmap' },
];

const templates = [
  {
    id: 't1',
    title: 'Blog Post',
    description: 'Structured article',
    icon: '✍️',
    category: 'Writing',
    prompt: 'Write a blog post...',
  },
  {
    id: 't2',
    title: 'Code Review',
    description: 'Analyze code quality',
    icon: '🔍',
    category: 'Development',
    prompt: 'Review this code...',
  },
  {
    id: 't3',
    title: 'Meeting Notes',
    description: 'Summarize discussions',
    icon: '📋',
    category: 'Writing',
    prompt: 'Summarize these notes...',
  },
  {
    id: 't4',
    title: 'Data Analysis',
    description: 'Extract insights',
    icon: '📊',
    category: 'Analysis',
    prompt: 'Analyze this data...',
  },
];

export const EmptyChatWithWelcome: Story = {
  render: () => html` <div style="width:100%;height:100vh">
    <loquix-chat-container layout="full" mode="chat">
      <loquix-chat-header slot="header" agent-name="Claude">
        <loquix-message-avatar
          slot="avatar"
          variant="initials"
          name="AI"
          size="sm"
        ></loquix-message-avatar>
      </loquix-chat-header>
      <loquix-message-list slot="messages">
        <loquix-welcome-screen
          heading="Good afternoon!"
          subheading="What would you like to work on?"
          layout="centered"
          suggestion-variant="card"
          .suggestions=${suggestions}
        ></loquix-welcome-screen>
      </loquix-message-list>
      <loquix-chat-composer
        slot="composer"
        variant="contained"
        placeholder="Start typing..."
      ></loquix-chat-composer>
    </loquix-chat-container>
  </div>`,
};

export const WithTemplateGallery: Story = {
  render: () => html` <div style="width:100%;height:100vh">
    <loquix-chat-container layout="full" mode="chat">
      <loquix-chat-header slot="header" agent-name="Claude"></loquix-chat-header>
      <loquix-message-list slot="messages">
        <loquix-welcome-screen
          heading="How can I help?"
          layout="centered"
          .suggestions=${suggestions.slice(0, 2)}
        ></loquix-welcome-screen>
        <loquix-example-gallery
          variant="grid"
          columns=${3}
          heading="Or try an example"
          .items=${templates.map(t => ({ ...t, prompt: t.prompt }))}
        ></loquix-example-gallery>
      </loquix-message-list>
      <loquix-chat-composer
        slot="composer"
        variant="contained"
        placeholder="Type a message..."
      ></loquix-chat-composer>
    </loquix-chat-container>
  </div>`,
};

export const WithNudgeBanner: Story = {
  render: () => html` <div style="width:100%;height:100vh">
    <loquix-chat-container layout="full" mode="chat">
      <loquix-chat-header slot="header" agent-name="Claude"></loquix-chat-header>
      <loquix-message-list slot="messages">
        <loquix-nudge-banner variant="tip" icon="💡" nudge-id="welcome-tip">
          Pro tip: You can use templates to get started faster!
        </loquix-nudge-banner>
        <loquix-welcome-screen
          heading="Welcome back!"
          layout="centered"
          .suggestions=${suggestions}
        ></loquix-welcome-screen>
      </loquix-message-list>
      <loquix-chat-composer
        slot="composer"
        variant="contained"
        placeholder="Ask me anything..."
      ></loquix-chat-composer>
    </loquix-chat-container>
  </div>`,
};
