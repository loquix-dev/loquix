import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart, getShadowParts, simulateKeyboard } from '../../test-utils.js';
import './define-filter-bar.js';
import type { LoquixFilterBar } from './loquix-filter-bar.js';
import type { FilterOption } from '../../types/index.js';

const mockFilters: FilterOption[] = [
  { id: 'code', label: 'Code', icon: '💻' },
  { id: 'docs', label: 'Documentation' },
  { id: 'tests', label: 'Tests', icon: '🧪' },
];

describe('loquix-filter-bar', () => {
  it('renders filter chips for each option', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters}></loquix-filter-bar>`,
    );
    const bar = getShadowPart(el, 'bar');
    expect(bar).to.exist;
    expect(bar!.getAttribute('role')).to.equal('toolbar');
    const chips = getShadowParts(el, 'filter');
    expect(chips).to.have.lengthOf(3);
    expect(chips[0].textContent).to.contain('Code');
  });

  it('toggles filter on click and dispatches event', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters}></loquix-filter-bar>`,
    );
    const chips = getShadowParts(el, 'filter');
    const eventPromise = waitForEvent(el, 'loquix-filter-change');
    chips[0].click();
    const event = await eventPromise;
    expect(event.detail.values).to.include('code');
  });

  it('deactivates filter on second click', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters} .values=${['code']}></loquix-filter-bar>`,
    );
    const chips = getShadowParts(el, 'filter');
    const eventPromise = waitForEvent(el, 'loquix-filter-change');
    chips[0].click();
    const event = await eventPromise;
    expect(event.detail.values).to.not.include('code');
  });

  it('shows active state for selected filters', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar
        .filters=${mockFilters}
        .values=${['code', 'tests']}
      ></loquix-filter-bar>`,
    );
    const chips = getShadowParts(el, 'filter');
    expect(chips[0].getAttribute('aria-checked')).to.equal('true');
    expect(chips[1].getAttribute('aria-checked')).to.equal('false');
    expect(chips[2].getAttribute('aria-checked')).to.equal('true');
  });

  it('shows negative prompt input when enabled', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters} show-negative-prompt></loquix-filter-bar>`,
    );
    const negPrompt = getShadowPart(el, 'negative-prompt');
    expect(negPrompt).to.exist;
    const input = negPrompt!.querySelector('input');
    expect(input).to.exist;
  });

  it('hides negative prompt by default', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters}></loquix-filter-bar>`,
    );
    const negPrompt = getShadowPart(el, 'negative-prompt');
    expect(negPrompt).to.not.exist;
  });

  it('does not dispatch when disabled', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters} disabled></loquix-filter-bar>`,
    );
    let fired = false;
    el.addEventListener('loquix-filter-change', () => {
      fired = true;
    });
    const chips = getShadowParts(el, 'filter');
    chips[0].click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('filter chips have checkbox role', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters}></loquix-filter-bar>`,
    );
    const chips = getShadowParts(el, 'filter');
    expect(chips[0].getAttribute('role')).to.equal('checkbox');
  });

  it('renders icons when provided', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters}></loquix-filter-bar>`,
    );
    const chips = getShadowParts(el, 'filter');
    expect(chips[0].textContent).to.contain('💻');
    // Second filter has no icon
    expect(chips[1].textContent).to.not.contain('💻');
  });

  it('renders empty when no filters', async () => {
    const el = await fixture<LoquixFilterBar>(html`<loquix-filter-bar></loquix-filter-bar>`);
    const chips = getShadowParts(el, 'filter');
    expect(chips).to.have.lengthOf(0);
  });

  // --- Keyboard navigation ---

  it('ArrowRight moves focus to next chip', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters}></loquix-filter-bar>`,
    );
    const chips = getShadowParts(el, 'filter');
    chips[0].focus();
    simulateKeyboard(chips[0], 'ArrowRight');
    expect(el.shadowRoot!.activeElement).to.equal(chips[1]);
  });

  it('ArrowLeft moves focus to previous chip', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters}></loquix-filter-bar>`,
    );
    const chips = getShadowParts(el, 'filter');
    chips[1].focus();
    simulateKeyboard(chips[1], 'ArrowLeft');
    expect(el.shadowRoot!.activeElement).to.equal(chips[0]);
  });

  it('ArrowRight wraps from last to first chip', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters}></loquix-filter-bar>`,
    );
    const chips = getShadowParts(el, 'filter');
    chips[2].focus();
    simulateKeyboard(chips[2], 'ArrowRight');
    expect(el.shadowRoot!.activeElement).to.equal(chips[0]);
  });

  it('ArrowLeft wraps from first to last chip', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters}></loquix-filter-bar>`,
    );
    const chips = getShadowParts(el, 'filter');
    chips[0].focus();
    simulateKeyboard(chips[0], 'ArrowLeft');
    expect(el.shadowRoot!.activeElement).to.equal(chips[2]);
  });

  // --- Negative prompt ---

  it('negative prompt input dispatches loquix-filter-change event', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters} show-negative-prompt></loquix-filter-bar>`,
    );
    const negPrompt = getShadowPart(el, 'negative-prompt')!;
    const input = negPrompt.querySelector('input')!;
    const eventPromise = waitForEvent(el, 'loquix-filter-change');
    input.value = 'exclude this';
    input.dispatchEvent(new Event('input'));
    // Wait for debounce (200ms)
    const event = await eventPromise;
    expect(event.detail.negativePrompt).to.equal('exclude this');
  });

  // --- Disabled state ---

  it('disabled state sets disabled attribute on filter buttons', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters} disabled></loquix-filter-bar>`,
    );
    const chips = getShadowParts(el, 'filter');
    for (const chip of chips) {
      expect(chip.hasAttribute('disabled')).to.be.true;
    }
  });

  it('disabled state prevents negative prompt input', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar
        .filters=${mockFilters}
        show-negative-prompt
        disabled
      ></loquix-filter-bar>`,
    );
    const negPrompt = getShadowPart(el, 'negative-prompt')!;
    const input = negPrompt.querySelector('input')!;
    expect(input.hasAttribute('disabled')).to.be.true;
  });

  // --- Filter groups ---

  it('renders group headers and dividers for multi-group filters', async () => {
    const groupedFilters: FilterOption[] = [
      { id: 'a', label: 'A', group: 'Group 1' },
      { id: 'b', label: 'B', group: 'Group 1' },
      { id: 'c', label: 'C', group: 'Group 2' },
    ];
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${groupedFilters}></loquix-filter-bar>`,
    );
    const groupLabels = el.shadowRoot!.querySelectorAll('.group-label');
    expect(groupLabels.length).to.equal(2);
    expect(groupLabels[0].textContent).to.contain('Group 1');
    expect(groupLabels[1].textContent).to.contain('Group 2');
    const dividers = el.shadowRoot!.querySelectorAll('.divider');
    expect(dividers.length).to.equal(1);
  });

  it('single group with name still shows header', async () => {
    const singleGroup: FilterOption[] = [
      { id: 'a', label: 'A', group: 'Only Group' },
      { id: 'b', label: 'B', group: 'Only Group' },
    ];
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${singleGroup}></loquix-filter-bar>`,
    );
    const groupLabels = el.shadowRoot!.querySelectorAll('.group-label');
    expect(groupLabels.length).to.equal(1);
  });

  it('single group without name renders flat (no headers)', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters}></loquix-filter-bar>`,
    );
    const groupLabels = el.shadowRoot!.querySelectorAll('.group-label');
    expect(groupLabels.length).to.equal(0);
    const dividers = el.shadowRoot!.querySelectorAll('.divider');
    expect(dividers.length).to.equal(0);
  });

  // --- Localization ---

  it('toolbar has aria-label from localization', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters}></loquix-filter-bar>`,
    );
    const bar = getShadowPart(el, 'bar');
    expect(bar!.getAttribute('aria-label')).to.be.a('string').and.not.be.empty;
  });

  it('negative prompt input has placeholder from localization', async () => {
    const el = await fixture<LoquixFilterBar>(
      html`<loquix-filter-bar .filters=${mockFilters} show-negative-prompt></loquix-filter-bar>`,
    );
    const negPrompt = getShadowPart(el, 'negative-prompt')!;
    const input = negPrompt.querySelector('input')!;
    expect(input.getAttribute('placeholder')).to.be.a('string').and.not.be.empty;
  });
});
