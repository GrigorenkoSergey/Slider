import EventObserver from '../../helpers/event-observer';
import BindedInput from '../components/binded-input';
import {Slider} from '../../slider/slider';

import {Obj} from '../../helpers/types';

export default class SliderOptionsPalette extends EventObserver{
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

  render() {
    const inputTextes = [
      'min',
      'max', 
      'step', 
      'angle', 
      'thumbLeftPos', 
      'thumbRightPos', 
      'partsNum',
      'precision'
    ];

    const inputCheckboxes = [
      ["range", "Диапазон"], 
      ["hintAboveThumb", "Подсказка"], 
      ["showScale", "Покaзать шкалу"],
      ["hintAlwaysShow", "Всегда показывать подсказку"],
    ];


    const ul = document.createElement('ul');
    ul.className = 'slider-options';

    inputTextes.forEach(inputName => {
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

  init() {
    const inputs = [
      "min",
      "max",
      "step",
      "angle",
      "thumbLeftPos",
      "thumbRightPos",
      "range",
      "hintAboveThumb",
      "showScale",
      "hintAlwaysShow",
      "partsNum",
      "precision",
    ];

    inputs.forEach(prop => {
      const obj: Obj = {};
      const input = this.el.querySelector(`[name=${prop}]`) as HTMLInputElement;
      obj[prop] = new BindedInput(input, this.slider, prop);
      obj[prop].update();

      Object.assign(this, obj);
    });

    this.slider.addSubscriber('changeSlider', this);
    this.handleRangeChange();
    this.handleHintAlwaysShowChange();
  }

  update(eventType: string, originEvent: string) {

    if (originEvent === 'range') {
      this.handleRangeChange();
    } else if (originEvent === 'hintAlwaysShow') {
      this.handleHintAlwaysShowChange();
    }

  }

  handleRangeChange() {
    const opts = this.slider.getOptions();
    if (opts.range === false) {
      this.thumbRightPos.el.setAttribute('disabled', 'true');
      this.thumbRightPos.el.value = opts.thumbRightPos;
    } else {
      this.thumbRightPos.el.removeAttribute('disabled');
    }
  }

  handleHintAlwaysShowChange() {
    const opts = this.slider.getOptions();
    if (opts.hintAlwaysShow) {
      this.hintAboveThumb.el.setAttribute('disabled', 'true');
    } else {
      this.hintAboveThumb.el.removeAttribute('disabled');
    }
  }
}
