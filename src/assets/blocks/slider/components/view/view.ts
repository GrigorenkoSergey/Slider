/* eslint-disable no-restricted-globals */
/* eslint-disable no-underscore-dangle */
import EventObserver from '../../../helpers/event-observer';
import { ISubscriber } from '../../../helpers/interfaces';

import Stretcher from './components/stretcher';
import Scale from './components/scale';
import Thumbs from './components/thumbs';

import { Obj } from '../../../helpers/types';
import Hint from './components/hint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../helpers/debugger-point';

export default class View extends EventObserver implements ISubscriber {
  public el: HTMLDivElement = document.createElement('div');

  private options = {
    className: 'slider',
    selector: '',
    angle: 0,
    step: 1 / 100, // 0 < step <= 1
    range: false,
    hintAboveThumb: true,
    hintAlwaysShow: false,
    showScale: true,
    partsNum: 2,
  }

  public hints!: Hint[];

  public thumbs!: Thumbs;

  public scale!: Scale;

  public stretcher!: Stretcher;

  constructor(options: Obj) {
    super();

    if (!('selector' in options)) {
      throw new Error('option "selector" should be in options');
    }

    this.options.selector = options.selector;
    this.setOptions(options);
    this.init();
  }

  private init(): this {
    const wrapper = document.querySelector(this.options.selector) as HTMLDivElement;
    wrapper.append(this.el);

    this.el.style.transform = `rotate(${this.options.angle}deg)`;
    this.el.classList.add(this.options.className);

    this.thumbs = new Thumbs(this);
    this.thumbs.addSubscriber('thumbMousemove', this);
    this.thumbs.addSubscriber('thumbMousedown', this);
    this.thumbs.addSubscriber('thumbMouseup', this);

    this.el.addEventListener('click', this.handleSliderClick.bind(this));

    this.hints = [
      new Hint(
        this,
        this.thumbs.thumbLeft,
      ),
      new Hint(
        this,
        this.thumbs.thumbRight,
      ),
    ];

    this.scale = new Scale({ view: this });
    this.scale.addSubscriber('anchorClick', this);

    this.stretcher = new Stretcher(this);

    this.addSubscriber('hintAlwaysShow', this);
    this.addSubscriber('angle', this);
    this.addSubscriber('range', this);

    return this;
  }

  public setOptions(options: Obj) {
    const expectant: Obj = {};

    Object.keys(options)
      .filter((prop) => prop in this.options)
      .forEach((prop) => { expectant[prop] = options[prop]; });

    Object.entries(expectant).forEach(([prop, value]) => {
      this.validateOptions(prop, value);
    });

    Object.assign(this.options, expectant);
    Object.entries(expectant).forEach(([prop, value]) => {
      this.broadcast(prop, value);
    });

    return this;
  }

  public getOptions() {
    const obj = { ...this.options };
    return obj;
  }

  public update(eventType: string, data: any): this {
    // если View подписан сам на себя, то он должен выходить из
    // функции, иначе получится бесконечный цикл
    if (eventType === 'angle') {
      this.el.style.transform = `rotate(${this.options.angle}deg)`;
      return this;
    }

    if (eventType === 'hintAlwaysShow') {
      if (this.options.hintAlwaysShow) {
        this.hints.forEach((hint) => hint.showHint());
      } else {
        this.hints.forEach((hint) => hint.hideHint());
      }
      return this;
    }

    if (eventType === 'thumbMousedown') {
      const thumb = data.el;
      this.handleThumbMousedown(thumb);
    } else if (eventType === 'thumbMouseup') {
      const { thumb } = data;
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

  public moveThumbToPos(thumb: HTMLDivElement, offset: number) {
    this.thumbs.moveThumbToPos.call(this.thumbs, thumb, offset);

    let data = null;

    if (thumb === this.thumbs.thumbLeft) {
      data = { left: offset };
    } else {
      data = { right: offset };
    }

    this.handleHintsIntersection();
    this.broadcast('thumbProgramMove', data);
  }

  public setAnchorValues(values: number[] | string[]) {
    this.scale.setAnchorValues(values);
    this.handleHintsIntersection();
  }

  public setHintValue(thumb: HTMLDivElement, value: string) {
    const hint = (thumb === this.thumbs.thumbLeft) ? this.hints[0] : this.hints[1];
    hint.setHintValue(value);
    this.handleHintsIntersection();
  }

  private handleAnchorClick(offset: number): void {
    const closestThumb = this.findClosestThumb(offset);
    this.moveThumbToPos(closestThumb, offset);
    this.handleHintsIntersection();
  }

  private handleThumbMousedown(thumb: HTMLDivElement) {
    if (!this.options.hintAboveThumb) return;

    const hint = (thumb === this.thumbs.thumbLeft) ? this.hints[0] : this.hints[1];
    hint.showHint();
  }

  private handleThumbMouseup(thumb: HTMLElement) {
    const hint = (thumb === this.thumbs.thumbLeft) ? this.hints[0] : this.hints[1];

    if (!this.options.hintAlwaysShow) {
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

    const cosA: number = Math.cos((this.options.angle / 180) * Math.PI);
    const sinA: number = Math.sin((this.options.angle / 180) * Math.PI);

    const newLeftX: number = e.clientX - startX;
    const newLeftY: number = e.clientY - startY;

    let newLeft = newLeftX * cosA + newLeftY * sinA;
    let offset = newLeft / this.scale.width;
    const closestThumb = this.findClosestThumb(offset);

    newLeft = Math.max(newLeftX * cosA + newLeftY * sinA);
    newLeft = Math.min(newLeft, this.scale.width + closestThumb.offsetWidth / 2);

    offset = newLeft / this.scale.width;
    // да, еще раз, т.к. у меня разные привязки, и я должен предварительно найти closestThumb

    offset -= closestThumb.offsetWidth / this.scale.width / 2;
    offset = Math.max(0, offset);
    offset = Math.round(offset / this.options.step) * this.options.step;

    this.moveThumbToPos(closestThumb, offset);
  }

  private validateOptions(key: string, value: any) {
    const validator: Obj = {
      step: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('step should be a number!');
        }

        if (val > 1) {
          throw new Error('step is too big!');
        } else if (val < 0) {
          throw new Error('step is negative!');
        } else if (val === 0) {
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
    };

    if (!(key in validator)) return;
    return validator[key](value);
  }

  private findClosestThumb(offset: number) {
    const { thumbLeft, thumbRight } = this.thumbs;

    let closestThumb;

    if (this.options.range) {
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
    if (!this.options.hintAlwaysShow || !this.options.range) return false;

    const [leftHint, rightHint] = this.hints.map((hint) => hint.el);
    let result = false;

    /*
     Если просто сравнивать границы текста и находить их пересечения,
     то для не моноширных шрифтов текст бOльших значений подсказок
     может иметь меньшую длину, и появится мигание текста
     при передвижении бегунка (подсказки соединились, разъединились,
     снова соединились), поэтому унифицируем длину для
     всех возможных значений подсказки
    */
    const zerosTextContent = new Array(leftHint.textContent?.length).fill('0').join('');
    leftHint.textContent = zerosTextContent;
    const zerosHintRect = leftHint.getBoundingClientRect();

    leftHint.textContent = this.hints[0].value;
    const leftHintRect = leftHint.getBoundingClientRect();

    let longestLeftHintRect;

    if (zerosHintRect.width < leftHintRect.width) {
      longestLeftHintRect = leftHintRect;
    } else {
      longestLeftHintRect = zerosHintRect;
    }

    const rightHintRect = rightHint.getBoundingClientRect();

    result = (longestLeftHintRect.right >= rightHintRect.left
      && longestLeftHintRect.bottom >= rightHintRect.top);

    return result;
  }

  private handleHintsIntersection() {
    if (!this.options.hintAlwaysShow) return;

    this.hints.forEach((hint) => hint.showHint());

    if (this.checkHintsIntersection()) {
      /*
       добавим модификатор, чтобы можно было потом как-то выбрать с помощью
       javascript, к примеру, чтобы подвинуть подсказку как нужно пользователю
      */
      this.hints[0].el.classList.add(`${this.options.className}__hint_summary`);
      this.hints[1].hideHint();

      const leftValue = this.hints[0].value;
      const rightValue = this.hints[1].value;

      if (leftValue !== rightValue) {
        const textContent = `${leftValue}...${rightValue}`;
        this.hints[0].el.textContent = textContent;
      }
    } else {
      this.hints[0].el.classList.remove(`${this.options.className}__hint_summary`);
    }
  }
}
