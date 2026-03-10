import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart, simulateKeyboard } from '../../test-utils.js';
import './define-action-edit.js';
import type { LoquixActionEdit } from './loquix-action-edit.js';

describe('loquix-action-edit', () => {
  it('renders trigger button when not editing', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit message-id="m1" content="Hello"></loquix-action-edit>`,
    );
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger).to.exist;
    expect(trigger!.getAttribute('aria-label')).to.equal('Edit message');
    expect(el.editing).to.be.false;
  });

  it('enters editing mode on trigger click', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit message-id="m1" content="Hello"></loquix-action-edit>`,
    );
    const trigger = getShadowPart(el, 'trigger')!;
    const eventPromise = waitForEvent(el, 'loquix-edit-start');
    trigger.click();
    const event = await eventPromise;
    expect(el.editing).to.be.true;
    expect(event.detail.messageId).to.equal('m1');
    expect(event.detail.content).to.equal('Hello');
  });

  it('shows inline editor in inline mode', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit
        mode="inline"
        message-id="m1"
        content="Hello"
        editing
      ></loquix-action-edit>`,
    );
    await el.updateComplete;
    const textarea = getShadowPart(el, 'textarea');
    expect(textarea).to.exist;
    const submitBtn = getShadowPart(el, 'submit-button');
    expect(submitBtn).to.exist;
    const cancelBtn = getShadowPart(el, 'cancel-button');
    expect(cancelBtn).to.exist;
  });

  it('shows editing badge in composer mode', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit
        mode="composer"
        message-id="m1"
        content="Hello"
        editing
      ></loquix-action-edit>`,
    );
    await el.updateComplete;
    const badge = getShadowPart(el, 'editing-badge');
    expect(badge).to.exist;
    expect(badge!.textContent).to.contain('Editing');
  });

  it('dispatches loquix-edit-cancel on cancel', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit
        mode="inline"
        message-id="m1"
        content="Hello"
        editing
      ></loquix-action-edit>`,
    );
    await el.updateComplete;
    const cancelBtn = getShadowPart(el, 'cancel-button')!;
    const eventPromise = waitForEvent(el, 'loquix-edit-cancel');
    cancelBtn.click();
    const event = await eventPromise;
    expect(event.detail.messageId).to.equal('m1');
    expect(el.editing).to.be.false;
  });

  it('startEditing() enters edit mode programmatically', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit message-id="m1" content="Hello"></loquix-action-edit>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-edit-start');
    el.startEditing();
    const event = await eventPromise;
    expect(el.editing).to.be.true;
    expect(event.detail.content).to.equal('Hello');
  });

  it('cancelEditing() exits edit mode programmatically', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit message-id="m1" content="Hello" editing></loquix-action-edit>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-edit-cancel');
    el.cancelEditing();
    const event = await eventPromise;
    expect(el.editing).to.be.false;
    expect(event.detail.messageId).to.equal('m1');
  });

  it('completeEdit() dispatches edit-submit', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit message-id="m1" content="Hello"></loquix-action-edit>`,
    );
    el.startEditing();
    await el.updateComplete;
    const eventPromise = waitForEvent(el, 'loquix-edit-submit');
    el.completeEdit('Updated text');
    const event = await eventPromise;
    expect(event.detail.messageId).to.equal('m1');
    expect(event.detail.oldContent).to.equal('Hello');
    expect(event.detail.newContent).to.equal('Updated text');
    expect(el.editing).to.be.false;
  });

  it('disables trigger when disabled prop is set', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit disabled></loquix-action-edit>`,
    );
    const trigger = getShadowPart(el, 'trigger')!;
    expect(trigger.hasAttribute('disabled')).to.be.true;
  });

  it('custom submit and cancel labels', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit
        mode="inline"
        submit-label="Apply"
        cancel-label="Discard"
        editing
        content="test"
      ></loquix-action-edit>`,
    );
    await el.updateComplete;
    const submitBtn = getShadowPart(el, 'submit-button')!;
    const cancelBtn = getShadowPart(el, 'cancel-button')!;
    expect(submitBtn.textContent).to.contain('Apply');
    expect(cancelBtn.textContent).to.contain('Discard');
  });

  // --- Escape key cancels editing ---

  it('Escape key cancels editing and dispatches loquix-edit-cancel', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit
        mode="inline"
        message-id="m1"
        content="Hello"
        editing
      ></loquix-action-edit>`,
    );
    await el.updateComplete;
    const textarea = getShadowPart(el, 'textarea')!;
    const eventPromise = waitForEvent(el, 'loquix-edit-cancel');
    simulateKeyboard(textarea, 'Escape');
    const event = await eventPromise;
    expect(event.detail.messageId).to.equal('m1');
    expect(el.editing).to.be.false;
  });

  // --- Ctrl+Enter submits ---

  it('Ctrl+Enter submits editing and dispatches loquix-edit-submit', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit mode="inline" message-id="m1" content="Hello"></loquix-action-edit>`,
    );
    el.startEditing();
    await el.updateComplete;

    // Change the textarea content
    const textarea = getShadowPart(el, 'textarea') as HTMLTextAreaElement;
    textarea.value = 'Updated content';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const eventPromise = waitForEvent(el, 'loquix-edit-submit');
    simulateKeyboard(textarea, 'Enter', { ctrlKey: true });
    const event = await eventPromise;
    expect(event.detail.messageId).to.equal('m1');
    expect(event.detail.oldContent).to.equal('Hello');
    expect(event.detail.newContent).to.equal('Updated content');
    expect(el.editing).to.be.false;
  });

  // --- Cancel button click ---

  it('cancel button click dispatches cancel event and exits editing', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit
        mode="inline"
        message-id="m2"
        content="Test"
        editing
      ></loquix-action-edit>`,
    );
    await el.updateComplete;
    const cancelBtn = getShadowPart(el, 'cancel-button')!;
    const eventPromise = waitForEvent(el, 'loquix-edit-cancel');
    cancelBtn.click();
    const event = await eventPromise;
    expect(event.detail.messageId).to.equal('m2');
    expect(el.editing).to.be.false;
  });

  // --- Submit button click ---

  it('submit button click dispatches submit event with new content', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit mode="inline" message-id="m1" content="Hello"></loquix-action-edit>`,
    );
    el.startEditing();
    await el.updateComplete;

    // Change the textarea content
    const textarea = getShadowPart(el, 'textarea') as HTMLTextAreaElement;
    textarea.value = 'New text';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const submitBtn = getShadowPart(el, 'submit-button')!;
    const eventPromise = waitForEvent(el, 'loquix-edit-submit');
    submitBtn.click();
    const event = await eventPromise;
    expect(event.detail.newContent).to.equal('New text');
    expect(event.detail.oldContent).to.equal('Hello');
  });

  // --- Textarea pre-fills with content ---

  it('textarea pre-fills with content property', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit
        mode="inline"
        content="Pre-filled text"
        editing
      ></loquix-action-edit>`,
    );
    await el.updateComplete;
    const textarea = getShadowPart(el, 'textarea') as HTMLTextAreaElement;
    expect(textarea.value).to.equal('Pre-filled text');
  });

  // --- Editing badge shows text ---

  it('editing badge shows "Editing" text in composer mode', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit
        mode="composer"
        message-id="m1"
        content="Hello"
        editing
      ></loquix-action-edit>`,
    );
    await el.updateComplete;
    const badge = getShadowPart(el, 'editing-badge')!;
    expect(badge.textContent).to.contain('Editing');
  });

  // --- Default button labels from localization ---

  it('default submit label comes from localization', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit mode="inline" content="test" editing></loquix-action-edit>`,
    );
    await el.updateComplete;
    const submitBtn = getShadowPart(el, 'submit-button')!;
    expect(submitBtn.textContent!.trim()).to.be.a('string').and.not.be.empty;
  });

  it('default cancel label comes from localization', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit mode="inline" content="test" editing></loquix-action-edit>`,
    );
    await el.updateComplete;
    const cancelBtn = getShadowPart(el, 'cancel-button')!;
    expect(cancelBtn.textContent!.trim()).to.be.a('string').and.not.be.empty;
  });

  // --- Empty content submit prevented ---

  it('submit button is disabled when content is unchanged', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit mode="inline" content="Hello" editing></loquix-action-edit>`,
    );
    await el.updateComplete;
    const submitBtn = getShadowPart(el, 'submit-button')!;
    // Content is same as original, submit should be disabled
    expect(submitBtn.hasAttribute('disabled')).to.be.true;
  });

  it('submit button is disabled when textarea is empty', async () => {
    const el = await fixture<LoquixActionEdit>(
      html`<loquix-action-edit mode="inline" content="Hello"></loquix-action-edit>`,
    );
    el.startEditing();
    await el.updateComplete;

    // Clear the textarea
    const textarea = getShadowPart(el, 'textarea') as HTMLTextAreaElement;
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const submitBtn = getShadowPart(el, 'submit-button')!;
    expect(submitBtn.hasAttribute('disabled')).to.be.true;
  });

  // --- Trigger label from localization ---

  it('trigger button has aria-label from localization', async () => {
    const el = await fixture<LoquixActionEdit>(html`<loquix-action-edit></loquix-action-edit>`);
    const trigger = getShadowPart(el, 'trigger')!;
    expect(trigger.getAttribute('aria-label')).to.equal('Edit message');
  });
});
