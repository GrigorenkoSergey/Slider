/* eslint-disable @typescript-eslint/no-unused-vars */
import EventObserver from '../../../helpers/event-observer';
import {ISubscriber} from '../../../helpers/interfaces';

// import Stretcher from './components/stretcher';
import Scale from './components/scale';
import Thumbs from './components/thumbs';

import '../../../helpers/types';

// import debuggerPoint from '../../../helpers/debugger-point';

export default class View extends EventObserver implements ISubscriber {
  el: HTMLDivElement;
  className: string = 'slider';

  step: number = 1/100;
  angle: number = 0;
  range: boolean = true;
  selector: string = '';
  hintAboveThumb = true;

  hintEl: HTMLDivElement;
  hintAlwaysShow: false;

  thumbs: Thumbs;

  scale: Scale;
  showScale: boolean = true;
  parts: number = 2;
  rangeValue: any[] = [];
  // stretcher: Stretcher; // Ну как назвал, так назвал...


  constructor(options: Obj) { // пока не лезь сюда. Вроде все нормально.
    super();
    const argsRequire = ['selector'];

    if (!argsRequire.every((key) => key in options)) {
      throw new Error(
        `Not enough values. Should be at least 
        "${argsRequire.join('", "')}" in options`);
    }

    this.setOptions(options);
    this.render();
  }

  setOptions(options: Obj) {// не лезь
    const expectant: Obj = {};

    Object.keys(options).filter((prop) => prop in this)
      .forEach((prop) => expectant[prop] = options[prop]);

    Object.entries(expectant).forEach(([prop, value]) => {
      this.validateOptions(prop, value, expectant);
    });

    Object.assign(this, expectant);
    Object.entries(expectant).forEach(([prop, value]) => {
      this.broadcast(prop, value);
    });

    return this;
  }

  getOptions() { // Не лезь..
    const publicOtions = [
      'step',
      'range', 
      'className',
      'selector', 
      'hintAboveThumb',
      'angle', 
      'showScale', 
      'parts',
      // 'rangeValue'
    ];

    const obj: Obj = {};
    publicOtions.forEach((key) => obj[key] = this[<keyof this>key]);
    return obj;
  }

  update(eventType: string, data: any): this { // пока ересь
    if (eventType === 'angle') {
      this.el.style.transform = `rotate(${this.angle}deg)`;

    } else if (eventType === 'thumbMove') {
      this.broadcast('changeView', data);

    } else if (eventType === 'anchorClick') {
      this.handleAnchorClick(data);
    } 

    return this;
  }

  render(): this { //отдельно переписать потом вызов хинта                                                                                                                   
    const wrapper = document.querySelector(this.selector);
    [this.el, this.hintEl] = new Array(2).fill(1).map(() => document.createElement('div'));
    wrapper.append(this.el);

    this.hintEl.className = `${this.className}__hint`;
    this.el.style.transform = `rotate(${this.angle}deg)`;
    this.el.classList.add(this.className);

    this.thumbs = new Thumbs(this);
    this.thumbs.addSubscriber('thumbMove', this);

    this.scale = new Scale({view: this});
    this.scale.addSubscriber('anchorClick', this);

    this.addSubscriber('angle', this);

    return this;
  }

  handleAnchorClick(offset: number): void {
    const {thumbLeft, thumbRight} = this.thumbs;

    let closestThumb;

    if (this.range) {
      if (offset - this.thumbs.thumbLeftOffset < this.thumbs.thumbRightOffset - offset) {
        closestThumb = thumbLeft;
      } else {
        closestThumb = thumbRight;
      }
    } else {
      closestThumb = thumbLeft;
    }
    this.thumbs.moveThumbToPos(closestThumb, offset);
  }

  private validateOptions(key: string, value: any, expectant: Obj) { //не трогать
    const validator: Obj = {
      step: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('step should be a number!');
        }

        if (val > 1) {
          throw new Error('step is too big!');
        } else if (val < 0) {
          throw new Error('step is negative!');
        } else if (val == 0) {
          throw new Error('step is equal to zero!');
        }
      },

      angle: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('angle should be a number!');
        }

        if (val < 0 || val > 90) {
          throw new Error('angle should be >= 0 and <= 90');
        }
      },

      parts: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('parts should be a number!');
        }

        let step = expectant.step || this.step;
        if (val * step >= 1 + step) {
          throw new Error('Either step or number of parts is too large');
        }
      }
    }

    if (!(key in validator)) return;
    return validator[key](value);
  }
}