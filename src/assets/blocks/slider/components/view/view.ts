import EventObserver from '../../../helpers/event-observer';
import { SliderEvents } from '../../../helpers/slider-events';
import { ISubscriber } from '../../../helpers/interfaces';

import { ViewOptions } from './components/view-types';
import Stretcher from './components/stretcher';
import Scale from './components/scale';
import Thumbs from './components/thumbs';
import Hint from './components/hint';

export default class View extends EventObserver implements ISubscriber {
  readonly el: HTMLDivElement = document.createElement('div');

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

  private hints: Hint[];

  thumbs: Thumbs;

  scale: Scale | null = null;

  private stretcher: Stretcher;

  constructor(options: ViewOptions) {
    super();
    this.thumbs = new Thumbs(this);
    this.hints = [
      new Hint(this, this.thumbs.thumbLeft),
      new Hint(this, this.thumbs.thumbRight),
    ];

    this.stretcher = new Stretcher(this);
    this.init(options);
  }

  private init(opts: ViewOptions): this {
    if (opts.selector === undefined) {
      throw new Error('You should pass options "selector" in options!');
    }

    this.setOptions(opts);

    const { options, el } = this;
    const { selector } = options;
    const wrapper = document.querySelector(selector);

    if (wrapper === null) {
      throw new Error(`There is no element with selector "${selector}"`);
    }

    wrapper.append(el);

    el.style.transform = `rotate(${options.angle}deg)`;
    el.classList.add(options.className);

    const { thumbs } = this;
    thumbs.addSubscriber('thumbMouseMove', this);
    thumbs.addSubscriber('thumbMouseDown', this);
    thumbs.addSubscriber('thumbMouseUp', this);

    el.addEventListener('click', this.handleSliderClick);

    this.scale = new Scale({ view: this });
    this.scale.addSubscriber('anchorClick', this);

    this.addSubscriber('hintAlwaysShow', this);
    this.addSubscriber('angle', this);
    this.addSubscriber('range', this);

    return this;
  }

  setOptions(options: ViewOptions): this {
    const expectant: ViewOptions = {};

    if (options.step !== undefined) {
      expectant.step = options.step;
    }
    if (options.showScale !== undefined) {
      expectant.showScale = options.showScale;
    }
    if (options.selector !== undefined) {
      expectant.selector = options.selector;
    }
    if (options.range !== undefined) {
      expectant.range = options.range;
    }
    if (options.partsNum !== undefined) {
      expectant.partsNum = options.partsNum;
    }
    if (options.hintAlwaysShow !== undefined) {
      expectant.hintAlwaysShow = options.hintAlwaysShow;
    }
    if (options.hintAboveThumb !== undefined) {
      expectant.hintAboveThumb = options.hintAboveThumb;
    }
    if (options.className !== undefined) {
      expectant.className = options.className;
    }
    if (options.angle !== undefined) {
      expectant.angle = options.angle;
    }

    Object.entries(expectant).forEach(([prop, value]) => {
      this.validateOptions(prop, value);
    });

    this.options = { ...this.options, ...expectant };

    Object.entries(expectant).forEach(([prop, value]) => {
      if (prop in expectant) {
        if (prop === 'angle' || prop === 'partsNum') {
          this.broadcast({ event: prop, value: Number(value) });
        } else if (prop === 'step') {
          this.broadcast({ event: prop, value: Number(value) });
        } else if (prop === 'className' || prop === 'selector') {
          this.broadcast({ event: prop, value: String(value) });
        } else if (prop === 'range' || prop === 'showScale') {
          this.broadcast({ event: prop, value: Boolean(value) });
        } else if (prop === 'hintAboveThumb' || prop === 'hintAlwaysShow') {
          this.broadcast({ event: prop, value: Boolean(value) });
        }
      }
    });
    return this;
  }

  getOptions(): Required<ViewOptions> {
    const obj = { ...this.options };
    return obj;
  }

  update(data: SliderEvents): this {
    // если View подписан сам на себя, то он должен выходить из
    // функции, иначе получится бесконечный цикл
    if (data.event === 'angle') {
      this.el.style.transform = `rotate(${this.options.angle}deg)`;
      return this;
    }

    if (data.event === 'hintAlwaysShow') {
      const { options, hints } = this;
      if (options.hintAlwaysShow) {
        hints.forEach((hint) => hint.appendHint());
      } else {
        hints.forEach((hint) => hint.removeHint());
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

    this.broadcast(data);
    return this;
  }

  moveThumbToPos(thumb: HTMLDivElement, offset: number): void {
    const { thumbs } = this;
    thumbs.moveThumbToPos.call(thumbs, thumb, offset);

    let data: SliderEvents;

    if (thumb === thumbs.thumbLeft) {
      data = { event: 'thumbProgramMove', left: offset };
    } else {
      data = { event: 'thumbProgramMove', right: offset };
    }

    this.handleHintsIntersection();
    this.broadcast(data);
  }

  setAnchorValues(values: number[] | string[]): void {
    const { scale } = this;

    if (scale === null) {
      throw new Error('Scale was not initialized');
    }

    scale.setAnchorValues(values);
    this.handleHintsIntersection();
  }

  setHintValue(thumb: HTMLDivElement, value: string): void {
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

  private handleThumbMouseDown(thumb: HTMLDivElement): void {
    const { thumbs, hints, options } = this;
    if (!options.hintAboveThumb) return;

    const hint = (thumb === thumbs.thumbLeft) ? hints[0] : hints[1];
    hint.appendHint();
  }

  private handleThumbMouseUp(thumb: HTMLElement): void {
    const { thumbs, hints, options } = this;
    const hint = (thumb === thumbs.thumbLeft) ? hints[0] : hints[1];

    if (!options.hintAlwaysShow) {
      hint.removeHint();
    }
  }

  private handleSliderClick = (e: MouseEvent): void => {
    const { target } = e;
    const {
      options, el: slider, stretcher, scale,
    } = this;

    if (scale === null) {
      throw new Error('Scale was not initialized');
    }

    if (target !== slider && target !== stretcher.el) return;

    const sliderCoords: DOMRect = slider.getBoundingClientRect();
    const startX = sliderCoords.left + slider.clientLeft;
    const startY = sliderCoords.top + slider.clientTop;

    const cosA = Math.cos((options.angle / 180) * Math.PI);
    const sinA = Math.sin((options.angle / 180) * Math.PI);

    const newLeftX = e.clientX - startX;
    const newLeftY = e.clientY - startY;

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

  private validateOptions(key: string, value: number | string | boolean | undefined): void {
    const validator = {
      angle: (val: number) => {
        if (val < 0 || val > 90) {
          throw new Error('angle should be >= 0 and <= 90');
        }
      },
    };

    if (key === 'angle') {
      return validator[key](Number(value));
    }
  }

  private findClosestThumb(offset: number): HTMLDivElement {
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

  private checkHintsIntersection(): boolean {
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

  private handleHintsIntersection(): void {
    if (!this.options.hintAlwaysShow) return;

    const { hints, options } = this;
    this.hints.forEach((hint) => hint.appendHint());

    if (this.checkHintsIntersection()) {
      /*
        добавим модификатор, чтобы можно было потом как-то выбрать с помощью
        javascript, к примеру, чтобы подвинуть подсказку как нужно пользователю
      */
      hints[0].el.classList.add(`${options.className}__hint_summary`);
      hints[1].removeHint();

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
