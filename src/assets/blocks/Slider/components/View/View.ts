import EventObserver from '../../../helpers/EventObserver';
import { SliderEvents } from '../../../helpers/slider-events';
import { ISubscriber } from '../../../helpers/interfaces';
import { ViewOptions } from './components/view-types';
import { VIEW_OPTIONS_DEFAULT } from './components/view-options-default';
import Stretcher from './components/Stretcher';
import Scale from './components/Scale';
import Thumbs from './components/Thumbs';
import Hint from './components/Hint';

export default class View extends EventObserver implements ISubscriber {
  readonly el: HTMLDivElement = document.createElement('div');

  private options = { ...VIEW_OPTIONS_DEFAULT };

  private hints: Hint[];

  thumbs: Thumbs;

  scale: Scale | null = null;

  private stretcher: Stretcher;

  constructor(options: ViewOptions) {
    super();

    this.thumbs = new Thumbs(this);
    const { thumbLeft, thumbRight } = this.thumbs.getThumbs();
    this.hints = [
      new Hint(this, thumbLeft),
      new Hint(this, thumbRight),
    ];

    this.stretcher = new Stretcher(this);
    this.init(options);
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
    if (options.partsAmount !== undefined) {
      expectant.partsAmount = options.partsAmount;
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
        if (prop === 'angle' || prop === 'partsAmount') {
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
    } else if (data.event === 'swapThumbs') {
      this.hints.reverse();
    } else if (data.event === 'resize') {
      this.handleResize();
      return this;
    }

    this.broadcast(data);
    return this;
  }

  moveThumbToPos(thumb: HTMLDivElement, offset: number): void {
    const { thumbs } = this;
    thumbs.moveThumbToPos.call(thumbs, thumb, offset);

    let data: SliderEvents;
    const { thumbLeft } = thumbs.getThumbs();
    if (thumb === thumbLeft) {
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
    const { thumbLeft } = thumbs.getThumbs();
    const hint = (thumb === thumbLeft) ? hints[0] : hints[1];
    hint.setHintValue(value);
    this.handleHintsIntersection();
  }

  private init(opts: ViewOptions): this {
    const { selector } = opts;

    if (selector === undefined) {
      throw new Error('You should pass options "selector" in options!');
    }

    const wrapper = document.querySelector(selector);
    if (wrapper === null) {
      throw new Error(`There is no element with selector "${selector}"`);
    }

    const { thumbs } = this;
    thumbs.addSubscriber('thumbMouseMove', this);
    thumbs.addSubscriber('thumbMouseDown', this);
    thumbs.addSubscriber('thumbMouseUp', this);
    thumbs.addSubscriber('swapThumbs', this);

    this.addSubscriber('hintAlwaysShow', this);
    this.addSubscriber('angle', this);
    this.addSubscriber('range', this);
    this.addSubscriber('resize', this);

    this.setOptions(opts);

    const { options, el } = this;
    el.classList.add(options.className);
    el.addEventListener('mousedown', this.handleTrackMouseDown);
    wrapper.append(el);

    const resizeObserver = new ResizeObserver(() => {
      this.broadcast({ event: 'resize' });
    });
    resizeObserver.observe(el);

    this.scale = new Scale({ view: this });
    this.scale.addSubscriber('anchorClick', this);
    this.addSubscriber('resize', this.scale);

    return this;
  }

  private handleAnchorClick(offset: number): void {
    const closestThumb = this.findClosestThumb(offset);
    this.moveThumbToPos(closestThumb, offset);
    this.handleHintsIntersection();
  }

  private handleThumbMouseDown(thumb: HTMLDivElement): void {
    const { thumbs, hints, options } = this;
    if (!options.hintAboveThumb) return;

    const { thumbLeft } = thumbs.getThumbs();
    const hint = (thumb === thumbLeft) ? hints[0] : hints[1];
    hint.appendHint();
  }

  private handleThumbMouseUp(thumb: HTMLElement): void {
    const { thumbs, hints, options } = this;
    const { thumbLeft } = thumbs.getThumbs();
    const hint = (thumb === thumbLeft) ? hints[0] : hints[1];

    if (!options.hintAlwaysShow) {
      hint.removeHint();
    }
  }

  private handleTrackMouseDown = (e: MouseEvent): void => {
    const { el } = this;
    if (e.target === el) {
      el.addEventListener('mouseup', this.handleTrackMouseUp);
    }
  }

  private handleTrackMouseUp = (e: MouseEvent): void => {
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
    this.el.removeEventListener('mouseup', this.handleTrackMouseUp);
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
    const { thumbLeft, thumbRight } = thumbs.getThumbs();

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

  private handleResize(): void {
    const { thumbs } = this;
    const { thumbLeft, thumbRight } = thumbs.getThumbs();
    this.moveThumbToPos(thumbLeft, thumbs.thumbLeftOffset);
    this.moveThumbToPos(thumbRight, thumbs.thumbRightOffset);
  }
}
