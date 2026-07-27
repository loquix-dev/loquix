import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart, simulateKeyboard, waitForEvent } from '../../test-utils.js';
import './define-search-input.js';
import type { LoquixSearchInput } from './loquix-search-input.js';
import type {
  LoquixChangeDetail,
  LoquixSearchAskDetail,
  LoquixSearchSubmitDetail,
} from '../../events/index.js';

describe('loquix-search-input', () => {
  it('renders the smart placeholder by default', async () => {
    const el = await fixture<LoquixSearchInput>(html`<loquix-search-input></loquix-search-input>`);
    const input = getShadowPart(el, 'input') as HTMLInputElement;
    expect(input.placeholder).to.equal('Search or ask anything...');
  });

  it('uses the plain placeholder in plain mode', async () => {
    const el = await fixture<LoquixSearchInput>(
      html`<loquix-search-input mode="plain"></loquix-search-input>`,
    );
    const input = getShadowPart(el, 'input') as HTMLInputElement;
    expect(input.placeholder).to.equal('Search...');
  });

  it('dispatches loquix-change when the input changes', async () => {
    const el = await fixture<LoquixSearchInput>(html`<loquix-search-input></loquix-search-input>`);
    const input = getShadowPart(el, 'input') as HTMLInputElement;
    const eventPromise = waitForEvent<LoquixChangeDetail>(el, 'loquix-change');
    input.value = 'refund';
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    const event = await eventPromise;
    expect(event.detail.value).to.equal('refund');
    expect(el.value).to.equal('refund');
  });

  it('dispatches plain search on Enter in auto mode', async () => {
    const el = await fixture<LoquixSearchInput>(
      html`<loquix-search-input value="refund"></loquix-search-input>`,
    );
    const input = getShadowPart(el, 'input') as HTMLInputElement;
    const eventPromise = waitForEvent<LoquixSearchSubmitDetail>(el, 'loquix-search-submit');
    simulateKeyboard(input, 'Enter');
    const event = await eventPromise;
    expect(event.detail).to.deep.equal({ query: 'refund', mode: 'plain' });
  });

  it('dispatches smart search on Cmd+Enter in auto mode', async () => {
    const el = await fixture<LoquixSearchInput>(
      html`<loquix-search-input value="what is our refund policy"></loquix-search-input>`,
    );
    const input = getShadowPart(el, 'input') as HTMLInputElement;
    const eventPromise = waitForEvent<LoquixSearchAskDetail>(el, 'loquix-search-ask');
    simulateKeyboard(input, 'Enter', { metaKey: true });
    const event = await eventPromise;
    expect(event.detail).to.deep.equal({ query: 'what is our refund policy', mode: 'smart' });
  });

  it('dispatches smart search on Enter in smart mode', async () => {
    const el = await fixture<LoquixSearchInput>(
      html`<loquix-search-input mode="smart" value="refund policy"></loquix-search-input>`,
    );
    const input = getShadowPart(el, 'input') as HTMLInputElement;
    const eventPromise = waitForEvent<LoquixSearchAskDetail>(el, 'loquix-search-ask');
    simulateKeyboard(input, 'Enter');
    const event = await eventPromise;
    expect(event.detail.query).to.equal('refund policy');
  });

  it('shows Ask AI affordance in auto mode when query looks conversational', async () => {
    const el = await fixture<LoquixSearchInput>(
      html`<loquix-search-input value="What is our refund policy"></loquix-search-input>`,
    );
    await el.updateComplete;
    const ask = getShadowPart(el, 'ask-button');
    expect(ask).to.exist;
    expect(ask!.textContent?.trim()).to.contain('Ask AI');
    expect(ask!.querySelector('svg')).to.equal(null);
  });

  it('does not show Ask AI affordance in plain mode even when forced', async () => {
    const el = await fixture<LoquixSearchInput>(
      html`<loquix-search-input
        mode="plain"
        show-ask-affordance
        value="What is our refund policy"
      ></loquix-search-input>`,
    );
    await el.updateComplete;
    const ask = getShadowPart(el, 'ask-button');
    expect(ask === null, 'ask button must not render in plain mode').to.be.true;
  });

  it('hides inline kbd when Ask AI affordance is visible by default', async () => {
    const el = await fixture<LoquixSearchInput>(
      html`<loquix-search-input
        value="What is our refund policy"
        kbd="Cmd Enter"
      ></loquix-search-input>`,
    );
    await el.updateComplete;
    expect(getShadowPart(el, 'ask-button')).to.exist;
    expect(getShadowPart(el, 'kbd')).to.equal(null);
  });

  it('clears value with the custom clear button', async () => {
    const el = await fixture<LoquixSearchInput>(
      html`<loquix-search-input value="refund policy"></loquix-search-input>`,
    );
    await el.updateComplete;
    const clear = getShadowPart(el, 'clear-button') as HTMLButtonElement;
    const eventPromise = waitForEvent<LoquixChangeDetail>(el, 'loquix-change');
    clear.click();
    const event = await eventPromise;
    expect(event.detail.value).to.equal('');
    expect(el.value).to.equal('');
    await el.updateComplete;
    expect(clear.classList.contains('is-hidden')).to.be.true;
    expect(clear.disabled).to.be.true;
    expect(clear.getAttribute('aria-hidden')).to.equal('true');
  });

  it('reserves clear button space while empty', async () => {
    const el = await fixture<LoquixSearchInput>(html`<loquix-search-input></loquix-search-input>`);
    await el.updateComplete;
    const clear = getShadowPart(el, 'clear-button') as HTMLButtonElement;
    expect(clear).to.exist;
    expect(clear.classList.contains('is-hidden')).to.be.true;
    expect(clear.disabled).to.be.true;
    expect(clear.getAttribute('aria-hidden')).to.equal('true');
  });

  it('can disable the clear button affordance', async () => {
    const el = await fixture<LoquixSearchInput>(
      html`<loquix-search-input value="refund" .clearable=${false}></loquix-search-input>`,
    );
    await el.updateComplete;
    expect(getShadowPart(el, 'clear-button')).to.equal(null);
  });

  it('renders the loading spinner in the prefix slot', async () => {
    const el = await fixture<LoquixSearchInput>(
      html`<loquix-search-input
        mode="smart"
        state="searching"
        value="refund"
        kbd="Cmd K"
      ></loquix-search-input>`,
    );
    await el.updateComplete;
    const prefix = getShadowPart(el, 'prefix') as HTMLElement;
    const spinner = prefix.querySelector('.spinner') as HTMLElement;
    expect(spinner).to.exist;
    expect(el.shadowRoot!.querySelector('.sparkle')).to.equal(null);
    expect(getComputedStyle(spinner).flexShrink).to.equal('0');
    expect(getComputedStyle(spinner).boxSizing).to.equal('border-box');
  });

  it('can keep inline kbd when Ask AI affordance is visible', async () => {
    const el = await fixture<LoquixSearchInput>(
      html`<loquix-search-input
        value="What is our refund policy"
        kbd="Cmd Enter"
        .hideKbdWhenAsk=${false}
      ></loquix-search-input>`,
    );
    await el.updateComplete;
    expect(getShadowPart(el, 'ask-button')).to.exist;
    expect(getShadowPart(el, 'kbd')!.textContent?.trim()).to.equal('Cmd Enter');
  });

  it('does not submit empty queries', async () => {
    const el = await fixture<LoquixSearchInput>(
      html`<loquix-search-input value="   "></loquix-search-input>`,
    );
    let fired = false;
    el.addEventListener('loquix-search-submit', () => {
      fired = true;
    });
    const input = getShadowPart(el, 'input') as HTMLInputElement;
    simulateKeyboard(input, 'Enter');
    await new Promise(r => setTimeout(r, 30));
    expect(fired).to.be.false;
  });
});
