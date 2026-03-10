import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart, getShadowParts } from '../../test-utils.js';
import './define-model-selector.js';
import type { LoquixModelSelector } from './loquix-model-selector.js';
import type { ModelOption } from '../../types/index.js';

const mockModels: ModelOption[] = [
  { value: 'gpt-4o', label: 'GPT-4o', tier: 'pro', cost: '$0.02/1K' },
  { value: 'claude-3', label: 'Claude 3', tier: 'pro', cost: '$0.015/1K' },
  { value: 'gpt-3.5', label: 'GPT-3.5', tier: 'standard' },
];

describe('loquix-model-selector', () => {
  it('renders trigger with placeholder', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels}></loquix-model-selector>`,
    );
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger).to.exist;
    expect(trigger!.textContent).to.contain('Select model...');
    expect(trigger!.getAttribute('aria-haspopup')).to.equal('listbox');
  });

  it('shows selected model label in trigger', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels} value="gpt-4o"></loquix-model-selector>`,
    );
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger!.textContent).to.contain('GPT-4o');
  });

  it('opens panel on trigger click', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels}></loquix-model-selector>`,
    );
    expect(el.open).to.be.false;
    const trigger = getShadowPart(el, 'trigger')!;
    trigger.click();
    await el.updateComplete;
    expect(el.open).to.be.true;
    const panel = getShadowPart(el, 'panel');
    expect(panel).to.exist;
    expect(panel!.hidden).to.be.false;
  });

  it('renders options in panel', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels} open></loquix-model-selector>`,
    );
    await el.updateComplete;
    const options = getShadowParts(el, 'option');
    expect(options).to.have.lengthOf(3);
    expect(options[0].textContent).to.contain('GPT-4o');
    expect(options[1].textContent).to.contain('Claude 3');
  });

  it('dispatches loquix-model-change on selection', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels} value="gpt-4o"></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;
    const options = getShadowParts(el, 'option');
    const eventPromise = waitForEvent(el, 'loquix-model-change');
    options[1].click();
    const event = await eventPromise;
    expect(event.detail.from).to.equal('gpt-4o');
    expect(event.detail.to).to.equal('claude-3');
    expect(el.open).to.be.false;
  });

  it('does not open when disabled', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels} disabled></loquix-model-selector>`,
    );
    el.show();
    expect(el.open).to.be.false;
  });

  it('closes on hide()', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels}></loquix-model-selector>`,
    );
    el.show();
    expect(el.open).to.be.true;
    el.hide();
    expect(el.open).to.be.false;
  });

  it('shows search input when searchable', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels} searchable open></loquix-model-selector>`,
    );
    await el.updateComplete;
    const search = getShadowPart(el, 'search');
    expect(search).to.exist;
  });

  it('reflects value attribute', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector value="gpt-4o"></loquix-model-selector>`,
    );
    expect(el.getAttribute('value')).to.equal('gpt-4o');
  });

  it('toggle() switches open state', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels}></loquix-model-selector>`,
    );
    el.toggle();
    expect(el.open).to.be.true;
    el.toggle();
    expect(el.open).to.be.false;
  });

  // --- Search filtering ---

  it('search filtering: type text filters models to matching ones', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels} searchable></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;

    const searchInput = el.shadowRoot!.querySelector('.search__input') as HTMLInputElement;
    searchInput.value = 'Claude';
    searchInput.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const options = getShadowParts(el, 'option');
    expect(options).to.have.lengthOf(1);
    expect(options[0].textContent).to.contain('Claude 3');
  });

  it('search filtering: no results shows empty text', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels} searchable></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;

    const searchInput = el.shadowRoot!.querySelector('.search__input') as HTMLInputElement;
    searchInput.value = 'nonexistent';
    searchInput.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const options = getShadowParts(el, 'option');
    expect(options).to.have.lengthOf(0);
    const empty = el.shadowRoot!.querySelector('.empty');
    expect(empty).to.exist;
  });

  // --- Grouped property ---

  it('grouped property renders group headers', async () => {
    const groupedModels: ModelOption[] = [
      { value: 'gpt-4o', label: 'GPT-4o', group: 'OpenAI', tier: 'pro' },
      { value: 'gpt-3.5', label: 'GPT-3.5', group: 'OpenAI', tier: 'standard' },
      { value: 'claude-3', label: 'Claude 3', group: 'Anthropic', tier: 'pro' },
    ];
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${groupedModels} grouped></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;

    const headers = el.shadowRoot!.querySelectorAll('.group-header');
    expect(headers.length).to.equal(2);
    expect(headers[0].textContent).to.contain('OpenAI');
    expect(headers[1].textContent).to.contain('Anthropic');
  });

  // --- showCost renders cost info ---

  it('showCost renders cost info on options', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels} show-cost></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;

    const options = getShadowParts(el, 'option');
    // First model has cost
    const costEl = options[0].querySelector('.option__cost');
    expect(costEl).to.exist;
    expect(costEl!.textContent).to.contain('$0.02/1K');
  });

  // --- showCapabilities renders capability badges ---

  it('showCapabilities renders capability badges', async () => {
    const modelsWithCaps: ModelOption[] = [
      { value: 'gpt-4o', label: 'GPT-4o', capabilities: ['vision', 'code'] },
    ];
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector
        .models=${modelsWithCaps}
        show-capabilities
      ></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;

    const options = getShadowParts(el, 'option');
    const caps = options[0].querySelectorAll('.option__capability');
    expect(caps.length).to.equal(2);
    expect(caps[0].textContent).to.contain('vision');
    expect(caps[1].textContent).to.contain('code');
  });

  // --- Keyboard ArrowDown/Up navigates options ---

  it('ArrowDown navigates to next option', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels}></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;

    // Simulate ArrowDown
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await el.updateComplete;

    const focused = el.shadowRoot!.querySelector('.option--focused');
    expect(focused).to.exist;
    expect(focused!.textContent).to.contain('GPT-4o');
  });

  it('ArrowUp navigates to previous option', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels}></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;

    // ArrowUp from -1 goes to last
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await el.updateComplete;

    const focused = el.shadowRoot!.querySelector('.option--focused');
    expect(focused).to.exist;
    expect(focused!.textContent).to.contain('GPT-3.5');
  });

  // --- Keyboard Enter selects focused option ---

  it('Enter key selects focused option', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels}></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;

    // Navigate to first option
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await el.updateComplete;

    const eventPromise = waitForEvent(el, 'loquix-model-change');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const event = await eventPromise;
    expect(event.detail.to).to.equal('gpt-4o');
    expect(el.open).to.be.false;
  });

  // --- Keyboard Escape closes dropdown ---

  it('Escape key closes dropdown', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels}></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(el.open).to.be.false;
  });

  // --- Empty state text from localization ---

  it('empty state text from localization when no models match search', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels} searchable></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;

    const searchInput = el.shadowRoot!.querySelector('.search__input') as HTMLInputElement;
    searchInput.value = 'zzzzz';
    searchInput.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const empty = el.shadowRoot!.querySelector('.empty');
    expect(empty).to.exist;
    expect(empty!.textContent!.trim()).to.be.a('string').and.not.be.empty;
  });

  // --- Search placeholder from localization ---

  it('search input has placeholder from localization', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels} searchable></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;

    const searchInput = el.shadowRoot!.querySelector('.search__input') as HTMLInputElement;
    expect(searchInput.getAttribute('placeholder')).to.be.a('string').and.not.be.empty;
  });

  // --- Tier badge rendering ---

  it('renders tier badges for models with tier', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels}></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;

    const options = getShadowParts(el, 'option');
    const tier = options[0].querySelector('.option__tier');
    expect(tier).to.exist;
    expect(tier!.textContent).to.contain('pro');
  });

  // --- Disabled model cant be selected ---

  it('disabled model cannot be selected', async () => {
    const modelsWithDisabled: ModelOption[] = [
      { value: 'enabled', label: 'Enabled' },
      { value: 'disabled', label: 'Disabled', disabled: true },
    ];
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${modelsWithDisabled}></loquix-model-selector>`,
    );
    el.show();
    await el.updateComplete;

    let fired = false;
    el.addEventListener('loquix-model-change', () => {
      fired = true;
    });
    const options = getShadowParts(el, 'option');
    options[1].click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  // --- Reconnect lifecycle (Codex R1 finding 1) ---

  it('reattaches document listeners on reconnect when open=true', async () => {
    const el = await fixture<LoquixModelSelector>(
      html`<loquix-model-selector .models=${mockModels}></loquix-model-selector>`,
    );

    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;

    // Disconnect and reconnect while open
    const parent = el.parentElement!;
    parent.removeChild(el);
    parent.appendChild(el);
    await el.updateComplete;

    // Outside click should close — proves click listener is reattached
    document.body.click();
    await new Promise(r => setTimeout(r, 50));
    expect(el.open).to.be.false;

    // Re-open and verify keydown listener also works
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await el.updateComplete;
    expect(el.open).to.be.false;
  });
});
