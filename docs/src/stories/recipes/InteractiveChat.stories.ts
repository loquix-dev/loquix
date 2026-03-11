import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import type { Attachment } from '@loquix/core';

/* ------------------------------------------------------------------ */
/*  Canned responses                                                   */
/* ------------------------------------------------------------------ */

const RESPONSES = [
  'Web Components are a set of browser-native APIs that let you create reusable, encapsulated HTML elements. They consist of Custom Elements (define new tags), Shadow DOM (style and markup isolation), and HTML Templates. Because they are built into the platform, they work with any framework — React, Vue, Svelte, Angular — or no framework at all.',

  'Shadow DOM creates an isolated DOM tree attached to an element. Styles defined inside the shadow root do not leak out, and external styles do not reach in (with a few exceptions like inherited properties). This encapsulation is what makes Web Components truly portable — you never have to worry about CSS conflicts when dropping a component into an existing app.',

  "Lit is a lightweight library from Google that makes building Web Components faster and more ergonomic. It adds reactive properties, declarative templates with tagged template literals, and a tiny runtime (~5 KB). Under the hood it's still standard Custom Elements and Shadow DOM — Lit just removes the boilerplate.",

  'Streaming responses in a chat UI require careful coordination: you need a message element in "streaming" status to show a typing indicator, then progressively append text chunks as they arrive from the API. The message list should auto-scroll to keep the latest content visible, and the composer should switch to a "stop" button so the user can cancel mid-generation.',

  'Theming Web Components is done through CSS custom properties (also called CSS variables) because they pierce the Shadow DOM boundary. Loquix exposes over 100 design tokens like --loquix-font-family, --loquix-radius-md, and --loquix-color-primary. You set them on a parent element and every component underneath picks them up automatically.',

  'Accessibility in chat interfaces means proper ARIA roles (log, listitem), live regions for new messages, keyboard navigation for action buttons, and focus management when dialogs open or close. Loquix targets WCAG 2.1 AA compliance — every interactive element is keyboard-accessible, and screen readers announce new messages as they arrive.',
];

const IMAGE_RESPONSE =
  "Thanks for sharing that image! I can see the file you uploaded. In a production app, this is where a vision model would analyze the image content and provide a detailed description. The attachment preview you see in the message is rendered by Loquix's message-attachments component.";

const FILE_RESPONSE =
  "I've received your file. In a real application, I could parse and analyze the document contents. Loquix handles the file upload UI — progress tracking, preview thumbnails for images, and type-based icons for other files — so you can focus on the backend integration.";

const SUGGESTION_RESPONSES: Record<string, string> = {
  '1': "Web Components are a set of browser-native APIs that let you create reusable, encapsulated HTML elements. They consist of three main specs: Custom Elements (define new HTML tags with their own behaviour), Shadow DOM (encapsulate styles and markup so they don't leak), and HTML Templates (declare inert markup fragments). Because they are built into every modern browser, components you build today will keep working for years — no framework churn, no breaking upgrades. You can use them with React, Vue, Angular, Svelte, or plain HTML.",

  '2': 'Shadow DOM creates a separate, isolated DOM tree attached to a host element. Styles inside that tree stay inside — they never bleed into the rest of the page — and outside styles cannot reach in (except for inherited CSS properties like color and font). This means you can drop a Shadow-DOM-based component into any page without worrying about class-name collisions or specificity wars. The API is straightforward: call element.attachShadow({ mode: "open" }) and append whatever markup you need. Slots let consumers project their own content into the shadow tree, giving you composition without tight coupling.',

  '3': 'Lit is a small (about 5 KB min+gz) library from Google that removes the boilerplate of writing Web Components by hand. It gives you reactive properties — change a value and the template re-renders automatically — plus a declarative html`` tagged-template syntax for describing your UI. Under the hood it is still standard Custom Elements and Shadow DOM, so everything you build with Lit interops with any framework. It also supports scoped styles, directives, async tasks, and a robust testing story via @open-wc/testing.',
};

/* ------------------------------------------------------------------ */
/*  Helper: detect image MIME type                                     */
/* ------------------------------------------------------------------ */

function isImageType(filetype: string): boolean {
  if (filetype.startsWith('image/')) return true;
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(filetype.toLowerCase());
}

/* ------------------------------------------------------------------ */
/*  Wire up interactive behaviour                                      */
/* ------------------------------------------------------------------ */

function wireChat(container: HTMLElement | undefined) {
  if (!container || (container as unknown as { _wired: boolean })._wired) return;
  (container as unknown as { _wired: boolean })._wired = true;

  const messageList = container.querySelector('loquix-message-list');
  const composer = container.querySelector('loquix-chat-composer');
  const panel = container.querySelector('loquix-attachment-panel') as
    | (HTMLElement & {
        attachments: Attachment[];
        addFiles(files: File[]): void;
      })
    | null;

  if (!messageList || !composer) return;

  let responseIndex = 0;
  let streamInterval: ReturnType<typeof setInterval> | null = null;
  let currentAssistantMsg: HTMLElement | null = null;
  let currentContent: HTMLElement | null = null;
  let currentText = '';
  let charIndex = 0;

  /* -- Attachment upload simulation -------------------------------- */

  const blobUrls = new Map<string, string>();

  container.addEventListener('loquix-attachment-add', ((e: CustomEvent) => {
    if (!panel) return;
    const newAttachments: Attachment[] = e.detail.attachments;

    for (const att of newAttachments) {
      // Create blob URL for image previews
      if (att.file && isImageType(att.filetype)) {
        blobUrls.set(att.id, URL.createObjectURL(att.file));
      }

      // Start simulated upload
      att.status = 'uploading';
      att.progress = 0;

      const uploadInterval = setInterval(() => {
        att.progress = Math.min(100, (att.progress ?? 0) + Math.floor(Math.random() * 25) + 10);

        if (att.progress >= 100) {
          att.status = 'complete';
          att.progress = 100;
          clearInterval(uploadInterval);
        }

        // Trigger reactivity by reassigning the array
        panel.attachments = [...panel.attachments];
      }, 200);
    }

    panel.attachments = [...panel.attachments, ...newAttachments];
  }) as EventListener);

  container.addEventListener('loquix-attachment-remove', ((e: CustomEvent) => {
    if (!panel) return;
    const removed: Attachment = e.detail.attachment;
    const url = blobUrls.get(removed.id);
    if (url) {
      URL.revokeObjectURL(url);
      blobUrls.delete(removed.id);
    }
    panel.attachments = panel.attachments.filter(a => a.id !== removed.id);
  }) as EventListener);

  /* -- Create message helpers ------------------------------------- */

  function createUserMessage(content: string, attachments: Attachment[]) {
    const msg = document.createElement('loquix-message-item');
    msg.setAttribute('sender', 'user');
    msg.setAttribute('status', 'complete');
    msg.setAttribute(
      'timestamp',
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    );

    const p = document.createElement('p');
    p.textContent = content;
    msg.appendChild(p);

    if (attachments.length > 0) {
      const msgAttachments = document.createElement('loquix-message-attachments');
      msgAttachments.setAttribute('slot', 'below-bubble');
      msgAttachments.setAttribute('size', 'md');

      const displayAttachments = attachments.map(a => ({
        ...a,
        url: blobUrls.get(a.id) ?? a.url,
      }));
      (msgAttachments as unknown as { attachments: Attachment[] }).attachments = displayAttachments;

      msg.appendChild(msgAttachments);
    }

    return msg;
  }

  function createAssistantMessage() {
    const msg = document.createElement('loquix-message-item');
    msg.setAttribute('sender', 'assistant');
    msg.setAttribute('status', 'streaming');
    msg.setAttribute('model', 'Loquix Demo');
    msg.setAttribute(
      'timestamp',
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    );

    const contentEl = document.createElement('loquix-message-content');
    contentEl.setAttribute('streaming-cursor', 'caret');
    msg.appendChild(contentEl);

    return { msg, contentEl };
  }

  /* -- Streaming simulation --------------------------------------- */

  function startStream(text: string, assistantMsg: HTMLElement, contentEl: HTMLElement) {
    currentAssistantMsg = assistantMsg;
    currentContent = contentEl;
    currentText = text;
    charIndex = 0;

    composer.setAttribute('streaming', '');

    streamInterval = setInterval(() => {
      // Stream 1-3 characters at a time for natural feel
      const chunkSize = Math.floor(Math.random() * 3) + 1;
      const nextChars = currentText.slice(charIndex, charIndex + chunkSize);
      charIndex += chunkSize;

      contentEl.textContent = currentText.slice(0, charIndex);

      if (charIndex >= currentText.length) {
        finishStream();
      }
    }, 25);
  }

  function finishStream() {
    if (streamInterval) {
      clearInterval(streamInterval);
      streamInterval = null;
    }

    if (currentContent) {
      currentContent.removeAttribute('streaming-cursor');
      currentContent.textContent = currentText;
    }

    if (currentAssistantMsg) {
      currentAssistantMsg.setAttribute('status', 'complete');
    }

    composer.removeAttribute('streaming');
    currentAssistantMsg = null;
    currentContent = null;
  }

  function pickResponse(hadImages: boolean, hadFiles: boolean): string {
    if (hadImages) return IMAGE_RESPONSE;
    if (hadFiles) return FILE_RESPONSE;
    const resp = RESPONSES[responseIndex % RESPONSES.length];
    responseIndex++;
    return resp;
  }

  /* -- Event handlers --------------------------------------------- */

  container.addEventListener('loquix-submit', ((e: CustomEvent) => {
    const content: string = e.detail.content;
    if (!content.trim() && (!panel || panel.attachments.length === 0)) return;

    // Collect completed attachments
    const completedAttachments = panel
      ? panel.attachments.filter(a => a.status === 'complete')
      : [];

    const hadImages = completedAttachments.some(a => isImageType(a.filetype));
    const hadFiles = completedAttachments.length > 0 && !hadImages;

    // Add user message
    const userMsg = createUserMessage(content, completedAttachments);
    messageList.appendChild(userMsg);

    // Clear attachment panel
    if (panel) {
      panel.attachments = [];
    }

    // Add assistant streaming message
    const { msg: assistantMsg, contentEl } = createAssistantMessage();
    messageList.appendChild(assistantMsg);

    // Start streaming response
    const responseText = pickResponse(hadImages, hadFiles);
    startStream(responseText, assistantMsg, contentEl);
  }) as EventListener);

  container.addEventListener('loquix-stop', (() => {
    finishStream();
  }) as EventListener);

  container.addEventListener('loquix-regenerate', (() => {
    // Remove last assistant message
    const messages = messageList.querySelectorAll('loquix-message-item');
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.getAttribute('sender') === 'assistant') {
      lastMsg.remove();
    }

    // Generate new response
    const { msg: newMsg, contentEl } = createAssistantMessage();
    messageList.appendChild(newMsg);

    const responseText = RESPONSES[responseIndex % RESPONSES.length];
    responseIndex++;
    startStream(responseText, newMsg, contentEl);
  }) as EventListener);

  container.addEventListener('loquix-feedback', ((e: CustomEvent) => {
    console.log('[Loquix Demo] Feedback:', e.detail.sentiment, e.detail.messageId);
  }) as EventListener);

  container.addEventListener('loquix-copy', ((e: CustomEvent) => {
    console.log('[Loquix Demo] Copied:', e.detail.messageId);
  }) as EventListener);

  container.addEventListener('loquix-suggestion-select', ((e: CustomEvent) => {
    const suggestion = e.detail.suggestion as { id: string; text: string };
    const text = suggestion.text;

    // Add user message with the suggestion text
    const userMsg = createUserMessage(text, []);
    messageList.appendChild(userMsg);

    // Pick matching response or fall back to generic
    const responseText = SUGGESTION_RESPONSES[suggestion.id] ?? pickResponse(false, false);

    // Add assistant streaming message
    const { msg: assistantMsg, contentEl } = createAssistantMessage();
    messageList.appendChild(assistantMsg);
    startStream(responseText, assistantMsg, contentEl);
  }) as EventListener);
}

/* ------------------------------------------------------------------ */
/*  Story                                                              */
/* ------------------------------------------------------------------ */

const meta: Meta = {
  title: 'Recipes/Interactive Chat',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const InteractiveChat: Story = {
  render: () =>
    html`<div
      style="width:480px;height:680px;margin:24px auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden"
    >
      <loquix-chat-container layout="panel" mode="chat" ${ref(el => wireChat(el as HTMLElement))}>
        <loquix-chat-header slot="header" agent-name="Loquix Demo" show-model-badge>
          <loquix-message-avatar
            slot="avatar"
            variant="initials"
            name="AI"
            size="sm"
          ></loquix-message-avatar>
        </loquix-chat-header>

        <loquix-message-list slot="messages" auto-scroll>
          <loquix-message-item
            sender="assistant"
            status="complete"
            model="Loquix Demo"
            timestamp="${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}"
          >
            <p>
              Welcome! I'm an interactive demo of Loquix chat components. Try sending a message,
              attaching an image, or using the action buttons on my responses.
            </p>
            <loquix-follow-up-suggestions
              .suggestions=${[
                { id: '1', text: 'How do Web Components work?' },
                { id: '2', text: 'Tell me about Shadow DOM' },
                { id: '3', text: 'What is Lit?' },
              ]}
            ></loquix-follow-up-suggestions>
          </loquix-message-item>
        </loquix-message-list>

        <loquix-chat-composer
          slot="composer"
          variant="contained"
          placeholder="Type a message or drop an image..."
        >
          <loquix-attachment-panel slot="toolbar-top" multiple></loquix-attachment-panel>
        </loquix-chat-composer>

        <loquix-caveat-notice slot="footer" variant="footer"></loquix-caveat-notice>
      </loquix-chat-container>
    </div>`,
};
