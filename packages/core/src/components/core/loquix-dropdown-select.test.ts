import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart, getShadowParts } from '../../test-utils.js';
import './define-dropdown-select.js';
import type { LoquixDropdownSelect } from './loquix-dropdown-select.js';
import type { SelectOption } from '../../types/index.js';

const mockOptions: SelectOption[] = [
  { value: 'alpha', label: 'Alpha', description: 'First option' },
  { value: 'beta', label: 'Beta', icon: '🅱️' },
  { value: 'gamma', label: 'Gamma', badge: 'new' },
];

const groupedOptions: SelectOption[] = [
  { value: 'a', label: 'Apple', group: 'Fruits' },
  { value: 'b', label: 'Banana', group: 'Fruits' },
  { value: 'c', label: 'Carrot', group: 'Vegetables' },
];

const withChildren: SelectOption[] = [
  {
    value: 'parent',
    label: 'Parent',
    children: [
      { value: 'child-1', label: 'Child 1' },
      { value: 'child-2', label: 'Child 2' },
    ],
  },
  { value: 'solo', label: 'Solo' },
];

describe('loquix-dropdown-select', () => {
  it('renders trigger with placeholder', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions}></loquix-dropdown-select>`,
    );
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger).to.exist;
    expect(trigger!.textContent).to.contain('Select...');
    expect(trigger!.getAttribute('aria-haspopup')).to.equal('listbox');
    expect(trigger!.getAttribute('aria-expanded')).to.equal('false');
  });

  it('shows selected value label in trigger', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} value="beta"></loquix-dropdown-select>`,
    );
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger!.textContent).to.contain('Beta');
  });

  it('uses custom placeholder', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select placeholder="Choose..."></loquix-dropdown-select>`,
    );
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger!.textContent).to.contain('Choose...');
  });

  it('opens panel on trigger click', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions}></loquix-dropdown-select>`,
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

  it('renders all options in panel', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const options = getShadowParts(el, 'option');
    expect(options).to.have.lengthOf(3);
    expect(options[0].textContent).to.contain('Alpha');
    expect(options[1].textContent).to.contain('Beta');
    expect(options[2].textContent).to.contain('Gamma');
  });

  it('renders option descriptions', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const options = getShadowParts(el, 'option');
    expect(options[0].textContent).to.contain('First option');
  });

  it('renders option icons and badges', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const options = getShadowParts(el, 'option');
    expect(options[1].textContent).to.contain('🅱️');
    expect(options[2].textContent).to.contain('new');
  });

  it('dispatches loquix-select-change on selection', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;
    const options = getShadowParts(el, 'option');
    const eventPromise = waitForEvent(el, 'loquix-select-change');
    options[1].click();
    const event = await eventPromise;
    expect(event.detail.value).to.equal('beta');
    expect(event.detail.option.label).to.equal('Beta');
    expect(el.value).to.equal('beta');
    expect(el.open).to.be.false;
  });

  it('does not open when disabled', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} disabled></loquix-dropdown-select>`,
    );
    el.show();
    expect(el.open).to.be.false;
  });

  it('closes on hide()', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions}></loquix-dropdown-select>`,
    );
    el.show();
    expect(el.open).to.be.true;
    el.hide();
    expect(el.open).to.be.false;
  });

  it('toggle() switches open state', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions}></loquix-dropdown-select>`,
    );
    el.toggle();
    expect(el.open).to.be.true;
    el.toggle();
    expect(el.open).to.be.false;
  });

  it('shows search input when searchable', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select
        .options=${mockOptions}
        searchable
        open
      ></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const search = getShadowPart(el, 'search');
    expect(search).to.exist;
  });

  it('does not show search input when not searchable', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const search = getShadowPart(el, 'search');
    expect(search).to.not.exist;
  });

  it('renders group headers', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${groupedOptions} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const headers = el.shadowRoot!.querySelectorAll('.group-header');
    expect(headers.length).to.equal(2);
    expect(headers[0].textContent).to.contain('Fruits');
    expect(headers[1].textContent).to.contain('Vegetables');
  });

  it('marks active option with aria-selected', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select
        .options=${mockOptions}
        value="alpha"
        open
      ></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const options = getShadowParts(el, 'option');
    expect(options[0].getAttribute('aria-selected')).to.equal('true');
    expect(options[1].getAttribute('aria-selected')).to.equal('false');
  });

  it('has footer slot', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} open>
        <span slot="footer">Create new</span>
      </loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const footer = getShadowPart(el, 'footer');
    expect(footer).to.exist;
  });

  it('reflects value attribute', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select value="test"></loquix-dropdown-select>`,
    );
    expect(el.getAttribute('value')).to.equal('test');
  });

  it('handles disabled options', async () => {
    const opts: SelectOption[] = [
      { value: 'enabled', label: 'Enabled' },
      { value: 'disabled', label: 'Disabled', disabled: true },
    ];
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${opts}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;
    const options = getShadowParts(el, 'option');
    let fired = false;
    el.addEventListener('loquix-select-change', () => {
      fired = true;
    });
    options[1].click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('handles action type options', async () => {
    const opts: SelectOption[] = [{ value: 'do-action', label: 'Run action', type: 'action' }];
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${opts}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;
    const options = getShadowParts(el, 'option');
    const eventPromise = waitForEvent(el, 'loquix-select-change');
    options[0].click();
    const event = await eventPromise;
    expect(event.detail.value).to.equal('do-action');
    // Action type should not set value on the component
    expect(el.value).to.equal('');
  });

  it('options with children show submenu arrow', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${withChildren} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const options = getShadowParts(el, 'option');
    // Parent option should have aria-expanded attribute
    expect(options[0].hasAttribute('aria-expanded')).to.be.true;
    // Solo option should not
    expect(options[1].hasAttribute('aria-expanded')).to.be.false;
  });

  it('panel has role=listbox', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const panel = getShadowPart(el, 'panel');
    expect(panel!.getAttribute('role')).to.equal('listbox');
  });

  // --- Keyboard ArrowDown/Up navigates options ---

  it('ArrowDown navigates to next option', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await el.updateComplete;

    const focused = el.shadowRoot!.querySelector('.option--focused');
    expect(focused).to.exist;
    expect(focused!.textContent).to.contain('Alpha');
  });

  it('ArrowUp navigates to previous option (clamped to 0)', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    // Move down twice
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await el.updateComplete;

    // Now ArrowUp
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await el.updateComplete;

    const focused = el.shadowRoot!.querySelector('.option--focused');
    expect(focused).to.exist;
    expect(focused!.textContent).to.contain('Alpha');
  });

  // --- Keyboard Enter selects option ---

  it('Enter key selects focused option', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await el.updateComplete;

    const eventPromise = waitForEvent(el, 'loquix-select-change');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const event = await eventPromise;
    expect(event.detail.value).to.equal('alpha');
    expect(el.open).to.be.false;
  });

  // --- Keyboard Escape closes dropdown ---

  it('Escape key closes dropdown', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(el.open).to.be.false;
  });

  // --- Search filtering ---

  it('search filtering: typing text filters options', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} searchable></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    const searchInput = el.shadowRoot!.querySelector('.search__input') as HTMLInputElement;
    searchInput.value = 'Beta';
    searchInput.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const options = getShadowParts(el, 'option');
    expect(options).to.have.lengthOf(1);
    expect(options[0].textContent).to.contain('Beta');
  });

  it('search filtering by description', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} searchable></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    const searchInput = el.shadowRoot!.querySelector('.search__input') as HTMLInputElement;
    searchInput.value = 'First';
    searchInput.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const options = getShadowParts(el, 'option');
    expect(options).to.have.lengthOf(1);
    expect(options[0].textContent).to.contain('Alpha');
  });

  // --- noChevron hides chevron icon ---

  it('noChevron hides chevron icon on trigger', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} no-chevron></loquix-dropdown-select>`,
    );
    const trigger = getShadowPart(el, 'trigger')!;
    const chevron = trigger.querySelector('.trigger__chevron');
    expect(chevron).to.not.exist;
  });

  it('chevron is visible by default', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions}></loquix-dropdown-select>`,
    );
    const trigger = getShadowPart(el, 'trigger')!;
    const chevron = trigger.querySelector('.trigger__chevron');
    expect(chevron).to.exist;
  });

  // --- Disabled option can't be selected ---

  it('disabled option prevents selection via keyboard', async () => {
    const opts: SelectOption[] = [
      { value: 'disabled', label: 'Disabled', disabled: true },
      { value: 'enabled', label: 'Enabled' },
    ];
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${opts}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    // The first selectable option should be "Enabled" (disabled is filtered)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await el.updateComplete;

    const eventPromise = waitForEvent(el, 'loquix-select-change');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const event = await eventPromise;
    expect(event.detail.value).to.equal('enabled');
  });

  // --- Document click outside closes dropdown ---

  it('clicking outside the dropdown closes it', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;

    // Click outside
    document.body.click();
    await new Promise(r => setTimeout(r, 50));
    expect(el.open).to.be.false;
  });

  // --- Focus management ---

  it('opening dropdown with searchable focuses search input', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} searchable></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;
    // Give time for the async focus
    await new Promise(r => setTimeout(r, 50));

    const searchInput = el.shadowRoot!.querySelector('.search__input') as HTMLInputElement;
    expect(el.shadowRoot!.activeElement).to.equal(searchInput);
  });

  // --- Placement prop ---

  it('accepts placement property', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select
        .options=${mockOptions}
        placement="bottom"
      ></loquix-dropdown-select>`,
    );
    expect(el.placement).to.equal('bottom');
  });

  // --- Reflects noChevron ---

  it('reflects no-chevron attribute', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select no-chevron></loquix-dropdown-select>`,
    );
    expect(el.noChevron).to.be.true;
    expect(el.hasAttribute('no-chevron')).to.be.true;
  });

  // --- Reconnect lifecycle (Codex R1 finding 1) ---

  it('reattaches document listeners on reconnect when open=true', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions}></loquix-dropdown-select>`,
    );

    // Open the dropdown
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;

    // Simulate disconnect/reconnect (e.g. moving in DOM)
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
