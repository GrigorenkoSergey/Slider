/* eslint-disable @typescript-eslint/no-unused-vars */
import EventObserver from '../../../helpers/event-observer';
import {ISubscriber} from '../../../helpers/interfaces';

import Stretcher from './components/stretcher';
import Scale from './components/scale';
import Thumbs from './components/thumbs';

import '../../../helpers/types';
import Hint from './components/hint';

import debuggerPoint from '../../../helpers/debugger-point';

export default class View extends EventObserver implements ISubscriber {
  el: HTMLDivElement = document.createElement('div');
  className: string = 'slider';

  step: number = 1/100; // 0 < step <= 1
  angle: number = 0;
  range: boolean = false;
  selector: string = '';
  hintAboveThumb = true;

  hints: Hint[];
  hintAlwaysShow: boolean = false;

  thumbs: Thumbs;

  scale: Scale;
  showScale: boolean = true;
  partsNum: number = 2;
  stretcher: Stretcher;

  constructor(options: Obj) {
    super();
    const argsRequire = ['selector'];

    if (!argsRequire.every((key) => key in options)) {
      throw new Error(
        `Not enough values. Should be at least 
        "${argsRequire.join('", "')}" in options`);
    }

    this.setOptions(options);
    this.init();
  }

  init(): this {
    const wrapper = document.querySelector(this.selector);
    wrapper.append(this.el);

    this.el.style.transform = `rotate(${this.angle}deg)`;
    this.el.classList.add(this.className);

    this.thumbs = new Thumbs(this);
    this.thumbs.addSubscriber('thumbMousemove', this);
    this.thumbs.addSubscriber('thumbMousedown', this);
    this.thumbs.addSubscriber('thumbMouseup', this);

    this.hints = [
      new Hint(
        this, 
        this.thumbs.thumbLeft),
      new Hint(
        this, 
        this.thumbs.thumbRight),
    ];

    this.scale = new Scale({view: this});
    this.scale.addSubscriber('anchorClick', this);

    this.stretcher = new Stretcher(this);

    this.addSubscriber('hintAlwaysShow', this);
    this.addSubscriber('angle', this);

    return this;
  }

  setOptions(options: Obj) {
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

  getOptions() {
    const publicOtions = [
      'step',
      'range', 
      'className',
      'selector', 
      'hintAboveThumb',
      'hintAlwaysShow',
      'angle', 
      'showScale', 
      'partsNum',
    ];

    const obj: Obj = {};
    publicOtions.forEach((key) => obj[key] = this[<keyof this>key]);
    return obj;
  }

  update(eventType: string, data: any): this {
    // если View подписан сам на себя, то он должен выходить из 
    // функции, иначе получится бесконечный цикл
    if (eventType === 'angle') {
      this.el.style.transform = `rotate(${this.angle}deg)`;
      this.rotateHints(this.angle);
      return this;

    } else if (eventType === 'rerenderScale') {
      this.handleScaleRerender(this.angle);

    } else if (eventType === 'hintAlwaysShow') {
      if (this.hintAlwaysShow) {
        this.hints.forEach(hint => hint.showHint());
      } else {
        this.hints.forEach(hint => hint.hideHint());
      }
      return this; 

    } else if (eventType === 'thumbMousedown') {
      const thumb = data.el;
      this.handleThumbMousedown(thumb);

    } else if (eventType === 'thumbMousemove') {
      const thumb = data.el;
      this.handleThumbMousemove(thumb);

    } else if (eventType === 'thumbMouseup') {
      const thumb = data.thumb;
      this.handleThumbMouseup(thumb);

    } else if (eventType === 'anchorClick') {
      this.handleAnchorClick(data);
    }

    this.broadcast(eventType, data);
    return this;
  }

  moveThumbToPos(thumb: HTMLDivElement, offset: number) {
    this.thumbs.moveThumbToPos.call(this.thumbs, thumb, offset, this);

    let data = null;
    if(thumb === this.thumbs.thumbLeft) {
      data = {left: offset};
    } else {
      data = {right: offset}
    }
    this.broadcast('thumbProgramMove', data);
  }

  setAnchorValues(values: number[] | string[]) {
    this.scale.setAnchorValues(values);
  }

  setHintValue(thumb: HTMLDivElement, value: string) {
    const hint = (thumb === this.thumbs.thumbLeft) ? this.hints[0] : this.hints[1];
    hint.setHintValue(value);
    this.rotateHints(this.angle);
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

    this.moveThumbToPos(closestThumb, offset);
  }

  handleThumbMousedown(thumb: HTMLDivElement) {
    if (!this.hintAboveThumb) return;

    const hint = (thumb === this.thumbs.thumbLeft) ? this.hints[0] : this.hints[1];
    hint.showHint();
  }

  handleThumbMouseup(thumb: HTMLElement) {
    const hint = (thumb === this.thumbs.thumbLeft) ? this.hints[0] : this.hints[1];

    if (!this.hintAlwaysShow) {
      hint.hideHint();
    }
  }

  handleThumbMousemove(thumb: HTMLElement) {
    if (!this.hintAboveThumb) return;

    const hint = (thumb === this.thumbs.thumbLeft) ? this.hints[0] : this.hints[1];
    hint.showHint();
  }

  handleScaleRerender(angle: number) {
    const {sin, PI} = Math;
    let radAngle = angle * PI / 180;

    const scaleStyles = getComputedStyle(this.scale.el);
    let scaleTransform = ` translateY(${parseFloat(scaleStyles.top) * sin(radAngle)}px)`;
    this.scale.el.style.transform = scaleTransform;

    this.scale.anchors.forEach(anchor => {
      anchor.style.transformOrigin = 'right top';
      let transformation = `rotate(-${angle}deg)`;

      if (this.angle <= 45) {
        transformation += ` translateX(${50 * (1 - sin(2 * radAngle))}%)`;
      }
      transformation += ` translateY(${-50 * sin(radAngle)}%)`;

      anchor.style.transform = transformation;
    });
  }

  rotateHints(angle: number) {
    this.hints.map(hint => hint.el).forEach(hint => {
      let transformation = `rotate(-${angle}deg)`;
      hint.style.transform = transformation;
      hint.style.transformOrigin = 'left';

      const {sin, PI} = Math;
      let radAngle = angle * PI / 180;

      if (this.angle <= 45) {
        transformation += ` translateX(${-50 * (1 -  sin(2 * radAngle))}%)`;
        hint.style.transform = transformation;
      }
    });
  }
  private validateOptions(key: string, value: any, expectant: Obj) {
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
    }

    if (!(key in validator)) return;
    return validator[key](value);
  }
}
