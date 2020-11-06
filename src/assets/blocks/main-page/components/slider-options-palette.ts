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

  constructor(elem: HTMLDivElement, slider: Presenter) {
    this.el = elem;
    this.slider = slider;
    this.init();
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
