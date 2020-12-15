// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../helpers/debugger-point';
import EventObserver from '../../helpers/event-observer';
import { Slider } from '../../slider/slider';

type propertyKey = keyof ReturnType<Slider['getOptions']>;

export default class BindedInput extends EventObserver {
  el: HTMLInputElement;

  prop: propertyKey;

  slider: Slider;

  constructor(el: HTMLInputElement, slider: Slider, property: propertyKey) {
    super();
    this.el = el;
    this.prop = property;
    this.slider = slider;
    this.init();
  }

  init() {
    this.slider.addSubscriber(String(this.prop), this);
    this.el.addEventListener('change', this.handleInputChange.bind(this));
  }

  update(): void {
    const sliderOptions = this.slider.getOptions();
    const key = this.prop;
    const propValue = sliderOptions[key];

    if (typeof propValue === 'number') {
      this.setValue(String(propValue));
    } else if (typeof propValue === 'string' || typeof propValue === 'boolean') {
      this.setValue(propValue);
    }
  }

  handleInputChange() {
    let newValue;

    if (this.el.type === 'checkbox') {
      newValue = this.el.checked;
    } else {
      newValue = this.el.value;
    }

    const sliderOptions = this.slider.getOptions();
    const oldValue = sliderOptions[this.prop];

    try {
      this.slider.setOptions({ [this.prop]: newValue });
    } catch (e) {
      console.log(e.message);
      this.slider.setOptions({ [this.prop]: oldValue });

      if (typeof oldValue === 'number') {
        this.setValue(String(oldValue));
      } else if (typeof oldValue === 'string' || typeof oldValue === 'boolean') {
        this.setValue(oldValue);
      }
    }
  }

  setValue(value: string | boolean) {
    if (this.el.type === 'text') {
      if (typeof value === 'string') {
        this.el.value = value;
      }
    } else if (this.el.type === 'checkbox') {
      if (typeof value === 'boolean') {
        this.el.checked = value;
      }
    }
    this.broadcast(String(this.prop), value);
  }
}
