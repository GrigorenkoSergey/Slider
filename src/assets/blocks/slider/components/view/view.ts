import EventObserver from '../../../helpers/event-observer';
import {ISubscriber} from '../../../helpers/interfaces';

import Stretcher from './components/stretcher';
import Scale from './components/scale';
import ThumbsTwinsBrothers from './components/thumbs-twins-brothers';

// import debuggerPoint from '../../../helpers/debugger-point';

type Obj = {[key: string]: any};
type ViewUpdateDataFormat = {
  'L': {x: number, offset: number},
  'R': {x: number, offset: number}
};

export default class View extends EventObserver implements ISubscriber {
  el: HTMLDivElement;
  className: string = 'slider';
  angle: number = 0;
  step: number = 10;
  min: number = 0;
  max: number = 100;
  range: boolean = true;
  selector: string = '';
  hintAboveThumb = true;
  hintEl: HTMLDivElement;
  thumbLeft: HTMLDivElement;
  thumbRight: HTMLDivElement;
  thumbs: ThumbsTwinsBrothers;

  scale: Scale;
  showScale: boolean = true;
  rangeValue: any[] = [];

  stretcher: Stretcher; // Ну как назвал, так назвал...

  constructor(options: Obj) {
    super();
    const argsRequire = ['min', 'max', 'selector'];

    if (!argsRequire.every((key) => key in options)) {
      throw new Error(
        `Not enough values. Should be at least 
        "${argsRequire.join('", "')}" in options`);
    }

    this.setOptions.call(this, options);
    if (!('step' in options) || this.step === 0) {
      this.step = (this.max - this.min) / 100;
    }

    this.render(true);
  }

  setOptions(options: {[key: string]: any}) {
    const expectant: Obj = {};
    Object.keys(options).filter((prop) => prop in this)
      .forEach((prop) => expectant[prop] = options[prop]);

    // ATTENTION: _validateOptions is dirty function!
    this._validateOptions(expectant) && Object.assign(this, expectant);

    this.scale && this.scale.update();
    this.thumbs && this.thumbs.update('', null);
    this.stretcher && this.stretcher.update();
    return this;
  }

  getOptions() {
    const publicOtions = ['min', 'max', 'range', 'step',
      'className', 'selector', 'hintAboveThumb',
      'angle', 'showScale', 'rangeValue'];

    const obj: Obj = {};
    publicOtions.forEach((key) => obj[key] = this[<keyof this>key]);
    return obj;
  }

  update(eventType: string, data: ViewUpdateDataFormat): this {
    this.thumbs.update(eventType, data);
    this.stretcher.update();
    this.el.style.transform = `rotate(${this.angle}deg)`;
    return this;
  }

  render(firstTime?: true): this {
    if (firstTime) {
      const wrapper = document.querySelector(this.selector);
      [this.el, this.hintEl] =
        new Array(2).fill(1).map(() => document.createElement('div'));
      wrapper.append(this.el);

      this.stretcher = new Stretcher(this);

      // Come, brothers!! COME!!!!
      this.thumbs = new ThumbsTwinsBrothers(this);
      this.thumbLeft = this.thumbs.thumbLeft;
      this.thumbRight = this.thumbs.thumbRight;
      this.scale = new Scale({view: this});
    }

    this.el.classList.add(this.className);

    this.hintEl.className = `${this.className}__hint`;
    this.hintEl.textContent = 'HINT!';
    this.el.style.transform = `rotate(${this.angle}deg)`;

    const scaleWidth = this.el.clientWidth - this.thumbLeft.offsetWidth;
    this.scale.width = scaleWidth;
    this.scale.renderAnchors();
    return this;
  }

  private _validateOptions(expectant: Obj): never | true {
    const obj: Obj = Object.assign({}, this);
    Object.assign(obj, expectant);

    const shouldBeNumbers: string[] = ['max', 'min', 'step', 'angle'];
    shouldBeNumbers.forEach((key) => obj[key] = Number(obj[key]));

    const {min, max, step, angle} = obj;

    if (!isFinite(min)) throw new Error('min should be a number!');
    if (!isFinite(max)) throw new Error('max should be a number!');
    if (!isFinite(step)) throw new Error('step should be a number!');
    if (!isFinite(angle)) throw new Error('angle should be a number!');

    if (max < min) throw new Error('max should be greater then min!');
    if (angle < 0 || angle > 90) {
      throw new Error('angle should be >= 0 and <= 90');
    }
    Object.assign(expectant, obj);

    return true;
  }
}