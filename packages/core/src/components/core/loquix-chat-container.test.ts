import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart } from '../../test-utils.js';
import './define-chat-container.js';
import type { LoquixChatContainer } from './loquix-chat-container.js';

describe('loquix-chat-container', () => {
  it('renders with default properties', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container></loquix-chat-container>`,
    );
    expect(el.layout).to.equal('full');
    expect(el.mode).to.equal('chat');
    const container = getShadowPart(el, 'container');
    expect(container).to.exist;
  });

  it('has all named slots', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container>
        <div slot="header">Header</div>
        <div slot="sidebar">Sidebar</div>
        <div slot="messages">Messages</div>
        <div slot="composer">Composer</div>
        <div slot="footer">Footer</div>
      </loquix-chat-container>`,
    );
    for (const name of ['header', 'sidebar', 'messages', 'composer', 'footer']) {
      const slot = el.shadowRoot!.querySelector(`slot[name="${name}"]`) as HTMLSlotElement;
      expect(slot, `slot "${name}"`).to.exist;
      expect(slot.assignedElements()).to.have.lengthOf(1);
    }
  });

  it('reflects layout attribute', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container layout="floating"></loquix-chat-container>`,
    );
    expect(el.layout).to.equal('floating');
    expect(el.getAttribute('layout')).to.equal('floating');
  });

  it('reflects mode attribute', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container mode="research"></loquix-chat-container>`,
    );
    expect(el.mode).to.equal('research');
    expect(el.getAttribute('mode')).to.equal('research');
  });

  it('reflects private-mode attribute', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container private-mode></loquix-chat-container>`,
    );
    expect(el.privateMode).to.be.true;
    expect(el.hasAttribute('private-mode')).to.be.true;
  });

  it('reflects streaming attribute', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container streaming></loquix-chat-container>`,
    );
    expect(el.streaming).to.be.true;
    expect(el.hasAttribute('streaming')).to.be.true;
  });

  it('has sidebar and main parts', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container></loquix-chat-container>`,
    );
    const sidebar = getShadowPart(el, 'sidebar');
    const main = getShadowPart(el, 'main');
    expect(sidebar).to.exist;
    expect(main).to.exist;
  });

  it('accepts model property', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container model="gpt-4o"></loquix-chat-container>`,
    );
    expect(el.model).to.equal('gpt-4o');
  });

  // --- Layout property reflects for all values ---

  it('layout property reflects as attribute for full', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container layout="full"></loquix-chat-container>`,
    );
    expect(el.layout).to.equal('full');
    expect(el.getAttribute('layout')).to.equal('full');
  });

  it('layout property reflects as attribute for sidebar', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container layout="sidebar"></loquix-chat-container>`,
    );
    expect(el.layout).to.equal('sidebar');
    expect(el.getAttribute('layout')).to.equal('sidebar');
  });

  // --- memoryEnabled property ---

  it('accepts memoryEnabled property via memory-enabled attribute', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container memory-enabled></loquix-chat-container>`,
    );
    expect(el.memoryEnabled).to.be.true;
  });

  it('memoryEnabled defaults to false', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container></loquix-chat-container>`,
    );
    expect(el.memoryEnabled).to.be.false;
  });

  // --- Streaming reflects ---

  it('streaming property can be set programmatically and reflects', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container></loquix-chat-container>`,
    );
    expect(el.streaming).to.be.false;
    el.streaming = true;
    await el.updateComplete;
    expect(el.hasAttribute('streaming')).to.be.true;
  });

  // --- Private-mode reflects ---

  it('privateMode property can be set programmatically and reflects', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container></loquix-chat-container>`,
    );
    expect(el.privateMode).to.be.false;
    el.privateMode = true;
    await el.updateComplete;
    expect(el.hasAttribute('private-mode')).to.be.true;
  });

  // --- All slots render slotted content ---

  it('each slot renders its slotted content correctly', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container>
        <div slot="header">H</div>
        <div slot="sidebar">S</div>
        <div slot="messages">M</div>
        <div slot="composer">C</div>
        <div slot="footer">F</div>
      </loquix-chat-container>`,
    );
    const headerSlot = el.shadowRoot!.querySelector('slot[name="header"]') as HTMLSlotElement;
    expect(headerSlot.assignedElements()[0].textContent).to.equal('H');
    const sidebarSlot = el.shadowRoot!.querySelector('slot[name="sidebar"]') as HTMLSlotElement;
    expect(sidebarSlot.assignedElements()[0].textContent).to.equal('S');
  });

  // --- CSS parts ---

  it('has container, main, and sidebar CSS parts', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container></loquix-chat-container>`,
    );
    expect(getShadowPart(el, 'container')).to.exist;
    expect(getShadowPart(el, 'main')).to.exist;
    expect(getShadowPart(el, 'sidebar')).to.exist;
  });

  // --- Default property values ---

  it('defaults to full layout and chat mode', async () => {
    const el = await fixture<LoquixChatContainer>(
      html`<loquix-chat-container></loquix-chat-container>`,
    );
    expect(el.layout).to.equal('full');
    expect(el.mode).to.equal('chat');
    expect(el.model).to.equal('');
    expect(el.streaming).to.be.false;
    expect(el.privateMode).to.be.false;
    expect(el.memoryEnabled).to.be.false;
  });
});
