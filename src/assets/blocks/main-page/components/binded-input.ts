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
    const { slider, el, prop } = this;
    slider.addSubscriber(String(prop), this);
    el.addEventListener('change', this.handleInputChange.bind(this));
  }

  update(): void {
    const { slider, prop } = this;
    const sliderOptions = slider.getOptions();
    const key = prop;
    const propValue = sliderOptions[key];

    if (typeof propValue === 'number') {
      this.setValue(String(propValue));
    } else if (typeof propValue === 'string' || typeof propValue === 'boolean') {
      this.setValue(propValue);
    }
  }

  handleInputChange() {
    let newValue;
    const { el, slider, prop } = this;

    if (el.type === 'checkbox') {
      newValue = el.checked;
    } else {
      newValue = el.value;
    }

    const sliderOptions = slider.getOptions();
    const oldValue = sliderOptions[prop];

    try {
      slider.setOptions({ [prop]: newValue });
    } catch (e) {
      console.log(e.message);
      slider.setOptions({ [prop]: oldValue });

      if (typeof oldValue === 'number') {
        this.setValue(String(oldValue));
      } else if (typeof oldValue === 'string' || typeof oldValue === 'boolean') {
        this.setValue(oldValue);
      }
    }
  }

  setValue(value: string | boolean) {
    const { el, prop } = this;
    if (el.type === 'text') {
      if (typeof value === 'string') {
        el.value = value;
      }
    } else if (el.type === 'checkbox') {
      if (typeof value === 'boolean') {
        el.checked = value;
      }
    }
    this.broadcast(String(prop), value);
  }
}
