import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart } from '../../test-utils.js';
import './define-message-content.js';
import type { LoquixMessageContent } from './loquix-message-content.js';

describe('loquix-message-content', () => {
  it('renders text content by default', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content>Hello world</loquix-message-content>`,
    );
    expect(el.type).to.equal('text');
    const content = getShadowPart(el, 'content');
    expect(content).to.exist;
  });

  it('renders code block when type=code', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content type="code" code="const x = 1;"></loquix-message-content>`,
    );
    expect(el.type).to.equal('code');
    const codeBlock = getShadowPart(el, 'code-block');
    expect(codeBlock).to.exist;
    expect(codeBlock!.textContent).to.contain('const x = 1;');
  });

  it('no cursor by default when streaming', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content streaming>In progress...</loquix-message-content>`,
    );
    expect(el.streaming).to.be.true;
    expect(el.streamingCursor).to.equal('none');
    const cursor = el.shadowRoot!.querySelector('.streaming-cursor');
    expect(cursor).to.not.exist;
  });

  it('shows caret cursor', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content streaming streaming-cursor="caret"
        >Text</loquix-message-content
      >`,
    );
    const cursor = el.shadowRoot!.querySelector('.streaming-cursor.caret');
    expect(cursor).to.exist;
  });

  it('shows block cursor', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content streaming streaming-cursor="block"
        >Text</loquix-message-content
      >`,
    );
    const cursor = el.shadowRoot!.querySelector('.streaming-cursor.block');
    expect(cursor).to.exist;
  });

  it('hides cursor when not streaming even with cursor set', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content streaming-cursor="caret">Done</loquix-message-content>`,
    );
    const cursor = el.shadowRoot!.querySelector('.streaming-cursor');
    expect(cursor).to.not.exist;
  });

  it('treats invalid cursor value as none', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content streaming streaming-cursor="blink"
        >Text</loquix-message-content
      >`,
    );
    const cursor = el.shadowRoot!.querySelector('.streaming-cursor');
    expect(cursor).to.not.exist;
  });

  it('reflects streaming-cursor attribute', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content></loquix-message-content>`,
    );
    el.streamingCursor = 'block';
    await el.updateComplete;
    expect(el.getAttribute('streaming-cursor')).to.equal('block');
  });

  it('reflects type attribute', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content type="code"></loquix-message-content>`,
    );
    expect(el.getAttribute('type')).to.equal('code');
  });

  it('reflects streaming attribute', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content streaming></loquix-message-content>`,
    );
    expect(el.hasAttribute('streaming')).to.be.true;
  });

  it('renders slotted content in text mode', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content><strong>Bold text</strong> and normal</loquix-message-content>`,
    );
    const content = getShadowPart(el, 'content');
    expect(content).to.exist;
    const slot = content!.querySelector('slot');
    expect(slot).to.exist;
  });

  it('reflects allow-inline-actions attribute', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content allow-inline-actions>Content</loquix-message-content>`,
    );
    expect(el.allowInlineActions).to.be.true;
    expect(el.hasAttribute('allow-inline-actions')).to.be.true;
  });

  it('defaults allowInlineActions to false', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content>Content</loquix-message-content>`,
    );
    expect(el.allowInlineActions).to.be.false;
  });

  it('renders cursor with aria-hidden="true"', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content streaming streaming-cursor="caret"
        >Text</loquix-message-content
      >`,
    );
    const cursor = el.shadowRoot!.querySelector('.streaming-cursor');
    expect(cursor).to.exist;
    expect(cursor!.getAttribute('aria-hidden')).to.equal('true');
  });

  it('renders code block with empty string when code is not set', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content type="code"></loquix-message-content>`,
    );
    const codeBlock = getShadowPart(el, 'code-block');
    expect(codeBlock).to.exist;
    const codeEl = codeBlock!.querySelector('code');
    expect(codeEl).to.exist;
    expect(codeEl!.textContent).to.equal('');
  });

  it('CSS part "content" is queryable in text mode', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content>Some text</loquix-message-content>`,
    );
    const content = getShadowPart(el, 'content');
    expect(content).to.exist;
    expect(content!.classList.contains('content')).to.be.true;
  });

  it('CSS part "code-block" is queryable in code mode', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content type="code" code="x = 1"></loquix-message-content>`,
    );
    const codeBlock = getShadowPart(el, 'code-block');
    expect(codeBlock).to.exist;
    expect(codeBlock!.tagName.toLowerCase()).to.equal('pre');
  });

  it('does not render content part in code mode', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content type="code" code="let a = 1;"></loquix-message-content>`,
    );
    const content = getShadowPart(el, 'content');
    expect(content).to.not.exist;
  });

  it('does not render code-block part in text mode', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content>Plain text</loquix-message-content>`,
    );
    const codeBlock = getShadowPart(el, 'code-block');
    expect(codeBlock).to.not.exist;
  });

  it('streaming cursor has the "cursor" CSS part', async () => {
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content streaming streaming-cursor="block"
        >Text</loquix-message-content
      >`,
    );
    const cursor = getShadowPart(el, 'cursor');
    expect(cursor).to.exist;
    expect(cursor!.classList.contains('streaming-cursor')).to.be.true;
    expect(cursor!.classList.contains('block')).to.be.true;
  });

  it('renders code content safely inside code element', async () => {
    const codeStr = '<script>alert("xss")</script>';
    const el = await fixture<LoquixMessageContent>(
      html`<loquix-message-content type="code" .code=${codeStr}></loquix-message-content>`,
    );
    const codeBlock = getShadowPart(el, 'code-block');
    const codeEl = codeBlock!.querySelector('code');
    // Lit text binding escapes HTML, so the script tag should be text, not executable
    expect(codeEl!.textContent).to.contain('<script>');
    expect(codeEl!.innerHTML).to.not.contain('<script>');
  });
});
