import EventObserver from '../../../helpers/EventObserver';
import { SliderEvents } from '../../../helpers/slider-events';
import { Slider } from '../../../Slider/Slider';
import BoundedInput from '../BoundedInput/BoundedInput';
import './slider-options-palette.scss';

type SliderOptions = ReturnType<Slider['getOptions']>;
type OptionsKeys = Exclude<keyof SliderOptions, 'alternativeRange' | 'className' | 'selector'>;
export type Inputs = Record<OptionsKeys, (BoundedInput | null)>;

export class SliderOptionsPalette extends EventObserver {
  el: HTMLDivElement;

  slider: Slider;

  inputs: Inputs = {
    angle: null,
    hintAboveThumb: null,
    hintAlwaysShow: null,
    max: null,
    min: null,
    partsAmount: null,
    precision: null,
    range: null,
    showScale: null,
    step: null,
    thumbLeftValue: null,
    thumbRightValue: null,
  };

  constructor(elem: HTMLDivElement, slider: Slider) {
    super();
    this.el = elem;
    this.slider = slider;
    this.render();
    this.init();
  }

  private render() {
    const inputTexts = [
      'min',
      'max',
      'step',
      'angle',
      'thumbLeftValue',
      'thumbRightValue',
      'partsAmount',
      'precision',
    ];

    const ul = document.createElement('ul');
    ul.classList.add('slider-options-palette');

    inputTexts.forEach((inputName) => {
      const li = document.createElement('li');
      li.classList.add('slider-options-palette__li');
      li.textContent = inputName;

      const input = document.createElement('input');
      input.classList.add('slider-options-palette__input');
      input.type = 'text';
      input.name = inputName;

      li.append(input);
      ul.append(li);
    });

    const liCheckbox = document.createElement('li');
    liCheckbox.classList.add('slider-options-palette__li');
    liCheckbox.classList.add('slider-options-palette__li_checkbox');

    const inputCheckboxes = [
      ['range', 'Диапазон'],
      ['hintAboveThumb', 'Подсказка'],
      ['showScale', 'Покaзать шкалу'],
      ['hintAlwaysShow', 'Всегда показывать подсказку'],
    ];

    inputCheckboxes.forEach(([name, alias]) => {
      const label = document.createElement('label');
      label.classList.add('slider-options-palette__label');
      label.textContent = alias;

      const input = document.createElement('input');
      input.classList.add('slider-options-palette__checkbox');
      input.type = 'checkbox';
      input.name = name;

      label.append(input);
      liCheckbox.append(label);
    });
    ul.append(liCheckbox);

    this.el.append(ul);
  }

  private init(): void {
    const inputs: (keyof Inputs)[] = [
      'min', 'max', 'step', 'angle', 'thumbLeftValue', 'thumbRightValue',
      'range', 'hintAboveThumb', 'showScale', 'hintAlwaysShow',
      'partsAmount', 'precision',
    ];

    const { slider, el } = this;

    inputs.forEach((prop) => {
      const input: HTMLInputElement | null = el.querySelector(`[name=${prop}]`);

      if (input === null) {
        throw new Error(`There is no input with name "${prop}" in current palette!`);
      }

      this.inputs[prop] = new BoundedInput(input, slider, prop);
      const boundedInput = this.inputs[prop];
      if (boundedInput !== null) {
        boundedInput.update();
      }
    });

    slider.addSubscriber('changeSlider', this);
    this.handleRangeChange();
    this.handleHintAlwaysShowChange();
  }

  update(data: SliderEvents) {
    if (typeof data.event !== 'string') return;

    if (!('cause' in data)) return;

    if (data.cause === 'range') {
      this.handleRangeChange();
    } else if (data.cause === 'hintAlwaysShow') {
      this.handleHintAlwaysShowChange();
    }
  }

  private handleRangeChange() {
    const { slider, inputs } = this;
    const { thumbRightValue } = inputs;

    if (thumbRightValue === null) return;

    const opts = slider.getOptions();
    if (opts.range === false) {
      thumbRightValue.el.setAttribute('disabled', 'true');
      thumbRightValue.el.value = String(opts.thumbRightValue);
    } else {
      thumbRightValue.el.removeAttribute('disabled');
    }
  }

  private handleHintAlwaysShowChange() {
    const { slider, inputs } = this;
    const { hintAboveThumb } = inputs;
    if (hintAboveThumb === null) return;

    const opts = slider.getOptions();

    if (opts.hintAlwaysShow) {
      hintAboveThumb.el.setAttribute('disabled', 'true');
    } else {
      hintAboveThumb.el.removeAttribute('disabled');
    }
  }
}
