import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart, getShadowParts } from '../../test-utils.js';
import './define-parameter-panel.js';
import type { LoquixParameterPanel } from './loquix-parameter-panel.js';
import type { ParameterDef, ParameterPreset } from '../../types/index.js';

const mockParams: ParameterDef[] = [
  {
    id: 'temperature',
    label: 'Temperature',
    type: 'range',
    min: 0,
    max: 2,
    step: 0.1,
    default: 0.7,
    description: 'Creativity level',
  },
  { id: 'stream', label: 'Stream', type: 'toggle', default: true },
  {
    id: 'max_tokens',
    label: 'Max Tokens',
    type: 'number',
    min: 1,
    max: 4096,
    step: 1,
    default: 1024,
  },
  {
    id: 'format',
    label: 'Output Format',
    type: 'select',
    options: [
      { value: 'text', label: 'Text' },
      { value: 'json', label: 'JSON' },
    ],
    default: 'text',
  },
];

const advancedParams: ParameterDef[] = [
  ...mockParams,
  {
    id: 'top_p',
    label: 'Top P',
    type: 'range',
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
    advanced: true,
  },
];

const mockPresets: ParameterPreset[] = [
  {
    id: 'creative',
    label: 'Creative',
    values: { temperature: 1.5, stream: true, max_tokens: 2048 },
  },
  { id: 'precise', label: 'Precise', values: { temperature: 0.1, stream: false, max_tokens: 512 } },
];

describe('loquix-parameter-panel', () => {
  it('renders panel with parameters', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${mockParams}></loquix-parameter-panel>`,
    );
    const panel = getShadowPart(el, 'panel');
    expect(panel).to.exist;
    const params = getShadowParts(el, 'param');
    expect(params).to.have.lengthOf(4);
  });

  it('renders range slider with label and value', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .values=${{ temperature: 0.7 }}
      ></loquix-parameter-panel>`,
    );
    const range = getShadowPart(el, 'range');
    expect(range).to.exist;
    expect(range!.tagName.toLowerCase()).to.equal('input');
    expect((range as HTMLInputElement).type).to.equal('range');
  });

  it('renders toggle switch', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .values=${{ stream: true }}
      ></loquix-parameter-panel>`,
    );
    const toggle = getShadowPart(el, 'toggle-btn');
    expect(toggle).to.exist;
    expect(toggle!.getAttribute('role')).to.equal('switch');
    expect(toggle!.getAttribute('aria-checked')).to.equal('true');
  });

  it('renders number input', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${mockParams}></loquix-parameter-panel>`,
    );
    const numberInput = getShadowPart(el, 'number-input');
    expect(numberInput).to.exist;
    expect((numberInput as HTMLInputElement).type).to.equal('number');
  });

  it('renders select input', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${mockParams}></loquix-parameter-panel>`,
    );
    const selectInput = getShadowPart(el, 'select-input');
    expect(selectInput).to.exist;
    expect(selectInput!.tagName.toLowerCase()).to.equal('select');
  });

  it('dispatches loquix-parameter-change on toggle click', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .values=${{ stream: true }}
      ></loquix-parameter-panel>`,
    );
    const toggle = getShadowPart(el, 'toggle-btn')!;
    const eventPromise = waitForEvent(el, 'loquix-parameter-change');
    toggle.click();
    const event = await eventPromise;
    expect(event.detail.id).to.equal('stream');
    expect(event.detail.value).to.be.false;
  });

  it('dispatches loquix-parameter-commit on toggle click', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .values=${{ stream: false }}
      ></loquix-parameter-panel>`,
    );
    const toggle = getShadowPart(el, 'toggle-btn')!;
    const eventPromise = waitForEvent(el, 'loquix-parameter-commit');
    toggle.click();
    const event = await eventPromise;
    expect(event.detail.id).to.equal('stream');
    expect(event.detail.value).to.be.true;
  });

  it('renders preset buttons', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .presets=${mockPresets}
      ></loquix-parameter-panel>`,
    );
    const presets = getShadowParts(el, 'preset');
    expect(presets).to.have.lengthOf(2);
    expect(presets[0].textContent).to.contain('Creative');
    expect(presets[1].textContent).to.contain('Precise');
  });

  it('dispatches loquix-preset-change on preset click', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .presets=${mockPresets}
      ></loquix-parameter-panel>`,
    );
    const presets = getShadowParts(el, 'preset');
    const eventPromise = waitForEvent(el, 'loquix-preset-change');
    presets[0].click();
    const event = await eventPromise;
    expect(event.detail.preset).to.equal('creative');
    expect(el.activePreset).to.equal('creative');
  });

  it('shows advanced toggle when advanced params exist', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${advancedParams}></loquix-parameter-panel>`,
    );
    const advToggle = getShadowPart(el, 'advanced-toggle');
    expect(advToggle).to.exist;
    expect(advToggle!.textContent).to.contain('Show advanced');
  });

  it('hides advanced parameters by default', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${advancedParams}></loquix-parameter-panel>`,
    );
    const params = getShadowParts(el, 'param');
    // Should only show 4 non-advanced params
    expect(params).to.have.lengthOf(4);
  });

  it('shows advanced parameters when show-advanced', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${advancedParams}
        show-advanced
      ></loquix-parameter-panel>`,
    );
    const params = getShadowParts(el, 'param');
    expect(params).to.have.lengthOf(5);
  });

  it('does not show advanced toggle when no advanced params', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${mockParams}></loquix-parameter-panel>`,
    );
    const advToggle = getShadowPart(el, 'advanced-toggle');
    expect(advToggle).to.not.exist;
  });

  it('does not dispatch when disabled', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .values=${{ stream: true }}
        disabled
      ></loquix-parameter-panel>`,
    );
    let fired = false;
    el.addEventListener('loquix-parameter-change', () => {
      fired = true;
    });
    const toggle = getShadowPart(el, 'toggle-btn')!;
    toggle.click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('hides descriptions in compact mode', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${mockParams} compact></loquix-parameter-panel>`,
    );
    const desc = el.shadowRoot!.querySelector('.param__description');
    expect(desc).to.not.exist;
  });

  // === Advanced toggle localization and visibility ===

  it('advanced toggle shows "Hide advanced" text when expanded', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${advancedParams}
        show-advanced
      ></loquix-parameter-panel>`,
    );
    const advToggle = getShadowPart(el, 'advanced-toggle');
    expect(advToggle).to.exist;
    expect(advToggle!.textContent).to.contain('Hide advanced');
  });

  it('clicking advanced toggle toggles visibility', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${advancedParams}></loquix-parameter-panel>`,
    );
    const advToggle = getShadowPart(el, 'advanced-toggle')!;
    expect(advToggle.textContent).to.contain('Show advanced');

    // Should have 4 non-advanced params initially
    expect(getShadowParts(el, 'param')).to.have.lengthOf(4);

    // Click to expand
    advToggle.click();
    await el.updateComplete;

    // Should now show 5 params including advanced
    expect(getShadowParts(el, 'param')).to.have.lengthOf(5);
    const updatedToggle = getShadowPart(el, 'advanced-toggle')!;
    expect(updatedToggle.textContent).to.contain('Hide advanced');

    // Click to collapse
    updatedToggle.click();
    await el.updateComplete;

    expect(getShadowParts(el, 'param')).to.have.lengthOf(4);
    expect(getShadowPart(el, 'advanced-toggle')!.textContent).to.contain('Show advanced');
  });

  it('does not toggle advanced when disabled', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${advancedParams}
        disabled
      ></loquix-parameter-panel>`,
    );
    const advToggle = getShadowPart(el, 'advanced-toggle')!;
    advToggle.click();
    await el.updateComplete;

    // Should still be collapsed
    expect(el.showAdvanced).to.be.false;
    expect(getShadowParts(el, 'param')).to.have.lengthOf(4);
  });

  // === All parameter types render correctly ===

  it('renders all four parameter types simultaneously', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${mockParams}></loquix-parameter-panel>`,
    );
    const range = getShadowPart(el, 'range');
    const toggle = getShadowPart(el, 'toggle-btn');
    const numberInput = getShadowPart(el, 'number-input');
    const selectInput = getShadowPart(el, 'select-input');
    expect(range).to.exist;
    expect(toggle).to.exist;
    expect(numberInput).to.exist;
    expect(selectInput).to.exist;
  });

  it('select input renders options from parameter definition', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .values=${{ format: 'text' }}
      ></loquix-parameter-panel>`,
    );
    const selectInput = getShadowPart(el, 'select-input') as HTMLSelectElement;
    const options = selectInput.querySelectorAll('option');
    expect(options).to.have.lengthOf(2);
    expect(options[0].value).to.equal('text');
    expect(options[0].textContent).to.equal('Text');
    expect(options[1].value).to.equal('json');
    expect(options[1].textContent).to.equal('JSON');
  });

  it('dispatches loquix-parameter-change on select change', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .values=${{ format: 'text' }}
      ></loquix-parameter-panel>`,
    );
    const selectInput = getShadowPart(el, 'select-input') as HTMLSelectElement;
    const eventPromise = waitForEvent(el, 'loquix-parameter-change');
    selectInput.value = 'json';
    selectInput.dispatchEvent(new Event('change', { bubbles: true }));
    const event = await eventPromise;
    expect(event.detail.id).to.equal('format');
    expect(event.detail.value).to.equal('json');
  });

  it('dispatches loquix-parameter-commit on select change', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .values=${{ format: 'text' }}
      ></loquix-parameter-panel>`,
    );
    const selectInput = getShadowPart(el, 'select-input') as HTMLSelectElement;
    const eventPromise = waitForEvent(el, 'loquix-parameter-commit');
    selectInput.value = 'json';
    selectInput.dispatchEvent(new Event('change', { bubbles: true }));
    const event = await eventPromise;
    expect(event.detail.id).to.equal('format');
    expect(event.detail.value).to.equal('json');
  });

  // === Disabled state prevents all parameter changes ===

  it('disabled prevents preset selection', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .presets=${mockPresets}
        disabled
      ></loquix-parameter-panel>`,
    );
    let fired = false;
    el.addEventListener('loquix-preset-change', () => {
      fired = true;
    });
    const presets = getShadowParts(el, 'preset');
    presets[0].click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
    expect(el.activePreset).to.equal('');
  });

  it('disabled attribute is set on range inputs', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${mockParams} disabled></loquix-parameter-panel>`,
    );
    const range = getShadowPart(el, 'range') as HTMLInputElement;
    expect(range.disabled).to.be.true;
  });

  it('disabled attribute is set on number inputs', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${mockParams} disabled></loquix-parameter-panel>`,
    );
    const numberInput = getShadowPart(el, 'number-input') as HTMLInputElement;
    expect(numberInput.disabled).to.be.true;
  });

  it('disabled attribute is set on select inputs', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${mockParams} disabled></loquix-parameter-panel>`,
    );
    const selectInput = getShadowPart(el, 'select-input') as HTMLSelectElement;
    expect(selectInput.disabled).to.be.true;
  });

  it('disabled attribute is set on toggle button', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${mockParams} disabled></loquix-parameter-panel>`,
    );
    const toggle = getShadowPart(el, 'toggle-btn') as HTMLButtonElement;
    expect(toggle.disabled).to.be.true;
  });

  it('disabled attribute is set on preset buttons', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .presets=${mockPresets}
        disabled
      ></loquix-parameter-panel>`,
    );
    const presets = getShadowParts(el, 'preset');
    for (const preset of presets) {
      expect((preset as HTMLButtonElement).disabled).to.be.true;
    }
  });

  // === CSS parts are queryable ===

  it('all documented CSS parts are queryable', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${advancedParams}
        .presets=${mockPresets}
        .values=${{ temperature: 0.7, stream: true, max_tokens: 1024, format: 'text' }}
      ></loquix-parameter-panel>`,
    );
    expect(getShadowPart(el, 'panel')).to.exist;
    expect(getShadowPart(el, 'presets')).to.exist;
    expect(getShadowPart(el, 'preset')).to.exist;
    expect(getShadowPart(el, 'param')).to.exist;
    expect(getShadowPart(el, 'range')).to.exist;
    expect(getShadowPart(el, 'toggle-btn')).to.exist;
    expect(getShadowPart(el, 'number-input')).to.exist;
    expect(getShadowPart(el, 'select-input')).to.exist;
    expect(getShadowPart(el, 'advanced-toggle')).to.exist;
  });

  // === Manual change clears active preset ===

  it('manual parameter change clears active preset', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .presets=${mockPresets}
      ></loquix-parameter-panel>`,
    );
    // Select a preset first
    const presets = getShadowParts(el, 'preset');
    presets[0].click();
    await el.updateComplete;
    expect(el.activePreset).to.equal('creative');

    // Toggle the stream parameter manually
    const toggle = getShadowPart(el, 'toggle-btn')!;
    toggle.click();
    await el.updateComplete;
    expect(el.activePreset).to.equal('');
  });

  // === Range input events ===

  it('dispatches loquix-parameter-change on range input', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .values=${{ temperature: 0.7 }}
      ></loquix-parameter-panel>`,
    );
    const range = getShadowPart(el, 'range') as HTMLInputElement;
    const eventPromise = waitForEvent(el, 'loquix-parameter-change');
    range.value = '1.2';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    const event = await eventPromise;
    expect(event.detail.id).to.equal('temperature');
    expect(event.detail.value).to.equal(1.2);
  });

  it('dispatches loquix-parameter-commit on range change', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .values=${{ temperature: 0.7 }}
      ></loquix-parameter-panel>`,
    );
    const range = getShadowPart(el, 'range') as HTMLInputElement;
    const eventPromise = waitForEvent(el, 'loquix-parameter-commit');
    range.value = '1.5';
    range.dispatchEvent(new Event('change', { bubbles: true }));
    const event = await eventPromise;
    expect(event.detail.id).to.equal('temperature');
    expect(event.detail.value).to.equal(1.5);
  });

  // === Number input events ===

  it('dispatches events on number input change', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .values=${{ max_tokens: 1024 }}
      ></loquix-parameter-panel>`,
    );
    const numberInput = getShadowPart(el, 'number-input') as HTMLInputElement;
    const eventPromise = waitForEvent(el, 'loquix-parameter-commit');
    numberInput.value = '2048';
    numberInput.dispatchEvent(new Event('change', { bubbles: true }));
    const event = await eventPromise;
    expect(event.detail.id).to.equal('max_tokens');
    expect(event.detail.value).to.equal(2048);
  });

  it('number input clamps value to min/max', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .values=${{ max_tokens: 1024 }}
      ></loquix-parameter-panel>`,
    );
    const numberInput = getShadowPart(el, 'number-input') as HTMLInputElement;
    const eventPromise = waitForEvent(el, 'loquix-parameter-change');
    numberInput.value = '99999';
    numberInput.dispatchEvent(new Event('change', { bubbles: true }));
    const event = await eventPromise;
    // max_tokens has max: 4096
    expect(event.detail.value).to.equal(4096);
  });

  // === Uses default values from parameter definition ===

  it('uses default value from parameter definition when no value provided', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${mockParams}></loquix-parameter-panel>`,
    );
    // Toggle should use default: true
    const toggle = getShadowPart(el, 'toggle-btn')!;
    expect(toggle.getAttribute('aria-checked')).to.equal('true');
  });

  // === Preset applies all values ===

  it('selecting preset applies all preset values', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel
        .parameters=${mockParams}
        .presets=${mockPresets}
      ></loquix-parameter-panel>`,
    );
    const presets = getShadowParts(el, 'preset');
    presets[1].click();
    await el.updateComplete;
    expect(el.values.temperature).to.equal(0.1);
    expect(el.values.stream).to.be.false;
    expect(el.values.max_tokens).to.equal(512);
  });

  it('shows descriptions in non-compact mode for params with descriptions', async () => {
    const el = await fixture<LoquixParameterPanel>(
      html`<loquix-parameter-panel .parameters=${mockParams}></loquix-parameter-panel>`,
    );
    const desc = el.shadowRoot!.querySelector('.param__description');
    expect(desc).to.exist;
    expect(desc!.textContent).to.equal('Creativity level');
  });
});
