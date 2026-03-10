import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const items = [
  {
    id: '1',
    title: 'Travel Planner',
    description: 'Plan a detailed itinerary',
    icon: '✈️',
    category: 'Productivity',
    prompt: 'Plan a trip to...',
  },
  {
    id: '2',
    title: 'Recipe Creator',
    description: 'Generate recipes from ingredients',
    icon: '🍳',
    category: 'Creative',
    prompt: 'Create a recipe with...',
  },
  {
    id: '3',
    title: 'Story Writer',
    description: 'Write creative fiction',
    icon: '📖',
    category: 'Creative',
    prompt: 'Write a story about...',
  },
  {
    id: '4',
    title: 'Budget Tracker',
    description: 'Create a budget plan',
    icon: '💰',
    category: 'Productivity',
    prompt: 'Help me budget...',
  },
  {
    id: '5',
    title: 'Workout Plan',
    description: 'Design a fitness routine',
    icon: '💪',
    category: 'Health',
    prompt: 'Create a workout...',
  },
  {
    id: '6',
    title: 'Study Guide',
    description: 'Build structured study materials',
    icon: '📚',
    category: 'Education',
    prompt: 'Create a study guide...',
  },
];

const meta: Meta = {
  title: 'Onboarding/ExampleGallery',
  component: 'loquix-example-gallery',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['grid', 'list', 'carousel'] },
    columns: { control: 'number' },
    heading: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj;

export const Grid: Story = {
  args: { variant: 'grid', columns: 3, heading: 'Try these examples' },
  render: args => html` <div style="width:700px">
    <loquix-example-gallery
      variant=${args.variant}
      columns=${args.columns}
      heading=${args.heading}
      .items=${items}
      .categories=${['Creative', 'Productivity', 'Health', 'Education']}
    ></loquix-example-gallery>
  </div>`,
};

export const List: Story = {
  args: { variant: 'list', heading: 'Examples' },
  render: args => html` <div style="width:500px">
    <loquix-example-gallery
      variant=${args.variant}
      heading=${args.heading}
      .items=${items}
    ></loquix-example-gallery>
  </div>`,
};

export const Carousel: Story = {
  args: { variant: 'carousel', heading: 'Featured Examples' },
  render: args => html` <div style="width:600px">
    <loquix-example-gallery
      variant=${args.variant}
      heading=${args.heading}
      .items=${items}
    ></loquix-example-gallery>
  </div>`,
};

export const TwoColumns: Story = {
  args: { variant: 'grid', columns: 2, heading: 'Examples' },
  render: args => html` <div style="width:500px">
    <loquix-example-gallery
      variant=${args.variant}
      columns=${args.columns}
      heading=${args.heading}
      .items=${items.slice(0, 4)}
    ></loquix-example-gallery>
  </div>`,
};
