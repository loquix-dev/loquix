import { expect, fixture, html } from '@open-wc/testing';
import { setLocale, resetLocale } from '../../i18n/index.js';
import { getShadowPart, waitForEvent } from '../../test-utils.js';
import './define-feedback-form.js';
import type { LoquixFeedbackForm } from './loquix-feedback-form.js';
import type { LoquixActionFeedback } from './loquix-action-feedback.js';
import type { LoquixFeedbackSubmitDetail } from '../../events/index.js';

function getInnerButtons(el: LoquixFeedbackForm): {
  pos: LoquixActionFeedback;
  neg: LoquixActionFeedback;
} {
  const pos = el.shadowRoot!.querySelector(
    'loquix-action-feedback[sentiment="positive"]',
  ) as LoquixActionFeedback;
  const neg = el.shadowRoot!.querySelector(
    'loquix-action-feedback[sentiment="negative"]',
  ) as LoquixActionFeedback;
  return { pos, neg };
}

function clickInnerButton(child: LoquixActionFeedback): void {
  const btn = child.shadowRoot!.querySelector('button') as HTMLButtonElement;
  btn.click();
}

describe('loquix-feedback-form', () => {
  afterEach(() => resetLocale());

  it('renders idle with two action-feedback buttons and no form', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form></loquix-feedback-form>`,
    );
    const { pos, neg } = getInnerButtons(el);
    expect(pos).to.exist;
    expect(neg).to.exist;
    expect(pos.active).to.be.false;
    expect(neg.active).to.be.false;
    expect(getShadowPart(el, 'form')).to.be.null;
  });

  it('group has aria-label from i18n', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form></loquix-feedback-form>`,
    );
    const buttons = getShadowPart(el, 'buttons')!;
    expect(buttons.getAttribute('role')).to.equal('group');
    expect(buttons.getAttribute('aria-label')).to.equal('Rate this response');
  });

  it('clicking positive sets value to positive and opens form', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form></loquix-feedback-form>`,
    );
    const { pos } = getInnerButtons(el);
    clickInnerButton(pos);
    await el.updateComplete;
    expect(el.value).to.equal('positive');
    const form = getShadowPart(el, 'form');
    expect(form).to.exist;
  });

  it('drives child active state from parent value (parent-driven, no leak)', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form></loquix-feedback-form>`,
    );
    const { pos, neg } = getInnerButtons(el);

    clickInnerButton(pos);
    await el.updateComplete;
    expect(pos.active).to.be.true;
    expect(neg.active).to.be.false;

    clickInnerButton(neg);
    await el.updateComplete;
    expect(el.value).to.equal('negative');
    expect(pos.active).to.be.false;
    expect(neg.active).to.be.true;
  });

  it('clicking the same sentiment twice deselects (value=null, both children inactive)', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form></loquix-feedback-form>`,
    );
    const { pos } = getInnerButtons(el);
    clickInnerButton(pos);
    await el.updateComplete;
    expect(el.value).to.equal('positive');

    clickInnerButton(pos);
    await el.updateComplete;
    expect(el.value).to.be.null;
    expect(pos.active).to.be.false;
    expect(getShadowPart(el, 'form')).to.be.null;
  });

  it('inner loquix-feedback does not leak past the form', async () => {
    const container = await fixture<HTMLDivElement>(
      html`<div><loquix-feedback-form></loquix-feedback-form></div>`,
    );
    const el = container.querySelector('loquix-feedback-form') as LoquixFeedbackForm;
    const { pos } = getInnerButtons(el);

    let leaked = false;
    container.addEventListener('loquix-feedback', () => {
      leaked = true;
    });

    clickInnerButton(pos);
    await new Promise(r => setTimeout(r, 50));
    expect(leaked).to.be.false;
  });

  it('shows positive reason chips for positive sentiment', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form value="positive"></loquix-feedback-form>`,
    );
    await el.updateComplete;
    const chips = el.shadowRoot!.querySelectorAll('[part="chip"]');
    const labels = Array.from(chips).map(c => c.textContent?.trim());
    expect(labels).to.deep.equal(['Accurate', 'Well-written', 'Helpful', 'Other']);
  });

  it('shows negative reason chips for negative sentiment', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form value="negative"></loquix-feedback-form>`,
    );
    await el.updateComplete;
    const chips = el.shadowRoot!.querySelectorAll('[part="chip"]');
    const labels = Array.from(chips).map(c => c.textContent?.trim());
    expect(labels).to.deep.equal(['Inaccurate', 'Off-topic', 'Unsafe', 'Other']);
  });

  it('chips use role=radio + aria-checked semantics', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form value="positive"></loquix-feedback-form>`,
    );
    const reasons = getShadowPart(el, 'reasons')!;
    expect(reasons.getAttribute('role')).to.equal('radiogroup');
    expect(reasons.getAttribute('aria-label')).to.equal('Reason');
    const chips = el.shadowRoot!.querySelectorAll('[part="chip"]');
    chips.forEach(c => {
      expect(c.getAttribute('role')).to.equal('radio');
      expect(c.getAttribute('aria-checked')).to.equal('false');
    });

    (chips[0] as HTMLButtonElement).click();
    await el.updateComplete;
    expect(chips[0].getAttribute('aria-checked')).to.equal('true');
  });

  it('clicking the same chip twice deselects it', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form value="positive"></loquix-feedback-form>`,
    );
    const chips = el.shadowRoot!.querySelectorAll('[part="chip"]');
    (chips[0] as HTMLButtonElement).click();
    await el.updateComplete;
    expect(chips[0].getAttribute('aria-checked')).to.equal('true');
    (chips[0] as HTMLButtonElement).click();
    await el.updateComplete;
    expect(chips[0].getAttribute('aria-checked')).to.equal('false');
  });

  it('Send dispatches loquix-feedback-submit with stable reason ID and comment', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form value="negative"></loquix-feedback-form>`,
    );
    await el.updateComplete;
    const chips = el.shadowRoot!.querySelectorAll('[part="chip"]');
    (chips[0] as HTMLButtonElement).click(); // 'inaccurate'
    const textarea = getShadowPart(el, 'textarea')! as HTMLTextAreaElement;
    textarea.value = 'wrong figure';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const submit = getShadowPart(el, 'submit')! as HTMLButtonElement;
    const promise = waitForEvent<LoquixFeedbackSubmitDetail>(el, 'loquix-feedback-submit');
    submit.click();
    const ev = await promise;

    expect(ev.detail.sentiment).to.equal('negative');
    expect(ev.detail.reason).to.equal('inaccurate');
    expect(ev.detail.comment).to.equal('wrong figure');
  });

  it('Send omits empty comment from detail', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form value="positive"></loquix-feedback-form>`,
    );
    await el.updateComplete;
    const submit = getShadowPart(el, 'submit')! as HTMLButtonElement;
    const promise = waitForEvent<LoquixFeedbackSubmitDetail>(el, 'loquix-feedback-submit');
    submit.click();
    const ev = await promise;
    expect(ev.detail.sentiment).to.equal('positive');
    expect(ev.detail.comment).to.be.undefined;
    expect(ev.detail.reason).to.be.undefined;
  });

  it('require-comment-on-down disables Send until comment is non-empty', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form value="negative" require-comment-on-down></loquix-feedback-form>`,
    );
    await el.updateComplete;
    const submit = getShadowPart(el, 'submit')! as HTMLButtonElement;
    expect(submit.disabled).to.be.true;

    const textarea = getShadowPart(el, 'textarea')! as HTMLTextAreaElement;
    textarea.value = 'something';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(submit.disabled).to.be.false;
  });

  it('require-comment-on-down does not affect positive sentiment', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form value="positive" require-comment-on-down></loquix-feedback-form>`,
    );
    await el.updateComplete;
    const submit = getShadowPart(el, 'submit')! as HTMLButtonElement;
    expect(submit.disabled).to.be.false;
  });

  it('after submit shows thanks message', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form value="positive"></loquix-feedback-form>`,
    );
    await el.updateComplete;
    const submit = getShadowPart(el, 'submit')! as HTMLButtonElement;
    submit.click();
    await el.updateComplete;
    expect(getShadowPart(el, 'thanks')!.textContent?.trim()).to.equal(
      'Thanks — your feedback was sent.',
    );
    expect(getShadowPart(el, 'form')).to.be.null;
  });

  it('Cancel resets all state', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form value="negative"></loquix-feedback-form>`,
    );
    await el.updateComplete;
    const chips = el.shadowRoot!.querySelectorAll('[part="chip"]');
    (chips[0] as HTMLButtonElement).click();
    await el.updateComplete;

    const cancel = getShadowPart(el, 'cancel')! as HTMLButtonElement;
    cancel.click();
    await el.updateComplete;
    expect(el.value).to.be.null;
    expect(getShadowPart(el, 'form')).to.be.null;
  });

  it('allow-reason=false keeps form closed even after sentiment is picked', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form .allowReason=${false}></loquix-feedback-form>`,
    );
    const { pos } = getInnerButtons(el);
    clickInnerButton(pos);
    await el.updateComplete;
    expect(el.value).to.equal('positive');
    expect(getShadowPart(el, 'form')).to.be.null;
  });

  it('locale change updates visible chip labels', async () => {
    const el = await fixture<LoquixFeedbackForm>(
      html`<loquix-feedback-form value="positive"></loquix-feedback-form>`,
    );
    await el.updateComplete;
    setLocale({ 'feedbackForm.reasonAccurate': 'Précis' });
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    const firstChip = el.shadowRoot!.querySelector('[part="chip"]')!;
    expect(firstChip.textContent?.trim()).to.equal('Précis');
  });
});
