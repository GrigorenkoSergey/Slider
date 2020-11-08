import BindedInput from '../components/binded-input';
import Presenter from '../../slider/components/presenter/presenter';

import '../../helpers/types';

export default class SliderOptionsPalette {
  el: HTMLDivElement = null;
  slider: Presenter = null;
  min: BindedInput = null;
  max: BindedInput = null;
  step: BindedInput = null;
  angle: BindedInput = null;
  thumbLeftPos: BindedInput = null;
  thumbRightPos: BindedInput = null;
  range: BindedInput = null;
  hintAboveThumb: BindedInput = null;
  showScale: BindedInput = null;
  hintAlwaysShow: BindedInput = null;
  partsNum: BindedInput = null;

  constructor(elem: HTMLDivElement, slider: Presenter) {
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
    Object.keys(this).forEach(prop => {
      if (prop === 'el' || prop === 'slider') return;

      const obj: Obj = {};
      obj[prop] = new BindedInput(this.el.querySelector(`[name=${prop}]`), this.slider, prop);
      obj[prop].update();

      Object.assign(this, obj);
    });
  }
}
