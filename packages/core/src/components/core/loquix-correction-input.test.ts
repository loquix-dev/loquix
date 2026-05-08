import { expect, fixture, html } from '@open-wc/testing';
import { setLocale, resetLocale } from '../../i18n/index.js';
import { getShadowPart, waitForEvent } from '../../test-utils.js';
import './define-correction-input.js';
import type { LoquixCorrectionInput } from './loquix-correction-input.js';
import type { LoquixCorrectionSubmitDetail } from '../../events/index.js';

describe('loquix-correction-input', () => {
  afterEach(() => resetLocale());

  it('renders with empty defaults', async () => {
    const el = await fixture<LoquixCorrectionInput>(
      html`<loquix-correction-input></loquix-correction-input>`,
    );
    expect(el.original).to.equal('');
    expect(el.value).to.equal('');
    expect(el.reason).to.equal('');
    expect(el.reasonRequired).to.be.false;
    const textarea = getShadowPart(el, 'textarea')! as HTMLTextAreaElement;
    expect(textarea).to.exist;
  });

  it('hides original block when no original is set', async () => {
    const el = await fixture<LoquixCorrectionInput>(
      html`<loquix-correction-input></loquix-correction-input>`,
    );
    expect(getShadowPart(el, 'original')).to.be.null;
  });

  it('shows original block with text when set', async () => {
    const el = await fixture<LoquixCorrectionInput>(
      html`<loquix-correction-input
        original="The Eiffel Tower is 320 meters tall."
      ></loquix-correction-input>`,
    );
    const original = getShadowPart(el, 'original')!;
    expect(original.textContent?.trim()).to.equal('The Eiffel Tower is 320 meters tall.');
  });

  it('typing into the correction textarea updates value', async () => {
    const el = await fixture<LoquixCorrectionInput>(
      html`<loquix-correction-input></loquix-correction-input>`,
    );
    const textarea = getShadowPart(el, 'textarea')! as HTMLTextAreaElement;
    textarea.value = '330 meters';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(el.value).to.equal('330 meters');
  });

  it('Submit is disabled until correction is non-empty', async () => {
    const el = await fixture<LoquixCorrectionInput>(
      html`<loquix-correction-input></loquix-correction-input>`,
    );
    const submit = getShadowPart(el, 'submit')! as HTMLButtonElement;
    expect(submit.disabled).to.be.true;

    const textarea = getShadowPart(el, 'textarea')! as HTMLTextAreaElement;
    textarea.value = 'fixed';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(submit.disabled).to.be.false;
  });

  it('Submit is disabled while reason is empty when reason-required', async () => {
    const el = await fixture<LoquixCorrectionInput>(
      html`<loquix-correction-input value="x" reason-required></loquix-correction-input>`,
    );
    const submit = getShadowPart(el, 'submit')! as HTMLButtonElement;
    expect(submit.disabled).to.be.true;

    const input = getShadowPart(el, 'input')! as HTMLInputElement;
    input.value = 'cited source';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(submit.disabled).to.be.false;
  });

  it('reason-required marks input aria-required and adds visible asterisk', async () => {
    const el = await fixture<LoquixCorrectionInput>(
      html`<loquix-correction-input reason-required></loquix-correction-input>`,
    );
    const input = getShadowPart(el, 'input')! as HTMLInputElement;
    expect(input.getAttribute('aria-required')).to.equal('true');
    const mark = el.shadowRoot!.querySelector('.lbl__req');
    expect(mark).to.exist;
  });

  it('Submit fires loquix-correction-submit with full detail', async () => {
    const el = await fixture<LoquixCorrectionInput>(
      html`<loquix-correction-input
        original="320 m"
        value="330 m"
        reason="incl. antennas"
      ></loquix-correction-input>`,
    );
    await el.updateComplete;
    const submit = getShadowPart(el, 'submit')! as HTMLButtonElement;
    const promise = waitForEvent<LoquixCorrectionSubmitDetail>(el, 'loquix-correction-submit');
    submit.click();
    const ev = await promise;
    expect(ev.detail.correction).to.equal('330 m');
    expect(ev.detail.reason).to.equal('incl. antennas');
    expect(ev.detail.original).to.equal('320 m');
  });

  it('Submit omits reason and original when empty', async () => {
    const el = await fixture<LoquixCorrectionInput>(
      html`<loquix-correction-input value="x"></loquix-correction-input>`,
    );
    await el.updateComplete;
    const submit = getShadowPart(el, 'submit')! as HTMLButtonElement;
    const promise = waitForEvent<LoquixCorrectionSubmitDetail>(el, 'loquix-correction-submit');
    submit.click();
    const ev = await promise;
    expect(ev.detail.correction).to.equal('x');
    expect(ev.detail.reason).to.be.undefined;
    expect(ev.detail.original).to.be.undefined;
  });

  it('Cancel fires loquix-correction-cancel', async () => {
    const el = await fixture<LoquixCorrectionInput>(
      html`<loquix-correction-input></loquix-correction-input>`,
    );
    const cancel = getShadowPart(el, 'cancel')! as HTMLButtonElement;
    const promise = waitForEvent(el, 'loquix-correction-cancel');
    cancel.click();
    const ev = await promise;
    expect(ev).to.exist;
  });

  it('original text is rendered as a text node (no HTML injection)', async () => {
    const malicious = "<script>alert('x')</script>";
    const el = await fixture<LoquixCorrectionInput>(
      html`<loquix-correction-input .original=${malicious}></loquix-correction-input>`,
    );
    const original = getShadowPart(el, 'original')!;
    expect(original.querySelector('script')).to.be.null;
    expect(original.textContent?.trim()).to.equal(malicious);
  });

  it('locale change updates labels', async () => {
    const el = await fixture<LoquixCorrectionInput>(
      html`<loquix-correction-input original="x"></loquix-correction-input>`,
    );
    setLocale({
      'correctionInput.submitLabel': 'Envoyer correction',
    });
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    const submit = getShadowPart(el, 'submit')! as HTMLButtonElement;
    expect(submit.textContent?.trim()).to.equal('Envoyer correction');
  });
});
