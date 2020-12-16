import EventObserver from '../../helpers/event-observer';
import BindedInput from './binded-input';
import { Slider } from '../../slider/slider';
import { isObjKey } from '../../helpers/functions/is-obj-key';

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
    ul.className = 'slider-options';

    inputTextes.forEach((inputName) => {
      const li = document.createElement('li');
      li.className = 'slider-options__li';
      li.textContent = inputName;

      const input = document.createElement('input');
      input.className = 'slider-options__input';
      input.type = 'text';
      input.name = inputName;

      li.append(input);
      ul.append(li);
    });

    const liCheckbox = document.createElement('li');
    liCheckbox.className = 'slider-options__li slider-options__li_checkbox';

    inputCheckboxes.forEach(([name, alias]) => {
      const label = document.createElement('label');
      label.className = 'slider-options__label';
      label.textContent = alias;

      const input = document.createElement('input');
      input.className = 'slider-options__checkbox';
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

    Object.keys(inputs).forEach((prop) => {
      const input: HTMLInputElement | null = this.el.querySelector(`[name=${prop}]`);

      if (input === null) {
        throw new Error(`There is no input with name "${prop}" in current palette!`);
      }

      if (isObjKey(inputs, prop)) {
        this[prop] = new BindedInput(input, this.slider, prop);
        this[prop].update();
      }
    });

    this.slider.addSubscriber('changeSlider', this);
    this.handleRangeChange();
    this.handleHintAlwaysShowChange();
  }

  update(eventType: string, originEvent: any) {
    if (originEvent === 'range') {
      this.handleRangeChange();
    } else if (originEvent === 'hintAlwaysShow') {
      this.handleHintAlwaysShowChange();
    }
  }

  private handleRangeChange() {
    const opts = this.slider.getOptions();
    if (opts.range === false) {
      this.thumbRightPos.el.setAttribute('disabled', 'true');
      this.thumbRightPos.el.value = String(opts.thumbRightPos);
    } else {
      this.thumbRightPos.el.removeAttribute('disabled');
    }
  }

  private handleHintAlwaysShowChange() {
    const opts = this.slider.getOptions();
    if (opts.hintAlwaysShow) {
      this.hintAboveThumb.el.setAttribute('disabled', 'true');
    } else {
      this.hintAboveThumb.el.removeAttribute('disabled');
    }
  }
}
