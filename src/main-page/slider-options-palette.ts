import {EventObserver} from '../assets/blocks/slider/helpers';
import {Slider} from '../assets/blocks/slider/slider';

type Obj = {[key: string]: any};

class SliderOptionsPalette {
  el: HTMLDivElement = null;
  slider: Slider = null;
  min: BindedInput = null;
  max: BindedInput = null;
  step: BindedInput = null;
  angle: BindedInput = null;
  thumbLeftPos: BindedInput = null;
  thumbRightPos: BindedInput = null;
  range: BindedInput = null;
  hintAboveThumb: BindedInput = null;
  showScale: BindedInput = null;

  constructor(elem: HTMLDivElement, slider: Slider) {
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

class BindedInput extends EventObserver {
  el: HTMLInputElement;
  prop: string;
  slider: Slider;

  constructor(el: HTMLInputElement, slider: Slider, property: string) {
    super();
    this.el = el;
    this.prop = property;
    this.slider = slider;

    this.init();
  }

  init() {
    this.slider.addSubscriber('changeView', this);
    this.el.addEventListener('change', this.handleInputChange.bind(this));
  }

  update(): void {
    const propValue = this.slider.getOptions()[this.prop];

    if (this.el.type === 'text') {
      this.el.value = propValue;
    } else if (this.el.type === 'checkbox') {
      this.el.checked = propValue;
    }
  }

  handleInputChange() {
    let newValue;
    if (this.el.type === 'checkbox') {
      newValue = this.el.checked;
    } else {
      newValue = this.el.value;
    }

    this.slider.setOptions({[this.prop]: newValue});
    console.log(this.slider.getOptions()[this.prop]);
  }
}

export {SliderOptionsPalette};
