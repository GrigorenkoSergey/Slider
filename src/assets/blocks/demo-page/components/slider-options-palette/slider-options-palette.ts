import { isObjKey } from '../../../helpers/functions/is-obj-key';
import EventObserver from '../../../helpers/event-observer';
import { Slider } from '../../../slider/slider';

import BindedInput from '../binded-input/binded-input';
import './slider-options-palette.scss';

type SliderOptions = ReturnType<Slider['getOptions']>;
type OptionsKeys = Exclude<keyof SliderOptions, 'alternativeRange' | 'className' | 'selector'>;
type Inputs = Record<OptionsKeys, BindedInput>;

export default class SliderOptionsPalette extends EventObserver implements Inputs {
  el: HTMLDivElement;

  slider: Slider;

  min!: BindedInput;

  max!: BindedInput;

  step!: BindedInput;

  angle!: BindedInput;

  thumbLeftPos!: BindedInput;

  thumbRightPos!: BindedInput;

  range!: BindedInput;

  hintAboveThumb!: BindedInput;

  showScale!: BindedInput;

  hintAlwaysShow!: BindedInput;

  partsNum!: BindedInput;

  precision!: BindedInput;

  constructor(elem: HTMLDivElement, slider: Slider) {
    super();
    this.el = elem;
    this.slider = slider;
    this.render();
    this.init();
  }

  private render() {
    const inputTextes = [
      'min',
      'max',
      'step',
      'angle',
      'thumbLeftPos',
      'thumbRightPos',
      'partsNum',
      'precision',
    ];

    const inputCheckboxes = [
      ['range', 'Диапазон'],
      ['hintAboveThumb', 'Подсказка'],
      ['showScale', 'Покaзать шкалу'],
      ['hintAlwaysShow', 'Всегда показывать подсказку'],
    ];

    const ul = document.createElement('ul');
    ul.className = 'slider-options-palette';

    inputTextes.forEach((inputName) => {
      const li = document.createElement('li');
      li.className = 'slider-options-palette__li';
      li.textContent = inputName;

      const input = document.createElement('input');
      input.className = 'slider-options-palette__input';
      input.type = 'text';
      input.name = inputName;

      li.append(input);
      ul.append(li);
    });

    const liCheckbox = document.createElement('li');
    liCheckbox.className = 'slider-options-palette__li slider-options-palette__li_checkbox';

    inputCheckboxes.forEach(([name, alias]) => {
      const label = document.createElement('label');
      label.className = 'slider-options-palette__label';
      label.textContent = alias;

      const input = document.createElement('input');
      input.className = 'slider-options-palette__checkbox';
      input.type = 'checkbox';
      input.name = name;

      label.append(input);
      liCheckbox.append(label);
    });
    ul.append(liCheckbox);

    this.el.append(ul);
  }

  private init() {
    const inputs = {
      min: true,
      max: true,
      step: true,
      angle: true,
      thumbLeftPos: true,
      thumbRightPos: true,
      range: true,
      hintAboveThumb: true,
      showScale: true,
      hintAlwaysShow: true,
      partsNum: true,
      precision: true,
    };

    const { slider, el } = this;
    Object.keys(inputs).forEach((prop) => {
      const input: HTMLInputElement | null = el.querySelector(`[name=${prop}]`);

      if (input === null) {
        throw new Error(`There is no input with name "${prop}" in current palette!`);
      }

      if (isObjKey(inputs, prop)) {
        this[prop] = new BindedInput(input, slider, prop);
        this[prop].update();
      }
    });

    slider.addSubscriber('changeSlider', this);
    this.handleRangeChange();
    this.handleHintAlwaysShowChange();
  }

  update<T>(eventType: string, originEvent: T) {
    if (typeof originEvent !== 'string') return;

    if (originEvent === 'range') {
      this.handleRangeChange();
    } else if (originEvent === 'hintAlwaysShow') {
      this.handleHintAlwaysShowChange();
    }
  }

  private handleRangeChange() {
    const { slider, thumbRightPos } = this;
    const opts = slider.getOptions();
    if (opts.range === false) {
      thumbRightPos.el.setAttribute('disabled', 'true');
      thumbRightPos.el.value = String(opts.thumbRightPos);
    } else {
      thumbRightPos.el.removeAttribute('disabled');
    }
  }

  private handleHintAlwaysShowChange() {
    const { slider, hintAboveThumb } = this;
    const opts = slider.getOptions();
    if (opts.hintAlwaysShow) {
      hintAboveThumb.el.setAttribute('disabled', 'true');
    } else {
      hintAboveThumb.el.removeAttribute('disabled');
    }
  }
}
