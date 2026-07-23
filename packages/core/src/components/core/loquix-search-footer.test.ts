import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart, getShadowParts, getSlotContent } from '../../test-utils.js';
import './define-search-footer.js';
import type { LoquixSearchFooter } from './loquix-search-footer.js';
import type { SearchShortcut } from '../../types/index.js';

const shortcuts: SearchShortcut[] = [
  { key: 'Enter', label: 'Search' },
  { key: 'Cmd Enter', label: 'Ask AI' },
  { key: 'Esc', label: 'Close' },
];

describe('loquix-search-footer', () => {
  it('renders shortcut items', async () => {
    const el = await fixture<LoquixSearchFooter>(
      html`<loquix-search-footer></loquix-search-footer>`,
    );
    el.shortcuts = shortcuts;
    await el.updateComplete;

    expect(getShadowParts(el, 'shortcut').length).to.equal(3);
    expect(getShadowParts(el, 'key').map(key => key.textContent?.trim())).to.deep.equal([
      'Enter',
      'Cmd Enter',
      'Esc',
    ]);
    expect(getShadowParts(el, 'label').map(label => label.textContent?.trim())).to.deep.equal([
      'Search',
      'Ask AI',
      'Close',
    ]);
  });

  it('uses default accessible label', async () => {
    const el = await fixture<LoquixSearchFooter>(
      html`<loquix-search-footer></loquix-search-footer>`,
    );
    expect(getShadowPart(el, 'footer')!.getAttribute('aria-label')).to.equal(
      'Search keyboard shortcuts',
    );
  });

  it('supports accessible label override', async () => {
    const el = await fixture<LoquixSearchFooter>(
      html`<loquix-search-footer label="Command shortcuts"></loquix-search-footer>`,
    );
    expect(getShadowPart(el, 'footer')!.getAttribute('aria-label')).to.equal('Command shortcuts');
  });

  it('renders trailing actions slot', async () => {
    const el = await fixture<LoquixSearchFooter>(
      html`<loquix-search-footer>
        <span slot="actions">3 sources</span>
      </loquix-search-footer>`,
    );
    const slotted = getSlotContent(el, 'actions');
    expect(slotted.length).to.equal(1);
    expect(slotted[0].textContent?.trim()).to.equal('3 sources');
  });
});
