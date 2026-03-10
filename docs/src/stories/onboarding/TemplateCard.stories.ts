import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Onboarding/TemplateCard',
  component: 'loquix-template-card',
  tags: ['autodocs'],
  argTypes: {
    selected: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => html` <loquix-template-card
    .template=${{
      id: '1',
      title: 'Write a Blog Post',
      description: 'Generate a structured blog post on any topic',
      icon: '✍️',
      prompt: 'Write a blog post about...',
    }}
  ></loquix-template-card>`,
};

export const Selected: Story = {
  render: () => html` <loquix-template-card
    selected
    .template=${{
      id: '2',
      title: 'Code Review',
      description: 'Review and improve code quality',
      icon: '🔍',
      prompt: 'Review this code...',
    }}
  ></loquix-template-card>`,
};

export const Minimal: Story = {
  render: () => html` <loquix-template-card
    .template=${{
      id: '3',
      title: 'Quick Question',
      prompt: 'Answer this question...',
    }}
  ></loquix-template-card>`,
};

export const Grid: Story = {
  render: () => html` <div
    style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;width:600px"
  >
    <loquix-template-card
      .template=${{ id: '1', title: 'Blog Post', icon: '✍️', prompt: '' }}
    ></loquix-template-card>
    <loquix-template-card
      .template=${{ id: '2', title: 'Code Review', icon: '🔍', prompt: '' }}
    ></loquix-template-card>
    <loquix-template-card
      .template=${{ id: '3', title: 'Summarize', icon: '📝', prompt: '' }}
    ></loquix-template-card>
  </div>`,
};
