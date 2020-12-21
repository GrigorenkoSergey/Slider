/* eslint-disable no-restricted-globals */
import { isObjKey } from '../../../helpers/functions/is-obj-key';
import { setOption } from '../../../helpers/functions/set-option';
import EventObserver from '../../../helpers/event-observer';
import { ISubscriber, SliderEvents } from '../../../helpers/interfaces';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../helpers/debugger-point';

import { ViewOptions } from './components/view-types';
import Stretcher from './components/stretcher';
import Scale from './components/scale';
import Thumbs from './components/thumbs';
import Hint from './components/hint';

export default class View extends EventObserver implements ISubscriber {
  el: HTMLDivElement = document.createElement('div');

  private options: Required<ViewOptions> = {
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

  hints!: Hint[];

  thumbs!: Thumbs;

  scale!: Scale;

  stretcher!: Stretcher;

  constructor(options: ViewOptions) {
    super();
    this.options.selector = options.selector!;
    this.setOptions(options);
    this.init();
  }

  private init(): this {
    const { options, el } = this;
    const { selector } = options;
    const wrapper = document.querySelector(selector);

    if (wrapper === null) {
      throw new Error(`There is no element with selector "${selector}"`);
    }

    wrapper.append(el);

    el.style.transform = `rotate(${options.angle}deg)`;
    el.classList.add(options.className);

    this.thumbs = new Thumbs(this);
    const { thumbs } = this;
    thumbs.addSubscriber('thumbMouseMove', this);
    thumbs.addSubscriber('thumbMouseDown', this);
    thumbs.addSubscriber('thumbMouseUp', this);

    el.addEventListener('click', this.handleSliderClick.bind(this));

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

  setOptions(options: ViewOptions) {
    let expectant: ViewOptions = {};

    Object.keys(options)
      .forEach((prop) => {
        if (isObjKey(options, prop)) {
          expectant = setOption(expectant, prop, options[prop]);
        }
      });

    Object.entries(expectant).forEach(([prop, value]) => {
      this.validateOptions(prop, value);
    });

    this.options = { ...this.options, ...expectant };

    Object.entries(expectant).forEach(([prop, value]) => {
      if (isObjKey(expectant, prop)) {
        if (prop === 'angle' || prop === 'partsNum') {
          this.broadcast(prop, { event: prop, value: Number(value) });
        } else if (prop === 'step') {
          this.broadcast(prop, { event: prop, value: Number(value) });
        } else if (prop === 'className' || prop === 'selector') {
          this.broadcast(prop, { event: prop, value: String(value) });
        } else if (prop === 'range' || prop === 'showScale') {
          this.broadcast(prop, { event: prop, value: Boolean(value) });
        } else if (prop === 'hintAboveThumb' || prop === 'hintAlwaysShow') {
          this.broadcast(prop, { event: prop, value: Boolean(value) });
        }
      }
    });
    return this;
  }

  getOptions() {
    const obj = { ...this.options };
    return obj;
  }

  update(eventType: string, data: SliderEvents) {
    // если View подписан сам на себя, то он должен выходить из
    // функции, иначе получится бесконечный цикл
    if (data.event === 'angle') {
      this.el.style.transform = `rotate(${this.options.angle}deg)`;
      return this;
    }

    if (data.event === 'hintAlwaysShow') {
      const { options, hints } = this;
      if (options.hintAlwaysShow) {
        hints.forEach((hint) => hint.showHint());
      } else {
        hints.forEach((hint) => hint.hideHint());
      }
      return this;
    }

    if (data.event === 'thumbMouseDown') {
      const { thumb } = data;
      this.handleThumbMouseDown(thumb);
    } else if (data.event === 'thumbMouseUp') {
      const { thumb } = data;
      this.handleThumbMouseUp(thumb);
    } else if (data.event === 'anchorClick') {
      this.handleAnchorClick(data.offset);
    } else if (data.event === 'range') {
      this.handleHintsIntersection();
      return this;
    }

    this.broadcast(eventType, data);
    return this;
  }

  moveThumbToPos(thumb: HTMLDivElement, offset: number) {
    const { thumbs } = this;
    thumbs.moveThumbToPos.call(thumbs, thumb, offset);

    let data: SliderEvents;

    if (thumb === thumbs.thumbLeft) {
      data = { event: 'thumbProgramMove', left: offset };
    } else {
      data = { event: 'thumbProgramMove', right: offset };
    }

    this.handleHintsIntersection();
    this.broadcast('thumbProgramMove', data);
  }

  setAnchorValues(values: number[] | string[]) {
    this.scale.setAnchorValues(values);
    this.handleHintsIntersection();
  }

  setHintValue(thumb: HTMLDivElement, value: string) {
    const { thumbs, hints } = this;
    const hint = (thumb === thumbs.thumbLeft) ? hints[0] : hints[1];
    hint.setHintValue(value);
    this.handleHintsIntersection();
  }

  private handleAnchorClick(offset: number): void {
    const closestThumb = this.findClosestThumb(offset);
    this.moveThumbToPos(closestThumb, offset);
    this.handleHintsIntersection();
  }

  private handleThumbMouseDown(thumb: HTMLDivElement) {
    const { thumbs, hints, options } = this;
    if (!options.hintAboveThumb) return;

    const hint = (thumb === thumbs.thumbLeft) ? hints[0] : hints[1];
    hint.showHint();
  }

  private handleThumbMouseUp(thumb: HTMLElement) {
    const { thumbs, hints, options } = this;
    const hint = (thumb === thumbs.thumbLeft) ? hints[0] : hints[1];

    if (!options.hintAlwaysShow) {
      hint.hideHint();
    }
  }

  private handleSliderClick(e: MouseEvent) {
    const target = <HTMLElement>e.target;
    const {
      options, el: slider, stretcher, scale,
    } = this;

    if (target !== slider && target !== stretcher.el) return;

    const sliderCoords: DOMRect = slider.getBoundingClientRect();
    const startX: number = sliderCoords.left + slider.clientLeft;
    const startY: number = sliderCoords.top + slider.clientTop;

    const cosA: number = Math.cos((options.angle / 180) * Math.PI);
    const sinA: number = Math.sin((options.angle / 180) * Math.PI);

    const newLeftX: number = e.clientX - startX;
    const newLeftY: number = e.clientY - startY;

    let newLeft = newLeftX * cosA + newLeftY * sinA;
    let offset = newLeft / scale.width;
    const closestThumb = this.findClosestThumb(offset);

    newLeft = Math.max(newLeftX * cosA + newLeftY * sinA);
    newLeft = Math.min(newLeft, scale.width + closestThumb.offsetWidth / 2);

    offset = newLeft / scale.width;
    // да, еще раз, т.к. у меня разные привязки, и я должен предварительно найти closestThumb

    offset -= closestThumb.offsetWidth / scale.width / 2;
    offset = Math.max(0, offset);
    offset = Math.round(offset / options.step) * options.step;

    this.moveThumbToPos(closestThumb, offset);
  }

  private validateOptions(key: string, value: any) {
    const validator = {
      step: (val: number) => {
        if (val > 1) {
          throw new Error('step is too big!');
        } else if (val < 0) {
          throw new Error('step is negative!');
        } else if (val === 0) {
          throw new Error('step is equal to zero!');
        }
      },

      angle: (val: number) => {
        if (val < 0 || val > 90) {
          throw new Error('angle should be >= 0 and <= 90');
        }
      },
    };

    if (isObjKey(validator, key)) {
      return validator[key](value);
    }
  }

  private findClosestThumb(offset: number) {
    const { thumbs, options } = this;
    const { thumbLeft, thumbRight } = thumbs;

    let closestThumb;

    if (options.range) {
      if (offset - thumbs.thumbLeftOffset < thumbs.thumbRightOffset - offset) {
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
    const { options, hints } = this;
    if (!options.hintAlwaysShow || !options.range) return false;

    const [leftHint, rightHint] = hints.map((hint) => hint.el);
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

    leftHint.textContent = hints[0].value;
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

    const { hints, options } = this;
    this.hints.forEach((hint) => hint.showHint());

    if (this.checkHintsIntersection()) {
      /*
       добавим модификатор, чтобы можно было потом как-то выбрать с помощью
       javascript, к примеру, чтобы подвинуть подсказку как нужно пользователю
      */
      hints[0].el.classList.add(`${options.className}__hint_summary`);
      hints[1].hideHint();

      const leftValue = hints[0].value;
      const rightValue = hints[1].value;

      if (leftValue !== rightValue) {
        const textContent = `${leftValue} ― ${rightValue}`;
        hints[0].el.textContent = textContent;
      }
    } else {
      hints[0].el.classList.remove(`${options.className}__hint_summary`);
    }
  }
}
