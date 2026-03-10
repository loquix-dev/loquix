import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart } from '../../test-utils.js';
import './define-chat-composer.js';
import './define-attachment-panel.js';
import type { LoquixChatComposer } from './loquix-chat-composer.js';
import type { LoquixAttachmentPanel } from './loquix-attachment-panel.js';
import { createLoquixEvent } from '../../events/index.js';
import type { LoquixPasteFilesDetail } from '../../events/index.js';

describe('loquix-chat-composer', () => {
  it('renders with default properties', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer></loquix-chat-composer>`,
    );
    const composer = getShadowPart(el, 'composer');
    expect(composer).to.exist;
    expect(el.variant).to.equal('contained');
    expect(el.disabled).to.be.false;
    expect(el.streaming).to.be.false;
  });

  it('renders contained layout by default', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const container = getShadowPart(el, 'container');
    expect(container).to.exist;
    const actionsBar = getShadowPart(el, 'actions-bar');
    expect(actionsBar).to.exist;
  });

  it('renders default layout when variant=default', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer variant="default"></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const container = getShadowPart(el, 'container');
    // Default layout doesn't have the container part
    expect(container).to.not.exist;
    const inputRow = el.shadowRoot!.querySelector('.input-row');
    expect(inputRow).to.exist;
  });

  it('renders send button by default', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const sendBtn = getShadowPart(el, 'send-button');
    expect(sendBtn).to.exist;
    expect(sendBtn!.getAttribute('aria-label')).to.equal('Send message');
  });

  it('send button is disabled when no content', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const sendBtn = getShadowPart(el, 'send-button');
    expect(sendBtn!.hasAttribute('disabled')).to.be.true;
  });

  it('renders stop button when streaming', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer streaming></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const sendBtn = getShadowPart(el, 'send-button');
    expect(sendBtn!.getAttribute('aria-label')).to.equal('Stop generation');
  });

  it('dispatches loquix-stop when stop button clicked', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer streaming></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const sendBtn = getShadowPart(el, 'send-button')!;
    const eventPromise = waitForEvent(el, 'loquix-stop');
    sendBtn.click();
    const event = await eventPromise;
    expect(event).to.exist;
  });

  it('is disabled when disabled attribute set', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer disabled></loquix-chat-composer>`,
    );
    expect(el.disabled).to.be.true;
    expect(el.hasAttribute('disabled')).to.be.true;
  });

  it('uses custom placeholder', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer placeholder="Ask me anything..."></loquix-chat-composer>`,
    );
    expect(el.placeholder).to.equal('Ask me anything...');
  });

  it('has toolbar-top, toolbar-bottom, suggestions, and footer slots', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer>
        <span slot="toolbar-top">Top</span>
        <span slot="toolbar-bottom">Bottom</span>
        <span slot="suggestions">Suggestions</span>
        <span slot="footer">Footer</span>
      </loquix-chat-composer>`,
    );
    for (const name of ['toolbar-top', 'suggestions', 'toolbar-bottom', 'footer']) {
      const slot = el.shadowRoot!.querySelector(`slot[name="${name}"]`) as HTMLSlotElement;
      expect(slot, `slot "${name}"`).to.exist;
    }
  });

  it('has actions-left and actions-right slots in contained variant', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer variant="contained">
        <span slot="actions-left">📎</span>
        <span slot="actions-right">🎤</span>
      </loquix-chat-composer>`,
    );
    for (const name of ['actions-left', 'actions-right']) {
      const slot = el.shadowRoot!.querySelector(`slot[name="${name}"]`) as HTMLSlotElement;
      expect(slot, `slot "${name}"`).to.exist;
    }
  });

  it('has input slot for overriding the default prompt input', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer>
        <textarea slot="input">Custom input</textarea>
      </loquix-chat-composer>`,
    );
    const slot = el.shadowRoot!.querySelector('slot[name="input"]') as HTMLSlotElement;
    expect(slot).to.exist;
  });

  it('renders inner prompt-input component', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const promptInput = el.shadowRoot!.querySelector('loquix-prompt-input');
    expect(promptInput).to.exist;
  });

  it('reflects variant attribute', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer variant="default"></loquix-chat-composer>`,
    );
    expect(el.variant).to.equal('default');
    expect(el.getAttribute('variant')).to.equal('default');
  });

  // === submit-disabled tests ===

  it('send button is disabled when submit-disabled is set', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer submit-disabled></loquix-chat-composer>`,
    );
    await el.updateComplete;
    expect(el.submitDisabled).to.be.true;
    expect(el.hasAttribute('submit-disabled')).to.be.true;
    const sendBtn = getShadowPart(el, 'send-button');
    expect(sendBtn!.hasAttribute('disabled')).to.be.true;
  });

  it('input remains active when submit-disabled is set', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer submit-disabled></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const promptInput = el.shadowRoot!.querySelector('loquix-prompt-input')!;
    // Input should NOT be disabled
    expect(promptInput.hasAttribute('disabled')).to.be.false;
  });

  it('blocks Enter submit when submit-disabled is set', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer submit-disabled></loquix-chat-composer>`,
    );
    await el.updateComplete;

    let submitFired = false;
    el.addEventListener('loquix-submit', () => {
      submitFired = true;
    });

    // Simulate the inner input dispatching a submit event
    const promptInput = el.shadowRoot!.querySelector('loquix-prompt-input')!;
    promptInput.dispatchEvent(createLoquixEvent('loquix-submit', { content: 'hello' }));

    await new Promise(r => setTimeout(r, 50));
    expect(submitFired).to.be.false;
  });

  it('allows submit after submit-disabled is removed', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer submit-disabled></loquix-chat-composer>`,
    );
    await el.updateComplete;

    // Remove submit-disabled
    el.submitDisabled = false;
    await el.updateComplete;

    const sendBtn = getShadowPart(el, 'send-button');
    // Still disabled because no content — but NOT because of submitDisabled
    expect(sendBtn!.hasAttribute('disabled')).to.be.true;

    // Simulate input change to add content
    const promptInput = el.shadowRoot!.querySelector('loquix-prompt-input')!;
    promptInput.dispatchEvent(createLoquixEvent('loquix-change', { value: 'hello' }));
    await el.updateComplete;

    // Now button should be enabled
    expect(sendBtn!.hasAttribute('disabled')).to.be.false;
  });

  // === Paste-to-upload auto-wiring tests ===

  it('forwards loquix-paste-files to slotted attachment-panel', async () => {
    const el = await fixture<LoquixChatComposer>(html`
      <loquix-chat-composer>
        <loquix-attachment-panel slot="toolbar-top"></loquix-attachment-panel>
      </loquix-chat-composer>
    `);
    await el.updateComplete;

    const panel = el.querySelector('loquix-attachment-panel') as LoquixAttachmentPanel;
    expect(panel).to.exist;

    const eventPromise = waitForEvent(panel, 'loquix-attachment-add');
    const file = new File(['data'], 'screenshot.png', { type: 'image/png' });
    el.dispatchEvent(
      createLoquixEvent<LoquixPasteFilesDetail>('loquix-paste-files', { files: [file] }),
    );

    const event = await eventPromise;
    expect(event.detail.attachments).to.have.lengthOf(1);
    expect(event.detail.attachments[0].filename).to.equal('screenshot.png');
  });

  it('lets loquix-paste-files bubble when no attachment-panel present', async () => {
    const el = await fixture<LoquixChatComposer>(html`
      <loquix-chat-composer></loquix-chat-composer>
    `);
    await el.updateComplete;

    // Wrap in a div to catch the bubbled event
    const wrapper = el.parentElement!;
    let bubbled = false;
    wrapper.addEventListener('loquix-paste-files', () => {
      bubbled = true;
    });

    const file = new File(['data'], 'screenshot.png', { type: 'image/png' });
    el.dispatchEvent(
      createLoquixEvent<LoquixPasteFilesDetail>('loquix-paste-files', { files: [file] }),
    );

    await new Promise(r => setTimeout(r, 50));
    expect(bubbled).to.be.true;
  });

  it('stops loquix-paste-files propagation when panel handles it', async () => {
    const el = await fixture<LoquixChatComposer>(html`
      <loquix-chat-composer>
        <loquix-attachment-panel slot="toolbar-top"></loquix-attachment-panel>
      </loquix-chat-composer>
    `);
    await el.updateComplete;

    const wrapper = el.parentElement!;
    let bubbled = false;
    wrapper.addEventListener('loquix-paste-files', () => {
      bubbled = true;
    });

    const file = new File(['data'], 'screenshot.png', { type: 'image/png' });
    el.dispatchEvent(
      createLoquixEvent<LoquixPasteFilesDetail>('loquix-paste-files', { files: [file] }),
    );

    await new Promise(r => setTimeout(r, 50));
    expect(bubbled).to.be.false;
  });

  it('full integration: textarea paste → composer → attachment-panel', async () => {
    const el = await fixture<LoquixChatComposer>(html`
      <loquix-chat-composer>
        <loquix-attachment-panel slot="toolbar-top"></loquix-attachment-panel>
      </loquix-chat-composer>
    `);
    await el.updateComplete;

    const panel = el.querySelector('loquix-attachment-panel') as LoquixAttachmentPanel;
    expect(panel).to.exist;

    // Get the inner prompt-input's textarea through Shadow DOM
    const promptInput = el.shadowRoot!.querySelector('loquix-prompt-input')!;
    await promptInput.updateComplete;
    const textarea = promptInput.shadowRoot!.querySelector('textarea')!;
    expect(textarea).to.exist;

    const eventPromise = waitForEvent(panel, 'loquix-attachment-add');

    // Simulate real paste on the textarea
    const file = new File(['screenshot'], 'capture.png', { type: 'image/png' });
    const dt = new DataTransfer();
    dt.items.add(file);
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      composed: true,
      clipboardData: dt,
    });
    textarea.dispatchEvent(pasteEvent);

    const event = await eventPromise;
    expect(event.detail.attachments).to.have.lengthOf(1);
    expect(event.detail.attachments[0].filename).to.equal('capture.png');
  });

  // === Additional coverage tests ===

  it('send button click does not fire submit when submitDisabled', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer submit-disabled></loquix-chat-composer>`,
    );
    await el.updateComplete;

    // Simulate content so _hasContent becomes true internally
    const promptInput = el.shadowRoot!.querySelector('loquix-prompt-input')!;
    promptInput.dispatchEvent(createLoquixEvent('loquix-change', { value: 'hello' }));
    await el.updateComplete;

    let submitFired = false;
    el.addEventListener('loquix-submit', () => {
      submitFired = true;
    });

    // The button should still be disabled because submitDisabled is set
    const sendBtn = getShadowPart(el, 'send-button')!;
    expect(sendBtn.hasAttribute('disabled')).to.be.true;
    sendBtn.click();

    await new Promise(r => setTimeout(r, 50));
    expect(submitFired).to.be.false;
  });

  it('streaming replaces send button with stop button', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer></loquix-chat-composer>`,
    );
    await el.updateComplete;
    let btn = getShadowPart(el, 'send-button')!;
    expect(btn.getAttribute('aria-label')).to.equal('Send message');
    expect(btn.classList.contains('send-button--stop')).to.be.false;

    // Switch to streaming
    el.streaming = true;
    await el.updateComplete;
    btn = getShadowPart(el, 'send-button')!;
    expect(btn.getAttribute('aria-label')).to.equal('Stop generation');
    expect(btn.classList.contains('send-button--stop')).to.be.true;
  });

  it('stop button dispatches loquix-stop event', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer streaming></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const stopBtn = getShadowPart(el, 'send-button')!;
    const eventPromise = waitForEvent(el, 'loquix-stop');
    stopBtn.click();
    const event = await eventPromise;
    expect(event).to.exist;
    expect(event.type).to.equal('loquix-stop');
  });

  it('maxLength property is reflected to max-length attribute', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer max-length="500"></loquix-chat-composer>`,
    );
    expect(el.maxLength).to.equal(500);
  });

  it('send button aria-label comes from localization', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const sendBtn = getShadowPart(el, 'send-button')!;
    expect(sendBtn.getAttribute('aria-label')).to.equal('Send message');
  });

  it('stop button aria-label comes from localization', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer streaming></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const stopBtn = getShadowPart(el, 'send-button')!;
    expect(stopBtn.getAttribute('aria-label')).to.equal('Stop generation');
  });

  it('uses localized placeholder when none explicitly set', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const promptInput = el.shadowRoot!.querySelector('loquix-prompt-input')!;
    await promptInput.updateComplete;
    const textarea = promptInput.shadowRoot!.querySelector('textarea')!;
    expect(textarea.placeholder).to.equal('Type a message...');
  });

  it('uses contained variant inner prompt-input with variant="panel"', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer variant="contained"></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const promptInput = el.shadowRoot!.querySelector('loquix-prompt-input')!;
    expect(promptInput.getAttribute('variant')).to.equal('panel');
  });

  it('default variant inner prompt-input does not have variant="panel"', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer variant="default"></loquix-chat-composer>`,
    );
    await el.updateComplete;
    const promptInput = el.shadowRoot!.querySelector('loquix-prompt-input')!;
    expect(promptInput.getAttribute('variant')).to.not.equal('panel');
  });

  it('send button becomes enabled after content is entered', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer></loquix-chat-composer>`,
    );
    await el.updateComplete;

    const sendBtn = getShadowPart(el, 'send-button')!;
    expect(sendBtn.hasAttribute('disabled')).to.be.true;

    // Simulate typing
    const promptInput = el.shadowRoot!.querySelector('loquix-prompt-input')!;
    promptInput.dispatchEvent(createLoquixEvent('loquix-change', { value: 'hello' }));
    await el.updateComplete;

    expect(sendBtn.hasAttribute('disabled')).to.be.false;
  });

  it('dispatches loquix-submit on send button click with content', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer></loquix-chat-composer>`,
    );
    await el.updateComplete;

    // Simulate typing content
    const promptInput = el.shadowRoot!.querySelector('loquix-prompt-input')!;
    promptInput.dispatchEvent(createLoquixEvent('loquix-change', { value: 'hello world' }));
    await el.updateComplete;

    const sendBtn = getShadowPart(el, 'send-button')!;
    const eventPromise = waitForEvent(el, 'loquix-submit');
    sendBtn.click();
    const event = await eventPromise;
    expect(event.detail.content).to.equal('hello world');
  });

  it('resets input value after send button submit', async () => {
    const el = await fixture<LoquixChatComposer>(
      html`<loquix-chat-composer></loquix-chat-composer>`,
    );
    await el.updateComplete;

    const promptInput = el.shadowRoot!.querySelector('loquix-prompt-input')!;
    promptInput.dispatchEvent(createLoquixEvent('loquix-change', { value: 'hello world' }));
    await el.updateComplete;

    const sendBtn = getShadowPart(el, 'send-button')!;
    sendBtn.click();
    await el.updateComplete;

    // After submit, send button should be disabled again (no content)
    expect(sendBtn.hasAttribute('disabled')).to.be.true;
  });
});
