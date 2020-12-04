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

  hints!: Hint[];
  hintAlwaysShow: boolean = false;

  thumbs!: Thumbs;
  _thumbLeftOffset!: () => number; 
  _thumbRigthOffset!: () => number;

  scale!: Scale;
  showScale: boolean = true;
  partsNum: number = 2;
  stretcher!: Stretcher;

  constructor(options: Obj) {
    super();

    if (!('selector' in options)) {
      throw new Error('option "selector" should be in options')
    }

    this.selector = options.selector;
    this.setOptions(options);
    this.init();
  }

  private init(): this {
    const wrapper = document.querySelector(this.selector) as HTMLDivElement;
    wrapper.append(this.el);

    this.el.style.transform = `rotate(${this.angle}deg)`;
    this.el.classList.add(this.className);

    this.thumbs = new Thumbs(this);
    this.thumbs.addSubscriber('thumbMousemove', this);
    this.thumbs.addSubscriber('thumbMousedown', this);
    this.thumbs.addSubscriber('thumbMouseup', this);


    this._thumbLeftOffset = () => this.thumbs.thumbLeftOffset;
    this._thumbRigthOffset = () => this.thumbs.thumbRightOffset;

    this.el.addEventListener('click', this.handleSliderClick.bind(this));

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
    this.addSubscriber('range', this);

    return this;
  }

  setOptions(options: Obj) {
    const expectant: Obj = {};

    Object.keys(options)
      .filter(prop => prop in this)
      .filter(prop => !prop.startsWith('_'))
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
      '_thumbLeftOffset',
      '_thumbRightOffset',
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
      return this;

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

    } else if (eventType === 'thumbMouseup') {
      const thumb = data.thumb;
      this.handleThumbMouseup(thumb);

    } else if (eventType === 'anchorClick') {
      this.handleAnchorClick(data);

    } else if (eventType === 'range') {
      this.handleHintsIntersection();
      return this;
    }

    this.broadcast(eventType, data);
    return this;
  }

  moveThumbToPos(thumb: HTMLDivElement, offset: number) {
    this.thumbs.moveThumbToPos.call(this.thumbs, thumb, offset);

    let data = null;
    if(thumb === this.thumbs.thumbLeft) {
      data = {left: offset};
    } else {
      data = {right: offset}
    }
    this.handleHintsIntersection();
    this.broadcast('thumbProgramMove', data);
  }

  setAnchorValues(values: number[] | string[]) {
    this.scale.setAnchorValues(values);
    this.handleHintsIntersection();
  }

  setHintValue(thumb: HTMLDivElement, value: string) {
    const hint = (thumb === this.thumbs.thumbLeft) ? this.hints[0] : this.hints[1];
    hint.setHintValue(value);
    this.handleHintsIntersection();
  }

  private handleAnchorClick(offset: number): void {
    let closestThumb = this.findClosestThumb(offset);
    this.moveThumbToPos(closestThumb, offset);
    this.handleHintsIntersection();
  }

  private handleThumbMousedown(thumb: HTMLDivElement) {
    if (!this.hintAboveThumb) return;

    const hint = (thumb === this.thumbs.thumbLeft) ? this.hints[0] : this.hints[1];
    hint.showHint();
  }

  private handleThumbMouseup(thumb: HTMLElement) {
    const hint = (thumb === this.thumbs.thumbLeft) ? this.hints[0] : this.hints[1];

    if (!this.hintAlwaysShow) {
      hint.hideHint();
    }
  }

  private handleSliderClick(e: MouseEvent) {
    const target = <HTMLElement>e.target;
    const slider = this.el;

    if (target !== this.el && target !== this.stretcher.el) return;

    const sliderCoords: DOMRect = slider.getBoundingClientRect();
    const startX: number = sliderCoords.left + slider.clientLeft;
    const startY: number = sliderCoords.top + slider.clientTop;

    const cosA: number = Math.cos(this.angle / 180 * Math.PI);
    const sinA: number = Math.sin(this.angle / 180 * Math.PI);

    const newLeftX: number = e.clientX - startX;
    const newLeftY: number = e.clientY - startY;

    let newLeft = newLeftX * cosA + newLeftY * sinA;
    let offset = newLeft / this.scale.width;
    let closestThumb = this.findClosestThumb(offset);

    newLeft = Math.max(newLeftX * cosA + newLeftY * sinA);
    newLeft = Math.min(newLeft, this.scale.width + closestThumb.offsetWidth / 2);

    offset = newLeft / this.scale.width;
    //да, еще раз, т.к. у меня разные привязки, и я должен предварительно найти closestThumb
    
    offset = offset - closestThumb.offsetWidth / this.scale.width / 2;
    offset = Math.max(0, offset);
    offset = Math.round(offset / this.step) * this.step;

    this.moveThumbToPos(closestThumb, offset);
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

  private findClosestThumb(offset: number) {
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

    return closestThumb;
  }

  private checkHintsIntersection() {
    if (!this.hintAlwaysShow || !this.range) return;

    const [leftHint, rightHint] = this.hints.map(hint => hint.el);

    /*
     Если просто сравнивать границы текста и находить их пересечения, 
     то для не моноширных шрифтов текст бOльших значений подсказок
     может иметь меньшую длину, и появится мигание текста
     при передвижении бегунка (подсказки соединились, разъединились,
     снова соединились), поэтому унифицируем длину для 
     всех возможных значений подсказки
    */
    const tempTextContent = new Array(leftHint.textContent?.length).fill('0').join(''); 
    leftHint.textContent = tempTextContent;

    let result = this.findElementsIntersection(leftHint, rightHint);

    leftHint.textContent = this.hints[0].value;
    return result.intersection;
  }

  handleHintsIntersection() {
    if (!this.hintAlwaysShow) return;

    this.hints[0].el.style.left = ``;
    this.hints[0].el.style.top = ``;

    this.hints.forEach(hint => hint.showHint());

    if (this.checkHintsIntersection()) {
      const trueIntersectionRect = 
        this.findElementsIntersection(this.hints[0].el, this.hints[1].el);

      this.hints[1].hideHint();

      let leftValue = this.hints[0].value;
      let rightValue = this.hints[1].value;

      let textContent = `${leftValue}`;

      if (leftValue !== rightValue) {
        textContent += `...${rightValue}`;

        this.hints[0].el.textContent = textContent;

        // Пусть теперь центр текста находится посередине между бегунками
        const leftThumbStyles = getComputedStyle(this.thumbs.thumbLeft);
        const rightThumbStyles = getComputedStyle(this.thumbs.thumbRight);
        const diff = parseFloat(rightThumbStyles.left) - parseFloat(leftThumbStyles.left);

        const {cos, PI} = Math;
        let radAngle = this.angle * PI / 180;
        let cosA = cos(radAngle);

        this.hints[0].el.style.left = `${
          -trueIntersectionRect.width * cosA
          + diff * (0.5 - cosA)
        }px`;
      }
    }
  }

  private findElementsIntersection(firstEl: HTMLElement, secondEl: HTMLElement) {
    // firstEl - элемент, расплолженный ближе к началу координат
    const firstElRect = firstEl.getBoundingClientRect();
    const secondElRect = secondEl.getBoundingClientRect();

    let width = 0;
    let height = 0;
    let intersection = false;

    if (firstEl.offsetWidth && secondEl.offsetWidth) {
      width = firstElRect.right - secondElRect.left;
      height = firstElRect.bottom - secondElRect.top;
      intersection = (width >= 0 && height >= 0);

      if (!intersection) {
        width = 0;
        height =  0;
      } 
    }

    return {intersection, width, height};
  }
}
