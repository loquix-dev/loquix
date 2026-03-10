import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart } from '../../test-utils.js';
import './define-chat-header.js';
import type { LoquixChatHeader } from './loquix-chat-header.js';

describe('loquix-chat-header', () => {
  it('renders with default agent name', async () => {
    const el = await fixture<LoquixChatHeader>(html`<loquix-chat-header></loquix-chat-header>`);
    const header = getShadowPart(el, 'header');
    expect(header).to.exist;
    expect(header!.getAttribute('role')).to.equal('banner');
    const title = getShadowPart(el, 'title');
    expect(title).to.exist;
    expect(title!.textContent).to.contain('AI Assistant');
  });

  it('uses custom agent-name', async () => {
    const el = await fixture<LoquixChatHeader>(
      html`<loquix-chat-header agent-name="Claude"></loquix-chat-header>`,
    );
    expect(el.agentName).to.equal('Claude');
    const title = getShadowPart(el, 'title')!;
    expect(title.textContent).to.contain('Claude');
  });

  it('has avatar, title, controls, and mode-switcher slots', async () => {
    const el = await fixture<LoquixChatHeader>(
      html`<loquix-chat-header show-model-badge>
        <span slot="avatar">🤖</span>
        <span slot="controls">Controls</span>
        <span slot="mode-switcher">Modes</span>
      </loquix-chat-header>`,
    );
    for (const name of ['avatar', 'controls', 'mode-switcher']) {
      const slot = el.shadowRoot!.querySelector(`slot[name="${name}"]`) as HTMLSlotElement;
      expect(slot, `slot "${name}"`).to.exist;
    }
  });

  it('hides controls slot when private-mode and show-model-badge', async () => {
    const el = await fixture<LoquixChatHeader>(
      html`<loquix-chat-header show-model-badge private-mode>
        <span slot="controls">Secret Model</span>
      </loquix-chat-header>`,
    );
    // In private-mode, controls slot should not render
    const controlsSlot = el.shadowRoot!.querySelector(
      'slot[name="controls"]',
    ) as HTMLSlotElement | null;
    expect(controlsSlot).to.not.exist;
  });

  it('shows controls when show-model-badge and not private', async () => {
    const el = await fixture<LoquixChatHeader>(
      html`<loquix-chat-header show-model-badge>
        <span slot="controls">GPT-4</span>
      </loquix-chat-header>`,
    );
    const controlsSlot = el.shadowRoot!.querySelector('slot[name="controls"]') as HTMLSlotElement;
    expect(controlsSlot).to.exist;
  });

  it('reflects private-mode attribute', async () => {
    const el = await fixture<LoquixChatHeader>(
      html`<loquix-chat-header private-mode></loquix-chat-header>`,
    );
    expect(el.privateMode).to.be.true;
    expect(el.hasAttribute('private-mode')).to.be.true;
  });

  // --- showModelBadge shows/hides ---

  it('showModelBadge=false hides controls slot even without private-mode', async () => {
    const el = await fixture<LoquixChatHeader>(
      html`<loquix-chat-header>
        <span slot="controls">Model Info</span>
      </loquix-chat-header>`,
    );
    // show-model-badge defaults to false, so controls slot should not render
    const controlsSlot = el.shadowRoot!.querySelector(
      'slot[name="controls"]',
    ) as HTMLSlotElement | null;
    expect(controlsSlot).to.not.exist;
  });

  it('showModelBadge=true shows controls slot when not private', async () => {
    const el = await fixture<LoquixChatHeader>(
      html`<loquix-chat-header show-model-badge>
        <span slot="controls">GPT-4</span>
      </loquix-chat-header>`,
    );
    const controlsSlot = el.shadowRoot!.querySelector('slot[name="controls"]') as HTMLSlotElement;
    expect(controlsSlot).to.exist;
    const assigned = controlsSlot.assignedElements();
    expect(assigned).to.have.lengthOf(1);
    expect(assigned[0].textContent).to.equal('GPT-4');
  });

  // --- privateMode hides model info ---

  it('privateMode hides controls even when showModelBadge is true', async () => {
    const el = await fixture<LoquixChatHeader>(
      html`<loquix-chat-header show-model-badge private-mode>
        <span slot="controls">Secret</span>
      </loquix-chat-header>`,
    );
    const controlsSlot = el.shadowRoot!.querySelector(
      'slot[name="controls"]',
    ) as HTMLSlotElement | null;
    expect(controlsSlot).to.not.exist;
  });

  // --- agentName from localization ---

  it('renders default agent name from localization when no agentName set', async () => {
    const el = await fixture<LoquixChatHeader>(html`<loquix-chat-header></loquix-chat-header>`);
    const title = getShadowPart(el, 'title')!;
    expect(title.textContent).to.contain('AI Assistant');
  });

  // --- title slot overrides agent name ---

  it('title slot overrides default agent name', async () => {
    const el = await fixture<LoquixChatHeader>(
      html`<loquix-chat-header agent-name="Claude">
        <span slot="title">Custom Title</span>
      </loquix-chat-header>`,
    );
    const titleSlot = el.shadowRoot!.querySelector('slot[name="title"]') as HTMLSlotElement;
    expect(titleSlot).to.exist;
    const assigned = titleSlot.assignedElements();
    expect(assigned).to.have.lengthOf(1);
    expect(assigned[0].textContent).to.equal('Custom Title');
  });

  // --- status slot is actually mode-switcher slot ---

  it('mode-switcher slot renders slotted content', async () => {
    const el = await fixture<LoquixChatHeader>(
      html`<loquix-chat-header>
        <span slot="mode-switcher">Mode Switch</span>
      </loquix-chat-header>`,
    );
    const slot = el.shadowRoot!.querySelector('slot[name="mode-switcher"]') as HTMLSlotElement;
    expect(slot).to.exist;
    const assigned = slot.assignedElements();
    expect(assigned).to.have.lengthOf(1);
  });

  // --- CSS parts ---

  it('has header and title CSS parts', async () => {
    const el = await fixture<LoquixChatHeader>(html`<loquix-chat-header></loquix-chat-header>`);
    expect(getShadowPart(el, 'header')).to.exist;
    expect(getShadowPart(el, 'title')).to.exist;
  });

  // --- header has banner role ---

  it('header has role=banner', async () => {
    const el = await fixture<LoquixChatHeader>(html`<loquix-chat-header></loquix-chat-header>`);
    const header = getShadowPart(el, 'header')!;
    expect(header.getAttribute('role')).to.equal('banner');
  });

  // --- avatar slot renders ---

  it('avatar slot renders slotted content', async () => {
    const el = await fixture<LoquixChatHeader>(
      html`<loquix-chat-header>
        <img slot="avatar" src="avatar.png" alt="Bot" />
      </loquix-chat-header>`,
    );
    const slot = el.shadowRoot!.querySelector('slot[name="avatar"]') as HTMLSlotElement;
    expect(slot).to.exist;
    const assigned = slot.assignedElements();
    expect(assigned).to.have.lengthOf(1);
  });
});
