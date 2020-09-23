import EventObserver from '../../helpers/event-observer';
import {Slider} from '../../slider/slider';

export default class BindedInput extends EventObserver {
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

    const oldValue = this.slider.getOptions()[this.prop];

    try {
      this.slider.setOptions({[this.prop]: newValue});
    } catch {
      this.slider.setOptions({[this.prop]: oldValue});
    }

    this.update();
  }
}