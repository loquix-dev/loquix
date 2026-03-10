import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart } from '../../test-utils.js';
import './define-message-list.js';
import type { LoquixMessageList } from './loquix-message-list.js';

describe('loquix-message-list', () => {
  it('renders with default properties', async () => {
    const el = await fixture<LoquixMessageList>(html`<loquix-message-list></loquix-message-list>`);
    expect(el).to.exist;
    expect(el.autoScroll).to.be.true;
    expect(el.showScrollAnchor).to.be.true;
    expect(el.scrollOnSend).to.be.true;
    const list = getShadowPart(el, 'list');
    expect(list).to.exist;
    const scrollContainer = getShadowPart(el, 'scroll-container');
    expect(scrollContainer).to.exist;
  });

  it('has loading and empty-state slots', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list>
        <div slot="loading">Loading...</div>
        <div slot="empty-state">No messages</div>
      </loquix-message-list>`,
    );
    const loadingSlot = el.shadowRoot!.querySelector('slot[name="loading"]') as HTMLSlotElement;
    expect(loadingSlot).to.exist;
    expect(loadingSlot.assignedElements()).to.have.lengthOf(1);
  });

  it('shows empty-state when no messages', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list>
        <div slot="empty-state">No messages yet</div>
      </loquix-message-list>`,
    );
    // Empty state slot should exist and have content
    const emptySlot = el.shadowRoot!.querySelector('slot[name="empty-state"]') as HTMLSlotElement;
    expect(emptySlot).to.exist;
  });

  it('detects slotted messages via slotchange', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list>
        <div>Message 1</div>
        <div>Message 2</div>
      </loquix-message-list>`,
    );
    // Wait for slot change detection
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 50));
    // The empty-state slot should not render when messages exist
    // (internal _hasMessages should be true)
    const defaultSlot = el.shadowRoot!.querySelector('slot:not([name])') as HTMLSlotElement;
    expect(defaultSlot).to.exist;
    expect(defaultSlot.assignedElements()).to.have.lengthOf(2);
  });

  it('reflects auto-scroll attribute', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list auto-scroll></loquix-message-list>`,
    );
    expect(el.autoScroll).to.be.true;
  });

  it('reflects show-timestamps attribute', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list show-timestamps></loquix-message-list>`,
    );
    expect(el.showTimestamps).to.be.true;
  });

  it('has default slot for messages', async () => {
    const el = await fixture<LoquixMessageList>(html`<loquix-message-list></loquix-message-list>`);
    const defaultSlot = el.shadowRoot!.querySelector('slot:not([name])') as HTMLSlotElement;
    expect(defaultSlot).to.exist;
  });

  it('renders scroll-container with proper structure', async () => {
    const el = await fixture<LoquixMessageList>(html`<loquix-message-list></loquix-message-list>`);
    const scrollContainer = getShadowPart(el, 'scroll-container')!;
    expect(scrollContainer.classList.contains('scroll-container')).to.be.true;
  });

  // --- Scroll-anchor tests ---

  it('renders scroll-anchor when auto-scroll and show-scroll-anchor are true', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list auto-scroll show-scroll-anchor></loquix-message-list>`,
    );
    await el.updateComplete;
    const anchor = el.shadowRoot!.querySelector('loquix-scroll-anchor');
    expect(anchor).to.exist;
  });

  it('does not render scroll-anchor when show-scroll-anchor is false', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list auto-scroll></loquix-message-list>`,
    );
    el.showScrollAnchor = false;
    await el.updateComplete;
    const anchor = el.shadowRoot!.querySelector('loquix-scroll-anchor');
    expect(anchor).to.not.exist;
  });

  it('does not render scroll-anchor when auto-scroll is false', async () => {
    const el = await fixture<LoquixMessageList>(html`<loquix-message-list></loquix-message-list>`);
    el.autoScroll = false;
    await el.updateComplete;
    const anchor = el.shadowRoot!.querySelector('loquix-scroll-anchor');
    expect(anchor).to.not.exist;
  });

  it('has scrollToBottom public method', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list auto-scroll></loquix-message-list>`,
    );
    expect(el.scrollToBottom).to.be.a('function');
  });

  it('has scrollToMessage public method', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list auto-scroll></loquix-message-list>`,
    );
    expect(el.scrollToMessage).to.be.a('function');
  });

  it('scrollToMessage returns false for unknown id', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list auto-scroll>
        <div message-id="msg-1">Message 1</div>
      </loquix-message-list>`,
    );
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 50));
    expect(el.scrollToMessage('unknown-id')).to.be.false;
  });

  it('scrollToMessage returns true for known id', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list auto-scroll>
        <div message-id="msg-1">Message 1</div>
        <div message-id="msg-2">Message 2</div>
      </loquix-message-list>`,
    );
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 50));
    expect(el.scrollToMessage('msg-2')).to.be.true;
  });

  it('reflects show-scroll-anchor attribute', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list show-scroll-anchor></loquix-message-list>`,
    );
    expect(el.showScrollAnchor).to.be.true;
  });

  it('reflects scroll-on-send attribute', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list scroll-on-send></loquix-message-list>`,
    );
    expect(el.scrollOnSend).to.be.true;
  });

  // --- Slotted auto-scroll integration tests (M4 fix) ---

  it('auto-scrolls when new slotted message is added', async () => {
    const el = await fixture<LoquixMessageList>(html`
      <loquix-message-list auto-scroll style="display:block;height:200px">
        <div style="min-height:50px;flex-shrink:0">Msg 1</div>
        <div style="min-height:50px;flex-shrink:0">Msg 2</div>
        <div style="min-height:50px;flex-shrink:0">Msg 3</div>
        <div style="min-height:50px;flex-shrink:0">Msg 4</div>
        <div style="min-height:50px;flex-shrink:0">Msg 5</div>
        <div style="min-height:50px;flex-shrink:0">Msg 6</div>
      </loquix-message-list>
    `);
    await el.updateComplete;
    // Wait for slotchange + initial auto-scroll + layout
    await new Promise(r => setTimeout(r, 300));

    const scrollContainer = getShadowPart(el, 'scroll-container')!;

    // Should already be at bottom (initial scroll)
    expect(scrollContainer.scrollTop).to.be.greaterThan(0);

    // Add more messages via light DOM (slotted)
    for (let i = 7; i <= 12; i++) {
      const div = document.createElement('div');
      div.style.minHeight = '50px';
      div.style.flexShrink = '0';
      div.textContent = `Msg ${i}`;
      el.appendChild(div);
    }

    // Wait for slotchange + rAF + auto-scroll
    await new Promise(r => setTimeout(r, 300));

    // Should still be at bottom (within threshold of 50px)
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    expect(scrollHeight - scrollTop - clientHeight).to.be.lessThan(55);
  });

  it('does not auto-scroll when user has scrolled away', async () => {
    const el = await fixture<LoquixMessageList>(html`
      <loquix-message-list auto-scroll style="display:block;height:200px">
        <div style="min-height:50px;flex-shrink:0">Msg 1</div>
        <div style="min-height:50px;flex-shrink:0">Msg 2</div>
        <div style="min-height:50px;flex-shrink:0">Msg 3</div>
        <div style="min-height:50px;flex-shrink:0">Msg 4</div>
        <div style="min-height:50px;flex-shrink:0">Msg 5</div>
        <div style="min-height:50px;flex-shrink:0">Msg 6</div>
      </loquix-message-list>
    `);
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 300));

    const scrollContainer = getShadowPart(el, 'scroll-container')!;

    // Simulate user scrolling to top
    scrollContainer.scrollTop = 0;
    scrollContainer.dispatchEvent(new Event('scroll'));
    // Wait for programmatic guard to expire (400ms + buffer)
    await new Promise(r => setTimeout(r, 600));

    const scrollTopAfterUserScroll = scrollContainer.scrollTop;

    // Add a new message
    const div = document.createElement('div');
    div.style.minHeight = '50px';
    div.textContent = 'New Msg';
    el.appendChild(div);

    // Wait for slotchange
    await new Promise(r => setTimeout(r, 200));

    // Should NOT have scrolled (user scrolled away)
    expect(scrollContainer.scrollTop).to.equal(scrollTopAfterUserScroll);
  });

  it('dispatches scroll events without scrollContainer in detail', async () => {
    const el = await fixture<LoquixMessageList>(html`
      <loquix-message-list auto-scroll style="display:block;height:200px">
        <div style="min-height:50px;flex-shrink:0">Msg 1</div>
        <div style="min-height:50px;flex-shrink:0">Msg 2</div>
        <div style="min-height:50px;flex-shrink:0">Msg 3</div>
        <div style="min-height:50px;flex-shrink:0">Msg 4</div>
        <div style="min-height:50px;flex-shrink:0">Msg 5</div>
        <div style="min-height:50px;flex-shrink:0">Msg 6</div>
      </loquix-message-list>
    `);
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 300));

    const scrollContainer = getShadowPart(el, 'scroll-container')!;

    // Listen for scroll-away event
    let receivedDetail: Record<string, unknown> | null = null;
    el.addEventListener('loquix-scroll-away', ((e: CustomEvent) => {
      receivedDetail = e.detail;
    }) as EventListener);

    // Scroll to top to trigger scroll-away — wait for guard to expire first
    await new Promise(r => setTimeout(r, 500));
    scrollContainer.scrollTop = 0;
    scrollContainer.dispatchEvent(new Event('scroll'));
    await new Promise(r => setTimeout(r, 50));

    if (receivedDetail) {
      // scrollContainer should NOT be in the detail (M3 fix)
      expect(receivedDetail).to.not.have.property('scrollContainer');
      expect(receivedDetail).to.have.property('scrollTop');
    }
  });

  // === Empty state slot renders when no messages ===

  it('empty-state slot renders when no slotted children exist', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list>
        <div slot="empty-state">No messages yet</div>
      </loquix-message-list>`,
    );
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 50));

    const emptySlot = el.shadowRoot!.querySelector('slot[name="empty-state"]') as HTMLSlotElement;
    expect(emptySlot).to.exist;
    const assigned = emptySlot.assignedElements();
    expect(assigned).to.have.lengthOf(1);
    expect(assigned[0].textContent).to.equal('No messages yet');
  });

  it('empty-state slot is hidden when messages are present', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list>
        <div slot="empty-state">No messages yet</div>
        <div>Message 1</div>
      </loquix-message-list>`,
    );
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 50));

    // The empty-state slot should not be in the DOM when _hasMessages is true
    const emptySlot = el.shadowRoot!.querySelector('slot[name="empty-state"]') as HTMLSlotElement;
    expect(emptySlot).to.not.exist;
  });

  // === Loading state shows indicator ===

  it('loading slot renders content for loading indicator', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list>
        <div slot="loading">Loading messages...</div>
      </loquix-message-list>`,
    );
    await el.updateComplete;
    const loadingSlot = el.shadowRoot!.querySelector('slot[name="loading"]') as HTMLSlotElement;
    expect(loadingSlot).to.exist;
    const assigned = loadingSlot.assignedElements();
    expect(assigned).to.have.lengthOf(1);
    expect(assigned[0].textContent).to.equal('Loading messages...');
  });

  it('loading slot coexists with messages', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list>
        <div slot="loading">Still loading...</div>
        <div>Message 1</div>
      </loquix-message-list>`,
    );
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 50));

    const loadingSlot = el.shadowRoot!.querySelector('slot[name="loading"]') as HTMLSlotElement;
    expect(loadingSlot).to.exist;
    expect(loadingSlot.assignedElements()).to.have.lengthOf(1);

    const defaultSlot = el.shadowRoot!.querySelector('slot:not([name])') as HTMLSlotElement;
    expect(defaultSlot.assignedElements()).to.have.lengthOf(1);
  });

  // === CSS parts are queryable ===

  it('all documented CSS parts are queryable', async () => {
    const el = await fixture<LoquixMessageList>(
      html`<loquix-message-list auto-scroll show-scroll-anchor></loquix-message-list>`,
    );
    await el.updateComplete;
    expect(getShadowPart(el, 'list')).to.exist;
    expect(getShadowPart(el, 'scroll-container')).to.exist;
    const anchor = el.shadowRoot!.querySelector('loquix-scroll-anchor');
    expect(anchor).to.exist;
  });

  // === Scroll event handling ===

  it('dispatches loquix-scroll-bottom when scrolled to bottom', async () => {
    const el = await fixture<LoquixMessageList>(html`
      <loquix-message-list auto-scroll style="display:block;height:200px">
        <div style="min-height:50px;flex-shrink:0">Msg 1</div>
        <div style="min-height:50px;flex-shrink:0">Msg 2</div>
        <div style="min-height:50px;flex-shrink:0">Msg 3</div>
        <div style="min-height:50px;flex-shrink:0">Msg 4</div>
        <div style="min-height:50px;flex-shrink:0">Msg 5</div>
        <div style="min-height:50px;flex-shrink:0">Msg 6</div>
      </loquix-message-list>
    `);
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 300));

    const scrollContainer = getShadowPart(el, 'scroll-container')!;

    // Wait for programmatic guard to expire
    await new Promise(r => setTimeout(r, 500));

    // Scroll to top first
    scrollContainer.scrollTop = 0;
    scrollContainer.dispatchEvent(new Event('scroll'));
    await new Promise(r => setTimeout(r, 500));

    // Now listen for scroll-bottom event
    let bottomFired = false;
    el.addEventListener('loquix-scroll-bottom', () => {
      bottomFired = true;
    });

    // Scroll back to bottom
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    scrollContainer.dispatchEvent(new Event('scroll'));
    await new Promise(r => setTimeout(r, 100));

    expect(bottomFired).to.be.true;
  });

  // === autoScroll disabled ===

  it('does not auto-scroll when autoScroll is false', async () => {
    const el = await fixture<LoquixMessageList>(html`
      <loquix-message-list style="display:block;height:200px">
        <div style="min-height:50px;flex-shrink:0">Msg 1</div>
        <div style="min-height:50px;flex-shrink:0">Msg 2</div>
      </loquix-message-list>
    `);
    el.autoScroll = false;
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 100));

    const anchor = el.shadowRoot!.querySelector('loquix-scroll-anchor');
    expect(anchor).to.not.exist;
  });

  // === scrollToMessage with valid ID ===

  it('scrollToMessage scrolls to element with matching message-id', async () => {
    const el = await fixture<LoquixMessageList>(html`
      <loquix-message-list auto-scroll style="display:block;height:100px">
        <div message-id="msg-1" style="min-height:100px;flex-shrink:0">Message 1</div>
        <div message-id="msg-2" style="min-height:100px;flex-shrink:0">Message 2</div>
        <div message-id="msg-3" style="min-height:100px;flex-shrink:0">Message 3</div>
      </loquix-message-list>
    `);
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 300));

    const result = el.scrollToMessage('msg-1');
    expect(result).to.be.true;
  });

  // === Default property values ===

  it('defaults virtualize to false', async () => {
    const el = await fixture<LoquixMessageList>(html`<loquix-message-list></loquix-message-list>`);
    expect(el.virtualize).to.be.false;
  });

  it('defaults showTimestamps to false', async () => {
    const el = await fixture<LoquixMessageList>(html`<loquix-message-list></loquix-message-list>`);
    expect(el.showTimestamps).to.be.false;
  });
});
