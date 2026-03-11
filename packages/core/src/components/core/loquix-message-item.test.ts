import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart, nextFrame } from '../../test-utils.js';
import './define-message-item.js';
import './define-message-attachments.js';
import type { LoquixMessageItem } from './loquix-message-item.js';

describe('loquix-message-item', () => {
  it('renders with default properties', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item>Hello world</loquix-message-item>`,
    );
    const container = getShadowPart(el, 'container');
    expect(container).to.exist;
    expect(el.sender).to.equal('assistant');
    expect(el.status).to.equal('complete');
  });

  it('reflects sender attribute', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="user">My message</loquix-message-item>`,
    );
    expect(el.getAttribute('sender')).to.equal('user');
  });

  it('reflects status attribute', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item status="streaming">Loading...</loquix-message-item>`,
    );
    expect(el.getAttribute('status')).to.equal('streaming');
  });

  it('renders bubble part', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item>Hello</loquix-message-item>`,
    );
    const bubble = getShadowPart(el, 'bubble');
    expect(bubble).to.exist;
  });

  it('renders header with model when not private', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item model="GPT-4o">Hello</loquix-message-item>`,
    );
    const header = getShadowPart(el, 'header');
    expect(header).to.exist;
    expect(header!.textContent).to.contain('GPT-4o');
  });

  it('hides model in header when private-mode', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item model="GPT-4o" private-mode>Hello</loquix-message-item>`,
    );
    const header = getShadowPart(el, 'header');
    // Header should not render since no model and no timestamp
    expect(header).to.not.exist;
  });

  it('renders header with timestamp', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item timestamp="2:30 PM">Hello</loquix-message-item>`,
    );
    const header = getShadowPart(el, 'header');
    expect(header).to.exist;
    expect(header!.textContent).to.contain('2:30 PM');
  });

  it('renders actions for complete status', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item status="complete">Hello</loquix-message-item>`,
    );
    await el.updateComplete;
    const actions = getShadowPart(el, 'actions');
    expect(actions).to.exist;
  });

  it('hides actions for streaming status', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item status="streaming">Hello</loquix-message-item>`,
    );
    await el.updateComplete;
    const actions = getShadowPart(el, 'actions');
    expect(actions).to.not.exist;
  });

  it('shows typing indicator when status is pending', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item status="pending"></loquix-message-item>`,
    );
    await el.updateComplete;
    const indicator = el.shadowRoot!.querySelector('loquix-typing-indicator');
    expect(indicator).to.exist;
  });

  it('shows error retry bar when status is error', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item status="error">Failed content</loquix-message-item>`,
    );
    await el.updateComplete;
    const errorBar = el.shadowRoot!.querySelector('.error-bar');
    expect(errorBar).to.exist;
    const retryBtn = el.shadowRoot!.querySelector('.retry-button');
    expect(retryBtn).to.exist;
  });

  it('dispatches loquix-regenerate on retry click', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item status="error" message-id="msg-1">Failed</loquix-message-item>`,
    );
    await el.updateComplete;
    const retryBtn = el.shadowRoot!.querySelector('.retry-button') as HTMLButtonElement;
    const eventPromise = waitForEvent(el, 'loquix-regenerate');
    retryBtn.click();
    const event = await eventPromise;
    expect(event.detail.messageId).to.equal('msg-1');
  });

  it('has avatar and footer slots', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item show-avatar>
        <span slot="avatar">🤖</span>
        <span slot="footer">Footer text</span>
      </loquix-message-item>`,
    );
    for (const name of ['avatar', 'footer']) {
      const slot = el.shadowRoot!.querySelector(`slot[name="${name}"]`) as HTMLSlotElement;
      expect(slot, `slot "${name}"`).to.exist;
    }
  });

  it('has above-bubble and below-bubble slots', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="assistant" status="complete">
        <span slot="above-bubble">Above content</span>
        <p>Bubble text</p>
        <span slot="below-bubble">Below content</span>
      </loquix-message-item>`,
    );
    await el.updateComplete;
    for (const name of ['above-bubble', 'below-bubble']) {
      const slot = el.shadowRoot!.querySelector(`slot[name="${name}"]`) as HTMLSlotElement;
      expect(slot, `slot "${name}"`).to.exist;
    }
  });

  it('above-bubble and below-bubble are inside bubble-column wrapper', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="assistant" status="complete">
        <span slot="above-bubble">Above</span>
        <p>Content</p>
        <span slot="below-bubble">Below</span>
      </loquix-message-item>`,
    );
    await el.updateComplete;
    const bubbleColumn = el.shadowRoot!.querySelector('.bubble-column');
    expect(bubbleColumn).to.exist;
    // Bubble should be inside bubble-column
    const bubble = bubbleColumn!.querySelector('.bubble');
    expect(bubble).to.exist;
    // Named slots should be inside bubble-column
    const aboveSlot = bubbleColumn!.querySelector('slot[name="above-bubble"]');
    const belowSlot = bubbleColumn!.querySelector('slot[name="below-bubble"]');
    expect(aboveSlot).to.exist;
    expect(belowSlot).to.exist;
  });

  it('bubble-column has part attribute', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="assistant" status="complete">
        <p>Content</p>
      </loquix-message-item>`,
    );
    await el.updateComplete;
    const bubbleColumn = el.shadowRoot!.querySelector('[part="bubble-column"]');
    expect(bubbleColumn).to.exist;
  });

  it('reflects private-mode attribute', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item private-mode>Hello</loquix-message-item>`,
    );
    expect(el.privateMode).to.be.true;
    expect(el.hasAttribute('private-mode')).to.be.true;
  });

  it('reflects actions-position attribute', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item actions-position="inline-end">Hello</loquix-message-item>`,
    );
    expect(el.actionsPosition).to.equal('inline-end');
    expect(el.getAttribute('actions-position')).to.equal('inline-end');
  });

  it('hides avatar by default', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="assistant">Hello</loquix-message-item>`,
    );
    await el.updateComplete;
    const avatar = el.shadowRoot!.querySelector('loquix-message-avatar');
    expect(avatar).to.not.exist;
    const avatarColumn = el.shadowRoot!.querySelector('.avatar-column');
    expect(avatarColumn).to.not.exist;
  });

  it('shows avatar when show-avatar is set', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="assistant" show-avatar>Hello</loquix-message-item>`,
    );
    await el.updateComplete;
    const avatar = el.shadowRoot!.querySelector('loquix-message-avatar');
    expect(avatar).to.exist;
  });

  it('renders user avatar with show-avatar', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="user" show-avatar>My question</loquix-message-item>`,
    );
    await el.updateComplete;
    const avatar = el.shadowRoot!.querySelector('loquix-message-avatar');
    expect(avatar).to.exist;
    expect(avatar!.getAttribute('name')).to.equal('You');
  });

  it('passes avatar-size to inner avatar', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item show-avatar avatar-size="lg">Hello</loquix-message-item>`,
    );
    await el.updateComplete;
    const avatar = el.shadowRoot!.querySelector('loquix-message-avatar');
    expect(avatar).to.exist;
    expect(avatar!.getAttribute('size')).to.equal('lg');
  });

  it('defaults avatar-size to sm', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item show-avatar>Hello</loquix-message-item>`,
    );
    await el.updateComplete;
    const avatar = el.shadowRoot!.querySelector('loquix-message-avatar');
    expect(avatar!.getAttribute('size')).to.equal('sm');
  });

  it('sets message-id attribute', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item message-id="msg-42">Hello</loquix-message-item>`,
    );
    expect(el.messageId).to.equal('msg-42');
  });

  it('_getMessageText() excludes loquix-message-attachments from text', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="assistant" status="complete">
        <p>Here are the files.</p>
        <loquix-message-attachments
          .attachments=${[
            { id: 'a1', filename: 'test.pdf', filetype: 'pdf', size: 1024, status: 'complete' },
          ]}
        ></loquix-message-attachments>
      </loquix-message-item>`,
    );
    await el.updateComplete;
    // Trigger copy to get the extracted text
    const eventPromise = waitForEvent(el, 'loquix-copy');
    el.dispatchEvent(new CustomEvent('loquix-copy', { bubbles: true, composed: true, detail: {} }));
    const event = await eventPromise;
    // The text should contain the paragraph but NOT attachment filenames
    expect(event.detail.content).to.include('Here are the files.');
    expect(event.detail.content).to.not.include('test.pdf');
  });

  // --- Error state ---

  it('error state renders error text and retry button', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item status="error">Failed</loquix-message-item>`,
    );
    await el.updateComplete;
    const errorBar = el.shadowRoot!.querySelector('.error-bar');
    expect(errorBar).to.exist;
    const errorMsg = el.shadowRoot!.querySelector('.error-message');
    expect(errorMsg).to.exist;
    expect(errorMsg!.textContent!.trim()).to.be.a('string').and.not.be.empty;
    const retryBtn = el.shadowRoot!.querySelector('.retry-button');
    expect(retryBtn).to.exist;
  });

  // --- Retry button dispatches event with messageId ---

  it('retry button dispatches loquix-regenerate with messageId', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item status="error" message-id="msg-err">Failed</loquix-message-item>`,
    );
    await el.updateComplete;
    const retryBtn = el.shadowRoot!.querySelector('.retry-button') as HTMLButtonElement;
    const eventPromise = waitForEvent(el, 'loquix-regenerate');
    retryBtn.click();
    const event = await eventPromise;
    expect(event.detail.messageId).to.equal('msg-err');
  });

  // --- Event enrichment: copy event gets messageId + content ---

  it('loquix-copy event is enriched with messageId and content', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="assistant" status="complete" message-id="m-42">
        <p>Hello world</p>
      </loquix-message-item>`,
    );
    await el.updateComplete;
    const eventPromise = waitForEvent(el, 'loquix-copy');
    el.dispatchEvent(new CustomEvent('loquix-copy', { bubbles: true, composed: true, detail: {} }));
    const event = await eventPromise;
    expect(event.detail.messageId).to.equal('m-42');
    expect(event.detail.content).to.include('Hello world');
  });

  // --- Event enrichment: regenerate event gets messageId ---

  it('loquix-regenerate event is enriched with messageId', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="assistant" status="complete" message-id="m-99">
        <p>Some text</p>
      </loquix-message-item>`,
    );
    await el.updateComplete;
    const eventPromise = waitForEvent(el, 'loquix-regenerate');
    el.dispatchEvent(
      new CustomEvent('loquix-regenerate', { bubbles: true, composed: true, detail: {} }),
    );
    const event = await eventPromise;
    expect(event.detail.messageId).to.equal('m-99');
  });

  // --- Streaming state shows typing indicator ---

  it('streaming status shows typing indicator', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item status="streaming"></loquix-message-item>`,
    );
    await el.updateComplete;
    const indicator = el.shadowRoot!.querySelector('loquix-typing-indicator');
    expect(indicator).to.exist;
  });

  // --- sender="user" vs sender="assistant" different avatar ---

  it('user sender shows user avatar with name "You"', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="user" show-avatar>My question</loquix-message-item>`,
    );
    await el.updateComplete;
    const avatar = el.shadowRoot!.querySelector('loquix-message-avatar');
    expect(avatar).to.exist;
    expect(avatar!.getAttribute('name')).to.equal('You');
  });

  it('assistant sender shows assistant avatar without name attribute', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="assistant" show-avatar>Response</loquix-message-item>`,
    );
    await el.updateComplete;
    const avatar = el.shadowRoot!.querySelector('loquix-message-avatar');
    expect(avatar).to.exist;
    // Assistant avatar should not have a name attribute (uses default AI icon)
    expect(avatar!.hasAttribute('name')).to.be.false;
  });

  // --- Avatar slot overrides default ---

  it('avatar slot content overrides default avatar', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="assistant" show-avatar>
        <span slot="avatar">Custom Avatar</span>
        <p>Message</p>
      </loquix-message-item>`,
    );
    await el.updateComplete;
    const avatarSlot = el.shadowRoot!.querySelector('slot[name="avatar"]') as HTMLSlotElement;
    expect(avatarSlot).to.exist;
    const assigned = avatarSlot.assignedElements();
    expect(assigned).to.have.lengthOf(1);
    expect(assigned[0].textContent).to.equal('Custom Avatar');
  });

  // --- Timestamp rendering ---

  it('renders timestamp in header', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item timestamp="3:45 PM">Hello</loquix-message-item>`,
    );
    const header = getShadowPart(el, 'header');
    expect(header).to.exist;
    const time = header!.querySelector('time');
    expect(time).to.exist;
    expect(time!.textContent).to.contain('3:45 PM');
  });

  // --- No header when no model and no timestamp ---

  it('no header rendered when no model and no timestamp', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="assistant">Hello</loquix-message-item>`,
    );
    const header = getShadowPart(el, 'header');
    expect(header).to.not.exist;
  });

  // --- Actions hidden during editing ---

  it('actions are hidden during editing state', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="user" status="complete" message-id="m1">
        <p>My message</p>
      </loquix-message-item>`,
    );
    await el.updateComplete;

    // Before editing, actions should be present
    let actions = getShadowPart(el, 'actions');
    expect(actions).to.exist;

    // Trigger editing via edit-start event
    el.dispatchEvent(
      new CustomEvent('loquix-edit-start', {
        bubbles: true,
        composed: true,
        detail: { messageId: 'm1', content: 'My message' },
      }),
    );
    await el.updateComplete;

    // Actions should be hidden during editing
    actions = getShadowPart(el, 'actions');
    expect(actions).to.not.exist;
  });

  // --- Feedback event enrichment ---

  it('loquix-feedback event is enriched with messageId and sentiment', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="assistant" status="complete" message-id="m-fb">
        <p>Good response</p>
      </loquix-message-item>`,
    );
    await el.updateComplete;
    const eventPromise = waitForEvent(el, 'loquix-feedback');
    el.dispatchEvent(
      new CustomEvent('loquix-feedback', {
        bubbles: true,
        composed: true,
        detail: { sentiment: 'positive' },
      }),
    );
    const event = await eventPromise;
    expect(event.detail.messageId).to.equal('m-fb');
    expect(event.detail.sentiment).to.equal('positive');
  });

  // === Codex-found fix: collapse-height=0 edge case (2.14) ===

  it('collapse-height=0 never collapses user messages', async () => {
    const longText = 'A'.repeat(500);
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="user" status="complete" collapse-height="0">
        <p>${longText}</p>
      </loquix-message-item>`,
    );
    await el.updateComplete;
    await nextFrame();

    // With collapseHeight=0, there should be no "Show more" button
    const showMore = el.shadowRoot!.querySelector('.show-more');
    expect(showMore).to.not.exist;

    // Content should NOT have the collapsed class
    const content = el.shadowRoot!.querySelector('.content--collapsed');
    expect(content).to.not.exist;
  });

  it('collapse-height=0 does not show collapsed state even for very long content', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="user" status="complete" collapse-height="0">
        <p>${'Very long message. '.repeat(100)}</p>
      </loquix-message-item>`,
    );
    await el.updateComplete;
    await nextFrame();

    // No fade overlay
    const fade = el.shadowRoot!.querySelector('.content-fade');
    expect(fade).to.not.exist;

    // No show more button
    const showMore = el.shadowRoot!.querySelector('.show-more');
    expect(showMore).to.not.exist;
  });

  // ---------------------------------------------------------------------------
  // Regression: user bubble background token
  // ---------------------------------------------------------------------------

  it('user bubble has light gray background by default (light theme)', async () => {
    const el = await fixture<LoquixMessageItem>(
      html`<loquix-message-item sender="user">Hello</loquix-message-item>`,
    );
    const bubble = getShadowPart(el, 'bubble');
    expect(bubble).to.exist;
    const bg = getComputedStyle(bubble!).backgroundColor;
    // #f8fafc = rgb(248, 250, 252)
    expect(bg).to.equal('rgb(248, 250, 252)');
  });
});
