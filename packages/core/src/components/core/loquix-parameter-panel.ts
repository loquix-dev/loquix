import { LitElement, html, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import type { ParameterDef, ParameterPreset } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type {
  LoquixParameterChangeDetail,
  LoquixParameterCommitDetail,
  LoquixPresetChangeDetail,
} from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-parameter-panel.styles.js';

/**
 * @tag loquix-parameter-panel
 * @summary Panel with sliders, toggles, selects, and number inputs for tuning AI parameters.
 *
 * @csspart panel - The panel container
 * @csspart presets - The presets row
 * @csspart preset - A preset button
 * @csspart param - A parameter row
 * @csspart range - A range slider input
 * @csspart toggle-btn - A toggle switch button
 * @csspart number-input - A number input field
 * @csspart select-input - A select dropdown
 * @csspart advanced-toggle - The show/hide advanced toggle
 *
 * @fires loquix-parameter-change - Fired on every input tick while dragging a slider. Detail: { id, value, values }
 * @fires loquix-parameter-commit - Fired once when user releases a slider or commits a value. Detail: { id, value, values }
 * @fires loquix-preset-change - Fired when a preset is selected. Detail: { preset }
 */
export class LoquixParameterPanel extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Array of parameter definitions. */
  @property({ type: Array })
  parameters: ParameterDef[] = [];

  /** Current parameter values. Key = parameter id, value = current value. */
  @property({ type: Object })
  values: Record<string, unknown> = {};

  /** Array of preset configurations. */
  @property({ type: Array })
  presets: ParameterPreset[] = [];

  /** Currently active preset id. */
  @property({ type: String, attribute: 'active-preset', reflect: true })
  activePreset = '';

  /** Compact mode: hides descriptions and reduces spacing. */
  @property({ type: Boolean, reflect: true })
  compact = false;

  /** Show advanced parameters. */
  @property({ type: Boolean, attribute: 'show-advanced', reflect: true })
  showAdvanced = false;

  /** Whether all controls are disabled. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  // === SVGs ===

  private _chevronSvg = svg`<svg class="advanced-toggle__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

  // === Getters ===

  private get _visibleParams(): ParameterDef[] {
    if (this.showAdvanced) return this.parameters;
    return this.parameters.filter(p => !p.advanced);
  }

  private get _hasAdvancedParams(): boolean {
    return this.parameters.some(p => p.advanced);
  }

  // === Value access ===

  private _getValue(param: ParameterDef): unknown {
    return this.values[param.id] ?? param.default;
  }

  // === Event dispatchers ===

  private _handleParamChange(param: ParameterDef, newValue: unknown): void {
    const updatedValues = { ...this.values, [param.id]: newValue };
    this.values = updatedValues;
    this.activePreset = ''; // Clear preset when manual change
    this.dispatchEvent(
      createLoquixEvent<LoquixParameterChangeDetail>('loquix-parameter-change', {
        id: param.id,
        value: newValue,
        values: updatedValues,
      }),
    );
  }

  private _handlePresetSelect(preset: ParameterPreset): void {
    if (this.disabled) return;
    this.activePreset = preset.id;
    this.values = { ...preset.values };
    this.dispatchEvent(
      createLoquixEvent<LoquixPresetChangeDetail>('loquix-preset-change', {
        preset: preset.id,
      }),
    );
  }

  // === Input handlers ===

  private _handleRangeInput(param: ParameterDef, e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this._handleParamChange(param, val);
  }

  private _dispatchCommit(param: ParameterDef, value: unknown): void {
    this.dispatchEvent(
      createLoquixEvent<LoquixParameterCommitDetail>('loquix-parameter-commit', {
        id: param.id,
        value,
        values: this.values,
      }),
    );
  }

  private _handleRangeCommit(param: ParameterDef, e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this._dispatchCommit(param, val);
  }

  private _handleNumberInput(param: ParameterDef, e: Event): void {
    let val = parseFloat((e.target as HTMLInputElement).value);
    if (isNaN(val)) return;
    if (param.min !== undefined) val = Math.max(param.min, val);
    if (param.max !== undefined) val = Math.min(param.max, val);
    this._handleParamChange(param, val);
    this._dispatchCommit(param, val);
  }

  private _handleToggleClick(param: ParameterDef): void {
    if (this.disabled) return;
    const current = this._getValue(param);
    const newVal = !current;
    this._handleParamChange(param, newVal);
    this._dispatchCommit(param, newVal);
  }

  private _handleSelectChange(param: ParameterDef, e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this._handleParamChange(param, val);
    this._dispatchCommit(param, val);
  }

  private _toggleAdvanced(): void {
    if (this.disabled) return;
    this.showAdvanced = !this.showAdvanced;
  }

  // === Range fill percentage ===

  private _getRangePct(param: ParameterDef): number {
    const val = Number(this._getValue(param)) || 0;
    const min = param.min ?? 0;
    const max = param.max ?? 1;
    return ((val - min) / (max - min)) * 100;
  }

  // === Render helpers ===

  private _renderRange(param: ParameterDef) {
    const val = this._getValue(param);
    const numVal = Number(val);
    const inputId = `param-range-${param.id}`;

    return html`
      <div part="param" class="param">
        <div class="param__header">
          <label class="param__label" for=${inputId}>${param.label}</label>
          <span class="param__value">${numVal}</span>
        </div>
        ${!this.compact && param.description
          ? html`<span class="param__description">${param.description}</span>`
          : nothing}
        <input
          id=${inputId}
          part="range"
          class="param__range"
          type="range"
          .min=${String(param.min ?? 0)}
          .max=${String(param.max ?? 1)}
          .step=${String(param.step ?? 0.01)}
          .value=${String(numVal)}
          ?disabled=${this.disabled}
          style="--range-pct: ${this._getRangePct(param)}%"
          @input=${(e: Event) => this._handleRangeInput(param, e)}
          @change=${(e: Event) => this._handleRangeCommit(param, e)}
        />
        <div class="param__limits">
          <span>${param.min ?? 0}</span>
          <span>${param.max ?? 1}</span>
        </div>
      </div>
    `;
  }

  private _renderToggle(param: ParameterDef) {
    const val = Boolean(this._getValue(param));

    return html`
      <div part="param" class="param param--toggle">
        <div class="param__header">
          <label class="param__label">${param.label}</label>
          <button
            part="toggle-btn"
            class="toggle-btn ${val ? 'toggle-btn--on' : ''}"
            role="switch"
            aria-checked=${val}
            aria-label=${param.label}
            ?disabled=${this.disabled}
            @click=${() => this._handleToggleClick(param)}
          >
            <span class="toggle-btn__thumb"></span>
          </button>
        </div>
        ${!this.compact && param.description
          ? html`<span class="param__description">${param.description}</span>`
          : nothing}
      </div>
    `;
  }

  private _renderNumber(param: ParameterDef) {
    const val = this._getValue(param);
    const inputId = `param-number-${param.id}`;

    return html`
      <div part="param" class="param">
        <div class="param__header">
          <label class="param__label" for=${inputId}>${param.label}</label>
        </div>
        ${!this.compact && param.description
          ? html`<span class="param__description">${param.description}</span>`
          : nothing}
        <input
          id=${inputId}
          part="number-input"
          class="param__number"
          type="number"
          .min=${param.min !== undefined ? String(param.min) : ''}
          .max=${param.max !== undefined ? String(param.max) : ''}
          .step=${String(param.step ?? 1)}
          .value=${String(val ?? '')}
          ?disabled=${this.disabled}
          @change=${(e: Event) => this._handleNumberInput(param, e)}
        />
      </div>
    `;
  }

  private _renderSelect(param: ParameterDef) {
    const val = String(this._getValue(param) ?? '');
    const selectId = `param-select-${param.id}`;

    return html`
      <div part="param" class="param">
        <div class="param__header">
          <label class="param__label" for=${selectId}>${param.label}</label>
        </div>
        ${!this.compact && param.description
          ? html`<span class="param__description">${param.description}</span>`
          : nothing}
        <select
          id=${selectId}
          part="select-input"
          class="param__select"
          ?disabled=${this.disabled}
          @change=${(e: Event) => this._handleSelectChange(param, e)}
        >
          ${param.options?.map(
            opt => html`
              <option value=${opt.value} ?selected=${opt.value === val}>${opt.label}</option>
            `,
          )}
        </select>
      </div>
    `;
  }

  private _renderParam(param: ParameterDef) {
    switch (param.type) {
      case 'range':
        return this._renderRange(param);
      case 'toggle':
        return this._renderToggle(param);
      case 'number':
        return this._renderNumber(param);
      case 'select':
        return this._renderSelect(param);
      default:
        return nothing;
    }
  }

  // === Main render ===

  protected render() {
    return html`
      <div part="panel" class="panel">
        ${this.presets.length > 0
          ? html`
              <div part="presets" class="presets">
                ${this.presets.map(
                  preset => html`
                    <button
                      part="preset"
                      class="preset ${preset.id === this.activePreset ? 'preset--active' : ''}"
                      ?disabled=${this.disabled}
                      @click=${() => this._handlePresetSelect(preset)}
                    >
                      ${preset.label}
                    </button>
                  `,
                )}
              </div>
            `
          : nothing}

        <div class="params">${this._visibleParams.map(p => this._renderParam(p))}</div>

        ${this._hasAdvancedParams
          ? html`
              <button
                part="advanced-toggle"
                class="advanced-toggle"
                ?disabled=${this.disabled}
                @click=${this._toggleAdvanced}
              >
                ${this.showAdvanced
                  ? this._localize.term('parameterPanel.hideAdvanced')
                  : this._localize.term('parameterPanel.showAdvanced')}
                ${this._chevronSvg}
              </button>
            `
          : nothing}
      </div>
    `;
  }
}
