import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart } from '../../test-utils.js';
import './define-prompt-input.js';
import type { LoquixPromptInput } from './loquix-prompt-input.js';

describe('loquix-prompt-input', () => {
  it('renders with default properties', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    const container = getShadowPart(el, 'container');
    expect(container).to.exist;
    const input = getShadowPart(el, 'input');
    expect(input).to.exist;
    expect(input!.tagName.toLowerCase()).to.equal('textarea');
  });

  it('uses default placeholder', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    expect(textarea.placeholder).to.equal('Type a message...');
  });

  it('uses custom placeholder', async () => {
    const el = await fixture<LoquixPromptInput>(
      html`<loquix-prompt-input placeholder="Ask anything..."></loquix-prompt-input>`,
    );
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    expect(textarea.placeholder).to.equal('Ask anything...');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture<LoquixPromptInput>(
      html`<loquix-prompt-input variant="command"></loquix-prompt-input>`,
    );
    expect(el.variant).to.equal('command');
    expect(el.getAttribute('variant')).to.equal('command');
  });

  it('dispatches loquix-change on input', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    await el.updateComplete;
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    const eventPromise = waitForEvent(el, 'loquix-change');
    textarea.value = 'Hello';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    const event = await eventPromise;
    expect(event.detail.value).to.equal('Hello');
    expect(el.value).to.equal('Hello');
  });

  it('dispatches loquix-submit on Enter when submit-on-enter', async () => {
    const el = await fixture<LoquixPromptInput>(
      html`<loquix-prompt-input value="Test content" submit-on-enter></loquix-prompt-input>`,
    );
    await el.updateComplete;
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    const eventPromise = waitForEvent(el, 'loquix-submit');
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const event = await eventPromise;
    expect(event.detail.content).to.equal('Test content');
  });

  it('does not submit empty value', async () => {
    const el = await fixture<LoquixPromptInput>(
      html`<loquix-prompt-input value="" submit-on-enter></loquix-prompt-input>`,
    );
    await el.updateComplete;
    let fired = false;
    el.addEventListener('loquix-submit', () => {
      fired = true;
    });
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('is disabled when disabled attribute set', async () => {
    const el = await fixture<LoquixPromptInput>(
      html`<loquix-prompt-input disabled></loquix-prompt-input>`,
    );
    expect(el.disabled).to.be.true;
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    expect(textarea.disabled).to.be.true;
  });

  it('defaults to 1 row', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    expect(el.rows).to.equal(1);
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    expect(textarea.rows).to.equal(1);
  });

  it('uses custom rows', async () => {
    const el = await fixture<LoquixPromptInput>(
      html`<loquix-prompt-input rows="3"></loquix-prompt-input>`,
    );
    expect(el.rows).to.equal(3);
  });

  it('defaults to auto-resize enabled', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    expect(el.autoResize).to.be.true;
  });

  it('defaults to submit-on-enter enabled', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    expect(el.submitOnEnter).to.be.true;
  });

  it('sets value property', async () => {
    const el = await fixture<LoquixPromptInput>(
      html`<loquix-prompt-input value="initial text"></loquix-prompt-input>`,
    );
    expect(el.value).to.equal('initial text');
  });

  // === Paste-to-upload tests ===

  it('dispatches loquix-paste-files when files are pasted', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    await el.updateComplete;
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    const eventPromise = waitForEvent(el, 'loquix-paste-files');

    const file = new File(['hello'], 'test.png', { type: 'image/png' });
    const dt = new DataTransfer();
    dt.items.add(file);
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      composed: true,
      clipboardData: dt,
    });
    textarea.dispatchEvent(pasteEvent);

    const event = await eventPromise;
    expect(event.detail.files).to.have.lengthOf(1);
    expect(event.detail.files[0].name).to.equal('test.png');
  });

  it('does not dispatch loquix-paste-files for text-only paste', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    await el.updateComplete;
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    let fired = false;
    el.addEventListener('loquix-paste-files', () => {
      fired = true;
    });

    const dt = new DataTransfer();
    dt.setData('text/plain', 'just text');
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      composed: true,
      clipboardData: dt,
    });
    textarea.dispatchEvent(pasteEvent);

    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('dispatches loquix-paste-files with multiple files', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    await el.updateComplete;
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    const eventPromise = waitForEvent(el, 'loquix-paste-files');

    const file1 = new File(['a'], 'img1.png', { type: 'image/png' });
    const file2 = new File(['b'], 'img2.jpg', { type: 'image/jpeg' });
    const dt = new DataTransfer();
    dt.items.add(file1);
    dt.items.add(file2);
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      composed: true,
      clipboardData: dt,
    });
    textarea.dispatchEvent(pasteEvent);

    const event = await eventPromise;
    expect(event.detail.files).to.have.lengthOf(2);
  });

  it('calls preventDefault on paste with files to block filename insertion', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    await el.updateComplete;
    const textarea = el.shadowRoot!.querySelector('textarea')!;

    const file = new File(['hello'], 'test.png', { type: 'image/png' });
    const dt = new DataTransfer();
    dt.items.add(file);
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      composed: true,
      cancelable: true,
      clipboardData: dt,
    });
    textarea.dispatchEvent(pasteEvent);

    // Paste should be prevented so the browser doesn't insert the filename as text
    expect(pasteEvent.defaultPrevented).to.be.true;
  });

  it('extracts files from clipboardData.items when .files is empty (WebKit fallback)', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    await el.updateComplete;
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    const eventPromise = waitForEvent(el, 'loquix-paste-files');

    // Simulate WebKit behavior: .files is empty but .items has file entries
    const file = new File(['img'], 'screenshot.png', { type: 'image/png' });
    const mockClipboardData = {
      files: [] as unknown as FileList,
      items: [{ kind: 'file', getAsFile: () => file }] as unknown as DataTransferItemList,
      types: ['Files'],
      getData: () => '',
      setData: () => {},
      clearData: () => {},
      setDragImage: () => {},
      dropEffect: 'none' as const,
      effectAllowed: 'uninitialized' as const,
    };
    // Create paste event with mocked clipboardData
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      composed: true,
    });
    Object.defineProperty(pasteEvent, 'clipboardData', { value: mockClipboardData });
    textarea.dispatchEvent(pasteEvent);

    const event = await eventPromise;
    expect(event.detail.files).to.have.lengthOf(1);
    expect(event.detail.files[0].name).to.equal('screenshot.png');
  });

  // === Additional coverage tests ===

  it('variant="panel" applies panel variant attribute', async () => {
    const el = await fixture<LoquixPromptInput>(
      html`<loquix-prompt-input variant="panel"></loquix-prompt-input>`,
    );
    expect(el.variant).to.equal('panel');
    expect(el.getAttribute('variant')).to.equal('panel');
  });

  it('placeholder from localization when not explicitly set', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    // Default localized placeholder
    expect(textarea.placeholder).to.equal('Type a message...');
  });

  it('aria-label matches placeholder from localization when not explicitly set', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    expect(textarea.getAttribute('aria-label')).to.equal('Type a message...');
  });

  it('aria-label matches custom placeholder', async () => {
    const el = await fixture<LoquixPromptInput>(
      html`<loquix-prompt-input placeholder="Ask me anything..."></loquix-prompt-input>`,
    );
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    expect(textarea.getAttribute('aria-label')).to.equal('Ask me anything...');
  });

  it('does not submit on Enter when submit-on-enter is false', async () => {
    const el = await fixture<LoquixPromptInput>(
      html`<loquix-prompt-input value="Some text"></loquix-prompt-input>`,
    );
    el.submitOnEnter = false;
    await el.updateComplete;

    let fired = false;
    el.addEventListener('loquix-submit', () => {
      fired = true;
    });
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('Shift+Enter does not submit when submit-on-enter is true', async () => {
    const el = await fixture<LoquixPromptInput>(
      html`<loquix-prompt-input value="Some text" submit-on-enter></loquix-prompt-input>`,
    );
    await el.updateComplete;

    let fired = false;
    el.addEventListener('loquix-submit', () => {
      fired = true;
    });
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }),
    );
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('updates value property on input event', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    await el.updateComplete;
    const textarea = el.shadowRoot!.querySelector('textarea')!;
    textarea.value = 'new text';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.value).to.equal('new text');
  });

  it('container CSS part is queryable', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    const container = getShadowPart(el, 'container');
    expect(container).to.exist;
  });

  it('input CSS part is queryable', async () => {
    const el = await fixture<LoquixPromptInput>(html`<loquix-prompt-input></loquix-prompt-input>`);
    const input = getShadowPart(el, 'input');
    expect(input).to.exist;
    expect(input!.tagName.toLowerCase()).to.equal('textarea');
  });
});
