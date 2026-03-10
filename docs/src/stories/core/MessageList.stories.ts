import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/MessageList',
  component: 'loquix-message-list',
  tags: ['autodocs'],
  argTypes: {
    autoScroll: { control: 'boolean' },
    showTimestamps: { control: 'boolean' },
    showScrollAnchor: { control: 'boolean' },
    scrollOnSend: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: { autoScroll: true, showTimestamps: false },
  render: args => html` <div style="width:600px;height:400px">
    <loquix-message-list ?auto-scroll=${args.autoScroll} ?show-timestamps=${args.showTimestamps}>
      <loquix-message-item sender="user" status="complete">
        <p>What is the meaning of life?</p>
      </loquix-message-item>
      <loquix-message-item sender="assistant" status="complete" model="Claude 3.5">
        <p>
          That is one of humanity's most profound philosophical questions, explored across cultures
          and millennia.
        </p>
      </loquix-message-item>
      <loquix-message-item sender="user" status="complete">
        <p>Can you elaborate?</p>
      </loquix-message-item>
      <loquix-message-item sender="assistant" status="complete" model="Claude 3.5">
        <p>There are many perspectives to consider, from existentialist to religious viewpoints.</p>
      </loquix-message-item>
    </loquix-message-list>
  </div>`,
};

export const WithTimestamps: Story = {
  args: { showTimestamps: true },
  render: args => html` <div style="width:600px;height:400px">
    <loquix-message-list ?show-timestamps=${args.showTimestamps}>
      <loquix-message-item sender="user" status="complete" timestamp="2:30 PM">
        <p>Hello there!</p>
      </loquix-message-item>
      <loquix-message-item sender="assistant" status="complete" model="Claude" timestamp="2:30 PM">
        <p>Hi! How can I help you today?</p>
      </loquix-message-item>
    </loquix-message-list>
  </div>`,
};

export const Empty: Story = {
  render: () => html` <div style="width:600px;height:200px">
    <loquix-message-list></loquix-message-list>
  </div>`,
};

export const WithScrollAnchor: Story = {
  render: () => {
    const messages = Array.from({ length: 30 }, (_, i) => ({
      sender: i % 2 === 0 ? 'user' : 'assistant',
      text: `Message ${i + 1}: ${
        i % 2 === 0
          ? 'A question from the user.'
          : 'A response from the assistant with some longer text to fill the space and demonstrate scrolling behavior.'
      }`,
    }));
    return html` <div style="width:600px;height:400px">
        <loquix-message-list
          auto-scroll
          show-scroll-anchor
          @loquix-scroll-bottom=${() => console.log('loquix-scroll-bottom')}
          @loquix-scroll-away=${(e: CustomEvent) =>
            console.log('loquix-scroll-away', e.detail.scrollTop)}
        >
          ${messages.map(
            m => html`
              <loquix-message-item sender=${m.sender} status="complete">
                <p>${m.text}</p>
              </loquix-message-item>
            `,
          )}
        </loquix-message-list>
      </div>
      <p style="margin-top:8px;color:var(--loquix-text-secondary-color,#666);font-size:12px">
        ↑ Scroll up to see the ↓ anchor button. Check console for scroll events.
      </p>`;
  },
};

export const LiveStreaming: Story = {
  render: () => {
    const words =
      'The meaning of life is a profound philosophical question that has occupied thinkers for millennia. From the ancient Greek philosophers like Socrates, Plato, and Aristotle, to modern existentialists like Sartre and Camus, humans have sought to understand their purpose and place in the universe. Some find meaning through religion and spirituality, others through relationships and love, and still others through creative expression, scientific discovery, or the pursuit of knowledge. Perhaps the most beautiful aspect of this question is that each person must ultimately find their own answer, crafting a unique narrative that gives their existence significance and purpose. Whether through acts of kindness, artistic creation, intellectual exploration, or simply the joy of being alive, meaning is something we create rather than discover.'.split(
        ' ',
      );

    const startStreaming = (e: Event) => {
      const button = e.target as HTMLButtonElement;
      button.disabled = true;
      const container = button.closest('div')!;
      const list = container.querySelector('loquix-message-list')!;

      const msg = document.createElement('loquix-message-item');
      msg.setAttribute('sender', 'assistant');
      msg.setAttribute('status', 'streaming');
      msg.setAttribute('model', 'Claude 3.5');
      const p = document.createElement('p');
      msg.appendChild(p);
      list.appendChild(msg);

      let i = 0;
      const interval = setInterval(() => {
        if (i < words.length) {
          p.textContent += (i > 0 ? ' ' : '') + words[i];
          i++;
        } else {
          clearInterval(interval);
          msg.setAttribute('status', 'complete');
          button.disabled = false;
        }
      }, 60);
    };

    return html` <div>
      <div style="width:600px;height:300px">
        <loquix-message-list
          auto-scroll
          show-scroll-anchor
          @loquix-scroll-bottom=${() => console.log('loquix-scroll-bottom')}
          @loquix-scroll-away=${(e: CustomEvent) =>
            console.log('loquix-scroll-away', e.detail.scrollTop)}
        >
          <loquix-message-item sender="user" status="complete">
            <p>What is the meaning of life? Please give a detailed answer.</p>
          </loquix-message-item>
        </loquix-message-list>
      </div>
      <button style="margin-top:8px;padding:6px 16px;cursor:pointer" @click=${startStreaming}>
        ▶ Start streaming response
      </button>
      <p style="color:var(--loquix-text-secondary-color,#666);font-size:12px;margin-top:4px">
        Click the button to simulate a streaming response. Scroll up during streaming to see the ↓
        anchor button appear. Check console for scroll events.
      </p>
    </div>`;
  },
};
