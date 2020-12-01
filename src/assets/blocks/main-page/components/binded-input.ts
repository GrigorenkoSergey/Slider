// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../helpers/debugger-point';
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
    this.slider.addSubscriber(this.prop, this);
    this.el.addEventListener('change', this.handleInputChange.bind(this));
  }

  update(): void {
    const propValue = this.slider.getOptions()[this.prop];
    this.setValue(propValue);
  }

  handleInputChange() {
    let newValue;
    
    if (this.el.type === 'checkbox') {
      newValue = this.el.checked;
    } else {
      newValue = this.el.value;
    }

    const oldValue = this.slider.getOptions()[this.prop];

    if (typeof oldValue === 'number') {
      newValue = Number(newValue);
    }

    try {
      this.slider.setOptions({[this.prop]: newValue});
    } catch(e) {
      console.log(e.message);
      this.slider.setOptions({[this.prop]: oldValue});
      this.setValue(oldValue)
    }
  }

  setValue(value: string | boolean) {
    if (this.el.type === 'text') {
      this.el.value = <string>value
    } else if (this.el.type === 'checkbox') {
      this.el.checked = <boolean>value;
    }
    this.broadcast(String(this.prop), value);
  }
}