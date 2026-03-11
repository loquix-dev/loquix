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

  // === Submenu interaction tests ===

  it('clicking option with children opens submenu instead of selecting', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${withChildren}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    const options = getShadowParts(el, 'option');
    // Click parent option (has children) — should toggle submenu, not select
    options[0].click();
    await el.updateComplete;

    // Dropdown should still be open (submenu toggled, not closed)
    expect(el.open).to.be.true;
    // Value should not change
    expect(el.value).to.equal('');

    // Submenu should render
    const submenu = el.shadowRoot!.querySelector('.submenu');
    expect(submenu).to.exist;
  });

  it('clicking parent option again closes submenu', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${withChildren}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    const options = getShadowParts(el, 'option');
    // Open submenu
    options[0].click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.submenu')).to.exist;

    // Click again to close submenu
    options[0].click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.submenu')).to.not.exist;
  });

  it('selecting a submenu child fires event and closes dropdown', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${withChildren}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    // Open submenu
    const options = getShadowParts(el, 'option');
    options[0].click();
    await el.updateComplete;

    // Click a child in the submenu
    const submenuOptions = el.shadowRoot!.querySelectorAll('.submenu .option');
    expect(submenuOptions.length).to.be.greaterThan(0);

    const eventPromise = waitForEvent(el, 'loquix-select-change');
    (submenuOptions[0] as HTMLElement).click();
    const event = await eventPromise;
    expect(event.detail.value).to.equal('child-1');
    expect(el.value).to.equal('child-1');
    expect(el.open).to.be.false;
  });

  it('selecting a disabled submenu child does not fire event', async () => {
    const optsWithDisabledChild: SelectOption[] = [
      {
        value: 'parent',
        label: 'Parent',
        children: [{ value: 'child-disabled', label: 'Disabled Child', disabled: true }],
      },
    ];
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${optsWithDisabledChild}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    // Open submenu
    getShadowParts(el, 'option')[0].click();
    await el.updateComplete;

    let fired = false;
    el.addEventListener('loquix-select-change', () => {
      fired = true;
    });

    const submenuOptions = el.shadowRoot!.querySelectorAll('.submenu .option');
    (submenuOptions[0] as HTMLElement).click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('action-type submenu child fires event but does not set value', async () => {
    const optsWithAction: SelectOption[] = [
      {
        value: 'parent',
        label: 'Parent',
        children: [{ value: 'sub-action', label: 'Sub Action', type: 'action' }],
      },
    ];
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${optsWithAction}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    // Open submenu
    getShadowParts(el, 'option')[0].click();
    await el.updateComplete;

    const eventPromise = waitForEvent(el, 'loquix-select-change');
    const submenuOptions = el.shadowRoot!.querySelectorAll('.submenu .option');
    (submenuOptions[0] as HTMLElement).click();
    const event = await eventPromise;
    expect(event.detail.value).to.equal('sub-action');
    expect(el.value).to.equal(''); // action type doesn't set value
  });

  // === Hover hint tests ===

  it('hovering option with hint shows hint text', async () => {
    const optsWithHint: SelectOption[] = [
      { value: 'a', label: 'Option A', hint: 'Helpful hint text' },
    ];
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${optsWithHint} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;

    const option = getShadowParts(el, 'option')[0];
    option.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await el.updateComplete;

    const hint = el.shadowRoot!.querySelector('.hint');
    expect(hint).to.exist;
    expect(hint!.textContent).to.contain('Helpful hint text');
  });

  it('mouse leave clears hint', async () => {
    const optsWithHint: SelectOption[] = [{ value: 'a', label: 'Option A', hint: 'Some hint' }];
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${optsWithHint} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;

    const option = getShadowParts(el, 'option')[0];
    option.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.hint')).to.exist;

    option.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.hint')).to.not.exist;
  });

  // === Hover submenu open/close ===

  it('hovering option with children opens submenu', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${withChildren} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;

    const options = getShadowParts(el, 'option');
    options[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await el.updateComplete;

    const submenu = el.shadowRoot!.querySelector('.submenu');
    expect(submenu).to.exist;
  });

  it('hovering a non-child option schedules submenu close', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${withChildren} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;

    // Hover parent to open submenu
    const options = getShadowParts(el, 'option');
    options[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.submenu')).to.exist;

    // Hover solo option (no children) — schedules close
    options[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    // Wait for 150ms timeout
    await new Promise(r => setTimeout(r, 200));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.submenu')).to.not.exist;
  });

  it('entering submenu panel cancels close timeout', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${withChildren} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;

    // Open submenu via hover
    const options = getShadowParts(el, 'option');
    options[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await el.updateComplete;

    const submenu = el.shadowRoot!.querySelector('.submenu')!;
    expect(submenu).to.exist;

    // Leave the option (schedules close)
    options[0].dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

    // Enter the submenu (cancels close)
    submenu.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

    // Wait for timeout that would have closed it
    await new Promise(r => setTimeout(r, 200));
    await el.updateComplete;

    // Submenu should still be open
    expect(el.shadowRoot!.querySelector('.submenu')).to.exist;
  });

  it('leaving submenu panel closes it after delay', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${withChildren} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;

    // Open submenu via hover
    const options = getShadowParts(el, 'option');
    options[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await el.updateComplete;

    const submenu = el.shadowRoot!.querySelector('.submenu')!;
    expect(submenu).to.exist;

    // Leave submenu
    submenu.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

    // Wait for 150ms close timeout
    await new Promise(r => setTimeout(r, 200));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.submenu')).to.not.exist;
  });

  // === External option icon ===

  it('renders external icon for options with external=true', async () => {
    const optsExternal: SelectOption[] = [
      { value: 'link', label: 'External Link', external: true },
    ];
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${optsExternal} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const option = getShadowParts(el, 'option')[0];
    const externalSvg = option.querySelector('.option__external');
    expect(externalSvg).to.exist;
  });

  // === Separator type filtering ===

  it('separator type options are skipped in keyboard nav', async () => {
    const optsWithSep: SelectOption[] = [
      { value: 'first', label: 'First' },
      { value: 'sep', label: '', type: 'separator' },
      { value: 'third', label: 'Third' },
    ];
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${optsWithSep}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    // ArrowDown twice should skip separator
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await el.updateComplete;

    const eventPromise = waitForEvent(el, 'loquix-select-change');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const event = await eventPromise;
    expect(event.detail.value).to.equal('third');
  });

  // === hasSubmenu flag rendering ===

  it('option with hasSubmenu flag shows submenu arrow', async () => {
    const optsHasSubmenu: SelectOption[] = [
      { value: 'sub', label: 'Has Submenu', hasSubmenu: true },
    ];
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${optsHasSubmenu} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const option = getShadowParts(el, 'option')[0];
    const arrow = option.querySelector('.option__arrow');
    expect(arrow).to.exist;
    expect(option.hasAttribute('aria-expanded')).to.be.true;
  });

  // === Submenu child option icon and description ===

  it('submenu child options render icon and description', async () => {
    const optsRich: SelectOption[] = [
      {
        value: 'parent',
        label: 'Parent',
        children: [{ value: 'child', label: 'Child', icon: '🎯', description: 'Child desc' }],
      },
    ];
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${optsRich}></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    // Open submenu
    getShadowParts(el, 'option')[0].click();
    await el.updateComplete;

    const submenuOpts = el.shadowRoot!.querySelectorAll('.submenu .option');
    expect(submenuOpts[0].textContent).to.contain('🎯');
    expect(submenuOpts[0].textContent).to.contain('Child');
    expect(submenuOpts[0].textContent).to.contain('Child desc');
  });

  // === Submenu child active state ===

  it('submenu child shows active state when value matches', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select
        .options=${withChildren}
        value="child-1"
      ></loquix-dropdown-select>`,
    );
    el.show();
    await el.updateComplete;

    // Open submenu
    getShadowParts(el, 'option')[0].click();
    await el.updateComplete;

    const submenuOpts = el.shadowRoot!.querySelectorAll('.submenu .option');
    expect(submenuOpts[0].classList.contains('option--active')).to.be.true;
    expect(submenuOpts[1].classList.contains('option--active')).to.be.false;
  });

  // === Search custom placeholder ===

  it('uses custom search placeholder when provided', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select
        .options=${mockOptions}
        searchable
        search-placeholder="Find..."
        open
      ></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('.search__input') as HTMLInputElement;
    expect(input.placeholder).to.equal('Find...');
  });

  // === Selected option icon in trigger ===

  it('shows selected option icon in trigger', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${mockOptions} value="beta"></loquix-dropdown-select>`,
    );
    await el.updateComplete;
    const trigger = getShadowPart(el, 'trigger')!;
    const icon = trigger.querySelector('.trigger__icon');
    expect(icon).to.exist;
    expect(icon!.textContent).to.contain('🅱️');
  });

  // === Cleanup on disconnect ===

  it('cleans up submenu timeout on disconnectedCallback', async () => {
    const el = await fixture<LoquixDropdownSelect>(
      html`<loquix-dropdown-select .options=${withChildren} open></loquix-dropdown-select>`,
    );
    await el.updateComplete;

    // Open submenu
    const options = getShadowParts(el, 'option');
    options[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await el.updateComplete;

    // Trigger a scheduled close
    options[0].dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

    // Disconnect should clean up without errors
    el.parentElement!.removeChild(el);
    // No errors thrown — cleanup successful
  });
});
