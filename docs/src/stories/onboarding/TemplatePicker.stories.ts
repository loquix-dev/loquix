import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const templates = [
  {
    id: '1',
    title: 'Blog Post',
    description: 'Write a structured blog post',
    icon: '✍️',
    category: 'Writing',
    prompt: 'Write a blog post...',
  },
  {
    id: '2',
    title: 'Code Review',
    description: 'Analyze and improve code',
    icon: '🔍',
    category: 'Development',
    prompt: 'Review this code...',
  },
  {
    id: '3',
    title: 'Email Draft',
    description: 'Compose a professional email',
    icon: '📧',
    category: 'Writing',
    prompt: 'Draft an email...',
  },
  {
    id: '4',
    title: 'Debug Helper',
    description: 'Help find and fix bugs',
    icon: '🐛',
    category: 'Development',
    prompt: 'Help me debug...',
  },
  {
    id: '5',
    title: 'Data Analysis',
    description: 'Analyze datasets and trends',
    icon: '📊',
    category: 'Analysis',
    prompt: 'Analyze this data...',
  },
  {
    id: '6',
    title: 'Meeting Notes',
    description: 'Summarize meeting notes',
    icon: '📋',
    category: 'Writing',
    prompt: 'Summarize these notes...',
  },
];

/** Helper: click handler that opens the sibling picker via .show() */
function openPicker(e: Event) {
  const btn = e.target as HTMLElement;
  const picker = btn.parentElement?.querySelector('loquix-template-picker') as any;
  picker?.show();
}

const meta: Meta = {
  title: 'Onboarding/TemplatePicker',
  component: 'loquix-template-picker',
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
    searchable: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: { heading: 'Choose a template' },
  render: args => html` <div>
    <button @click=${openPicker}>Open Template Picker</button>
    <loquix-template-picker
      heading=${args.heading}
      .templates=${templates}
      .categories=${['Writing', 'Development', 'Analysis']}
    ></loquix-template-picker>
  </div>`,
};

export const WithSearch: Story = {
  args: { heading: 'Find a template', searchable: true },
  render: args => html` <div>
    <button @click=${openPicker}>Open Template Picker</button>
    <loquix-template-picker
      heading=${args.heading}
      ?searchable=${args.searchable}
      .templates=${templates}
      .categories=${['Writing', 'Development', 'Analysis']}
    ></loquix-template-picker>
  </div>`,
};

export const NoCategories: Story = {
  args: { heading: 'Templates' },
  render: args => html` <div>
    <button @click=${openPicker}>Open Template Picker</button>
    <loquix-template-picker
      heading=${args.heading}
      .templates=${templates}
    ></loquix-template-picker>
  </div>`,
};
