import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart, waitForEvent } from '../../test-utils.js';
import './define-message-actions.js';
import type { LoquixMessageActions } from './loquix-message-actions.js';

describe('loquix-message-actions', () => {
  it('renders toolbar with role', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions></loquix-message-actions>`,
    );
    const toolbar = getShadowPart(el, 'toolbar');
    expect(toolbar).to.exist;
    expect(toolbar!.getAttribute('role')).to.equal('toolbar');
    expect(toolbar!.getAttribute('aria-label')).to.equal('Message actions');
  });

  it('renders assistant actions for message-role=assistant', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions message-role="assistant"></loquix-message-actions>`,
    );
    await el.updateComplete;
    // Default assistant actions: copy, regenerate, feedback (positive + negative)
    const toolbar = getShadowPart(el, 'toolbar')!;
    const copyBtn = toolbar.querySelector('loquix-action-copy');
    expect(copyBtn).to.exist;
    const feedbackBtns = toolbar.querySelectorAll('loquix-action-feedback');
    expect(feedbackBtns.length).to.equal(2);
  });

  it('renders user actions for message-role=user', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions message-role="user"></loquix-message-actions>`,
    );
    await el.updateComplete;
    const toolbar = getShadowPart(el, 'toolbar')!;
    const editBtn = toolbar.querySelector('loquix-action-edit');
    expect(editBtn).to.exist;
  });

  it('renders system actions for system role', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions message-role="system"></loquix-message-actions>`,
    );
    await el.updateComplete;
    const toolbar = getShadowPart(el, 'toolbar')!;
    const copyBtn = toolbar.querySelector('loquix-action-copy');
    expect(copyBtn).to.exist;
  });

  it('supports custom slotted content', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions message-role="assistant">
        <button id="custom-btn">Custom</button>
      </loquix-message-actions>`,
    );
    const slot = el.shadowRoot!.querySelector('slot:not([name])') as HTMLSlotElement;
    expect(slot).to.exist;
    const assigned = slot.assignedElements();
    expect(assigned).to.have.lengthOf(1);
    expect((assigned[0] as HTMLElement).id).to.equal('custom-btn');
  });

  it('reflects direction property', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions direction="vertical"></loquix-message-actions>`,
    );
    expect(el.direction).to.equal('vertical');
    expect(el.getAttribute('direction')).to.equal('vertical');
  });

  it('reflects position property', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions position="always"></loquix-message-actions>`,
    );
    expect(el.position).to.equal('always');
    expect(el.getAttribute('position')).to.equal('always');
  });

  it('defaults to horizontal direction and hover position', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions></loquix-message-actions>`,
    );
    expect(el.direction).to.equal('horizontal');
    expect(el.position).to.equal('hover');
  });

  // --- sender="user" shows user-specific actions ---

  it('sender="user" shows edit action but not copy/feedback', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions message-role="user"></loquix-message-actions>`,
    );
    await el.updateComplete;
    const toolbar = getShadowPart(el, 'toolbar')!;
    const editBtn = toolbar.querySelector('loquix-action-edit');
    expect(editBtn).to.exist;
    // User actions should not have feedback buttons
    const feedbackBtns = toolbar.querySelectorAll('loquix-action-feedback');
    expect(feedbackBtns.length).to.equal(0);
  });

  // --- sender="assistant" shows assistant-specific actions ---

  it('sender="assistant" shows copy, regenerate, and feedback actions', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions message-role="assistant"></loquix-message-actions>`,
    );
    await el.updateComplete;
    const toolbar = getShadowPart(el, 'toolbar')!;
    const copyBtn = toolbar.querySelector('loquix-action-copy');
    expect(copyBtn).to.exist;
    const feedbackBtns = toolbar.querySelectorAll('loquix-action-feedback');
    expect(feedbackBtns.length).to.equal(2);
    // Check for regenerate button
    const actionButtons = toolbar.querySelectorAll('loquix-action-button');
    const regenerateBtn = Array.from(actionButtons).find(
      btn => btn.getAttribute('action') === 'loquix-regenerate',
    );
    expect(regenerateBtn).to.exist;
  });

  // --- Regenerate button dispatches event ---

  it('regenerate button dispatches loquix-regenerate event', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions message-role="assistant"></loquix-message-actions>`,
    );
    await el.updateComplete;
    const toolbar = getShadowPart(el, 'toolbar')!;
    const actionButtons = toolbar.querySelectorAll('loquix-action-button');
    const regenerateBtn = Array.from(actionButtons).find(
      btn => btn.getAttribute('action') === 'loquix-regenerate',
    );
    expect(regenerateBtn).to.exist;
    const eventPromise = waitForEvent(el, 'loquix-regenerate');
    const innerBtn = regenerateBtn!.shadowRoot!.querySelector('button')!;
    innerBtn.click();
    const event = await eventPromise;
    expect(event).to.exist;
  });

  // --- Toolbar aria-label from localization ---

  it('toolbar has aria-label from localization', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions></loquix-message-actions>`,
    );
    const toolbar = getShadowPart(el, 'toolbar')!;
    expect(toolbar.getAttribute('aria-label')).to.equal('Message actions');
  });

  // --- Custom slot content overrides defaults ---

  it('custom slot content overrides default action buttons', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions message-role="assistant">
        <button id="custom-action">My Action</button>
      </loquix-message-actions>`,
    );
    const slot = el.shadowRoot!.querySelector('slot:not([name])') as HTMLSlotElement;
    const assigned = slot.assignedElements();
    expect(assigned).to.have.lengthOf(1);
    expect((assigned[0] as HTMLElement).id).to.equal('custom-action');
  });

  // --- System role shows only copy ---

  it('system role shows only copy action', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions message-role="system"></loquix-message-actions>`,
    );
    await el.updateComplete;
    const toolbar = getShadowPart(el, 'toolbar')!;
    const copyBtn = toolbar.querySelector('loquix-action-copy');
    expect(copyBtn).to.exist;
    const editBtn = toolbar.querySelector('loquix-action-edit');
    expect(editBtn).to.not.exist;
    const feedbackBtns = toolbar.querySelectorAll('loquix-action-feedback');
    expect(feedbackBtns.length).to.equal(0);
  });

  // --- Reflects message-role attribute ---

  it('reflects message-role attribute', async () => {
    const el = await fixture<LoquixMessageActions>(
      html`<loquix-message-actions message-role="user"></loquix-message-actions>`,
    );
    expect(el.getAttribute('message-role')).to.equal('user');
  });
});
