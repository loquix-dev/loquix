import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart, getShadowParts, simulateKeyboard } from '../../test-utils.js';
import './define-mode-selector.js';
import type { LoquixModeSelector } from './loquix-mode-selector.js';
import type { ModeOption } from '../../types/index.js';

const mockModes: ModeOption[] = [
  { value: 'chat', label: 'Chat', icon: '💬', description: 'Free conversation' },
  { value: 'research', label: 'Research', icon: '🔍', description: 'Deep search' },
  { value: 'build', label: 'Build', icon: '🔧', description: 'Code generation' },
];

describe('loquix-mode-selector', () => {
  // === Tabs variant (default) ===

  it('renders tabs variant by default', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="chat"></loquix-mode-selector>`,
    );
    const tabs = getShadowPart(el, 'tabs');
    expect(tabs).to.exist;
    expect(tabs!.getAttribute('role')).to.equal('tablist');
  });

  it('renders tab buttons for each mode', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="chat"></loquix-mode-selector>`,
    );
    const tabButtons = getShadowParts(el, 'tab');
    expect(tabButtons).to.have.lengthOf(3);
    expect(tabButtons[0].textContent).to.contain('Chat');
    expect(tabButtons[1].textContent).to.contain('Research');
    expect(tabButtons[2].textContent).to.contain('Build');
  });

  it('marks active tab with aria-selected', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="research"></loquix-mode-selector>`,
    );
    const tabButtons = getShadowParts(el, 'tab');
    expect(tabButtons[0].getAttribute('aria-selected')).to.equal('false');
    expect(tabButtons[1].getAttribute('aria-selected')).to.equal('true');
    expect(tabButtons[2].getAttribute('aria-selected')).to.equal('false');
  });

  it('dispatches loquix-mode-change on tab click', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="chat"></loquix-mode-selector>`,
    );
    const tabButtons = getShadowParts(el, 'tab');
    const eventPromise = waitForEvent(el, 'loquix-mode-change');
    tabButtons[1].click();
    const event = await eventPromise;
    expect(event.detail.from).to.equal('chat');
    expect(event.detail.to).to.equal('research');
  });

  it('does not dispatch when clicking same mode', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="chat"></loquix-mode-selector>`,
    );
    let fired = false;
    el.addEventListener('loquix-mode-change', () => {
      fired = true;
    });
    const tabButtons = getShadowParts(el, 'tab');
    tabButtons[0].click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('does not dispatch when disabled', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="chat" disabled></loquix-mode-selector>`,
    );
    let fired = false;
    el.addEventListener('loquix-mode-change', () => {
      fired = true;
    });
    const tabButtons = getShadowParts(el, 'tab');
    tabButtons[1].click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  // === Toggle variant ===

  it('renders toggle variant with 2 options', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="toggle"
      ></loquix-mode-selector>`,
    );
    const toggle = getShadowPart(el, 'toggle');
    expect(toggle).to.exist;
    expect(toggle!.getAttribute('role')).to.equal('radiogroup');
    const options = getShadowParts(el, 'toggle-option');
    // Toggle variant shows only first 2 modes
    expect(options).to.have.lengthOf(2);
  });

  it('toggle option has radio role and aria-checked', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="toggle"
      ></loquix-mode-selector>`,
    );
    const options = getShadowParts(el, 'toggle-option');
    expect(options[0].getAttribute('role')).to.equal('radio');
    expect(options[0].getAttribute('aria-checked')).to.equal('true');
    expect(options[1].getAttribute('aria-checked')).to.equal('false');
  });

  // === Dropdown variant ===

  it('renders dropdown variant with trigger', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="dropdown"
      ></loquix-mode-selector>`,
    );
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger).to.exist;
    expect(trigger!.getAttribute('aria-haspopup')).to.equal('listbox');
    expect(trigger!.textContent).to.contain('Chat');
  });

  it('dropdown opens panel on show()', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="dropdown"
      ></loquix-mode-selector>`,
    );
    expect(el.open).to.be.false;
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;
    const panel = getShadowPart(el, 'panel');
    expect(panel).to.exist;
    expect(panel!.hidden).to.be.false;
  });

  it('dropdown does not open when disabled', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="dropdown"
        disabled
      ></loquix-mode-selector>`,
    );
    el.show();
    expect(el.open).to.be.false;
  });

  it('dropdown renders options in panel', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="dropdown"
      ></loquix-mode-selector>`,
    );
    el.show();
    await el.updateComplete;
    const options = getShadowParts(el, 'option');
    expect(options).to.have.lengthOf(3);
  });

  // === Shared ===

  it('reflects value attribute', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector value="research"></loquix-mode-selector>`,
    );
    expect(el.getAttribute('value')).to.equal('research');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector variant="pills"></loquix-mode-selector>`,
    );
    expect(el.getAttribute('variant')).to.equal('pills');
  });

  // --- Keyboard ArrowRight/Left navigates modes (tabs variant) ---

  it('ArrowRight selects next mode in tabs', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="chat"></loquix-mode-selector>`,
    );
    const tabButtons = getShadowParts(el, 'tab');
    tabButtons[0].focus();

    const eventPromise = waitForEvent(el, 'loquix-mode-change');
    simulateKeyboard(tabButtons[0], 'ArrowRight');
    const event = await eventPromise;
    expect(event.detail.from).to.equal('chat');
    expect(event.detail.to).to.equal('research');
  });

  it('ArrowLeft selects previous mode in tabs', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="research"></loquix-mode-selector>`,
    );
    const tabButtons = getShadowParts(el, 'tab');
    tabButtons[1].focus();

    const eventPromise = waitForEvent(el, 'loquix-mode-change');
    simulateKeyboard(tabButtons[1], 'ArrowLeft');
    const event = await eventPromise;
    expect(event.detail.from).to.equal('research');
    expect(event.detail.to).to.equal('chat');
  });

  // --- Keyboard wrapping (last to first) ---

  it('ArrowRight wraps from last to first mode', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="build"></loquix-mode-selector>`,
    );
    const tabButtons = getShadowParts(el, 'tab');
    tabButtons[2].focus();

    const eventPromise = waitForEvent(el, 'loquix-mode-change');
    simulateKeyboard(tabButtons[2], 'ArrowRight');
    const event = await eventPromise;
    expect(event.detail.to).to.equal('chat');
  });

  it('ArrowLeft wraps from first to last mode', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="chat"></loquix-mode-selector>`,
    );
    const tabButtons = getShadowParts(el, 'tab');
    tabButtons[0].focus();

    const eventPromise = waitForEvent(el, 'loquix-mode-change');
    simulateKeyboard(tabButtons[0], 'ArrowLeft');
    const event = await eventPromise;
    expect(event.detail.to).to.equal('build');
  });

  // --- showDescription shows/hides description text ---

  it('showDescription shows description text in tabs', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        show-description
      ></loquix-mode-selector>`,
    );
    const tabButtons = getShadowParts(el, 'tab');
    expect(tabButtons[0].textContent).to.contain('Free conversation');
    expect(tabButtons[1].textContent).to.contain('Deep search');
  });

  it('hides description when showDescription is false', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="chat"></loquix-mode-selector>`,
    );
    const tabButtons = getShadowParts(el, 'tab');
    const desc = tabButtons[0].querySelector('.tab__description');
    expect(desc).to.not.exist;
  });

  // --- stacked layout variant ---

  it('stacked attribute reflects on host', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="chat" stacked></loquix-mode-selector>`,
    );
    expect(el.stacked).to.be.true;
    expect(el.hasAttribute('stacked')).to.be.true;
  });

  // --- pills variant rendering ---

  it('pills variant renders same as tabs', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="pills"
      ></loquix-mode-selector>`,
    );
    const tabs = getShadowPart(el, 'tabs');
    expect(tabs).to.exist;
    const tabButtons = getShadowParts(el, 'tab');
    expect(tabButtons).to.have.lengthOf(3);
  });

  it('pills variant dispatches loquix-mode-change on click', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="pills"
      ></loquix-mode-selector>`,
    );
    const tabButtons = getShadowParts(el, 'tab');
    const eventPromise = waitForEvent(el, 'loquix-mode-change');
    tabButtons[2].click();
    const event = await eventPromise;
    expect(event.detail.to).to.equal('build');
  });

  // --- Disabled mode can't be selected ---

  it('disabled mode prevents selection', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="chat" disabled></loquix-mode-selector>`,
    );
    let fired = false;
    el.addEventListener('loquix-mode-change', () => {
      fired = true;
    });
    const tabButtons = getShadowParts(el, 'tab');
    tabButtons[2].click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
    expect(el.value).to.equal('chat');
  });

  // --- aria-label from localization ---

  it('tabs container has aria-label from localization', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="chat"></loquix-mode-selector>`,
    );
    const tabs = getShadowPart(el, 'tabs')!;
    expect(tabs.getAttribute('aria-label')).to.be.a('string').and.not.be.empty;
  });

  it('toggle variant has aria-label from localization', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="toggle"
      ></loquix-mode-selector>`,
    );
    const toggle = getShadowPart(el, 'toggle')!;
    expect(toggle.getAttribute('aria-label')).to.be.a('string').and.not.be.empty;
  });

  // --- All mode options render with correct labels ---

  it('all mode options render with correct labels and icons', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector .modes=${mockModes} value="chat"></loquix-mode-selector>`,
    );
    const tabButtons = getShadowParts(el, 'tab');
    expect(tabButtons[0].textContent).to.contain('Chat');
    expect(tabButtons[0].textContent).to.contain('💬');
    expect(tabButtons[1].textContent).to.contain('Research');
    expect(tabButtons[1].textContent).to.contain('🔍');
    expect(tabButtons[2].textContent).to.contain('Build');
    expect(tabButtons[2].textContent).to.contain('🔧');
  });

  // --- Dropdown keyboard Escape ---

  it('dropdown variant: Escape key closes panel', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="dropdown"
      ></loquix-mode-selector>`,
    );
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(el.open).to.be.false;
  });

  // --- Dropdown keyboard ArrowDown/Enter ---

  it('dropdown variant: ArrowDown + Enter selects mode', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="dropdown"
      ></loquix-mode-selector>`,
    );
    el.show();
    await el.updateComplete;

    // ArrowDown once: chat (0, focused on open) → research (1)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await el.updateComplete;

    const eventPromise = waitForEvent(el, 'loquix-mode-change');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const event = await eventPromise;
    expect(event.detail.to).to.equal('research');
    expect(el.open).to.be.false;
  });

  // --- showDescription in dropdown options ---

  it('showDescription shows description in dropdown options', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="dropdown"
        show-description
      ></loquix-mode-selector>`,
    );
    el.show();
    await el.updateComplete;

    const options = getShadowParts(el, 'option');
    const desc = options[0].querySelector('.option__description');
    expect(desc).to.exist;
    expect(desc!.textContent).to.contain('Free conversation');
  });

  // --- Reconnect lifecycle (Codex R1 finding 1) ---

  it('reattaches document listeners on reconnect when open=true (dropdown variant)', async () => {
    const el = await fixture<LoquixModeSelector>(
      html`<loquix-mode-selector
        .modes=${mockModes}
        value="chat"
        variant="dropdown"
      ></loquix-mode-selector>`,
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
