import EventObserver from '../../../../helpers/event-observer';
import { SliderEvents } from '../../../../helpers/slider-events';
import View from '../view';

export default class Thumbs extends EventObserver {
  readonly thumbLeft = document.createElement('div');

  readonly thumbRight = document.createElement('div');

  thumbLeftOffset: number = 0;

  thumbRightOffset: number = 1;

  private view: View;

  private closure = {
    startX: 0,
    startY: 0,
    cosA: 0,
    sinA: 0,
    leftLimit: 0,
    rightLimit: 0,
    shiftX: 0,
    shiftY: 0,
    scaleInnerWidth: 0,
    pixelStep: 0,
  };

  private currentThumb: HTMLDivElement | null = null;

  constructor(view: View) {
    super();
    this.view = view;
    this.render();
  }

  private render(): void {
    const { view, thumbLeft, thumbRight } = this;
    const { className } = view.getOptions();

    thumbLeft.classList.add(`${className}__thumb`);
    thumbLeft.classList.add(`${className}__thumb_left`);
    thumbRight.classList.add(`${className}__thumb`);
    thumbRight.classList.add(`${className}__thumb_right`);

    view.el.append(thumbLeft);
    this.displayThumbRight();

    thumbLeft.addEventListener('mousedown', this.handleThumbMouseDown);
    thumbRight.addEventListener('mousedown', this.handleThumbMouseDown);

    view.addSubscriber('range', this);
  }

  update(data: SliderEvents): this {
    if (data.event === 'range') {
      this.displayThumbRight();
    }
    return this;
  }

  moveThumbToPos(thumb: HTMLDivElement, offset: number): void {
    const { view, thumbLeft } = this;
    const newLeft = offset * (view.el.clientWidth - thumb.offsetWidth);
    // eslint-disable-next-line no-param-reassign
    thumb.style.left = `${newLeft}px`;

    if (thumb === thumbLeft) {
      this.thumbLeftOffset = offset;
    } else {
      this.thumbRightOffset = offset;
    }

    this.broadcast({
      event: 'thumbMouseMove',
      thumb,
      offset,
    });
  }

  private handleThumbMouseDown = (e: MouseEvent): void => {
    e.preventDefault();
    const { closure, view } = this;

    const thumb = e.target;
    if (!(thumb instanceof HTMLDivElement)) {
      throw new Error();
    }

    this.currentThumb = thumb;

    const slider = view.el;
    const sliderCoords: DOMRect = slider.getBoundingClientRect();
    const thumbCoords: DOMRect = thumb.getBoundingClientRect();

    closure.startX = sliderCoords.left + slider.clientLeft;
    closure.startY = sliderCoords.top + slider.clientTop;

    const { angle, step, range } = view.getOptions();
    closure.cosA = Math.cos((angle / 180) * Math.PI);
    closure.sinA = Math.sin((angle / 180) * Math.PI);

    closure.pixelStep = step * (slider.clientWidth - thumb.offsetWidth);
    const { pixelStep } = closure;

    const { thumbLeft, thumbRight } = this;
    if (thumb === thumbLeft) {
      closure.leftLimit = 0;
    } else {
      closure.leftLimit = parseFloat(getComputedStyle(thumbLeft).left);
    }

    if (thumb === thumbLeft && range) {
      closure.rightLimit = parseFloat(getComputedStyle(thumbRight).left);
    } else {
      const scaleWidth = slider.clientWidth - thumb.offsetWidth;
      closure.rightLimit = Math.floor(scaleWidth / pixelStep) * pixelStep;
    }

    closure.shiftX = e.clientX - thumbCoords.left;
    closure.shiftY = e.clientY - thumbCoords.top;

    thumb.classList.add(`${view.getOptions().className}__thumb_moving`);

    closure.scaleInnerWidth = slider.clientWidth - thumb.offsetWidth;
    const offset = thumb === thumbLeft ? this.thumbLeftOffset : this.thumbRightOffset;

    this.broadcast({
      event: 'thumbMouseDown',
      thumb,
      offset,
    });

    document.addEventListener('mousemove', this.handleDocumentMouseMove);
    document.addEventListener('mouseup', this.handleDocumentMouseUp);
  }

  private handleDocumentMouseMove = (e: MouseEvent): void => {
    e.preventDefault();

    const {
      startX, shiftX, startY,
      shiftY, cosA, sinA, pixelStep,
      leftLimit, rightLimit, scaleInnerWidth,
    } = this.closure;

    const { currentThumb: thumb } = this;
    if (thumb === null) throw new Error('No thumb in closure');
    thumb.style.zIndex = `${1000}`;

    const newLeftX: number = e.clientX - startX - shiftX;
    const newLeftY: number = e.clientY - startY - shiftY;
    let newLeft: number = newLeftX * cosA + newLeftY * sinA;

    newLeft = this.takeStepIntoAccount(newLeft, pixelStep);
    newLeft = Math.max(leftLimit, newLeft);
    newLeft = Math.min(newLeft, rightLimit);

    thumb.style.left = `${newLeft}px`;

    let offset = newLeft / scaleInnerWidth;
    /*
        Вот здесь может возникнуть ошибка из-за механики округления значений left
        браузером. Он округляет до 1/1000, а наши вычисления гораздо точнее,
        поэтому на границах может возникнуть ошибка, например, когда
        наши значения left бегунков совпадают, а вычисленные значения offset отличаются.
        Соответственно не совпадают и значения подсказок над бегунками.
        Поэтому удостоверимся, что не будет никаких неприятных сюрпризов.
      */
    const {
      thumbLeft, thumbLeftOffset, thumbRight, thumbRightOffset, view,
    } = this;
    if (thumb === thumbRight) {
      if (newLeft === leftLimit) {
        offset = thumbLeftOffset;
      }
    } else if (newLeft === rightLimit && view.getOptions().range) {
      offset = thumbRightOffset;
    }

    if (thumb === thumbLeft) {
      this.thumbLeftOffset = offset;
    } else {
      this.thumbRightOffset = offset;
    }

    this.broadcast({
      event: 'thumbMouseMove',
      thumb,
      offset,
    });
  }

  private handleDocumentMouseUp = (): void => {
    const { view } = this;
    const { currentThumb: thumb } = this;
    if (thumb === null) throw new Error('No thumb in closure');

    thumb.classList.remove(`${view.getOptions().className}__thumb_moving`);
    this.broadcast({
      event: 'thumbMouseUp',
      thumb,
    });
    document.removeEventListener('mousemove', this.handleDocumentMouseMove);
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
  }

  private displayThumbRight(): void {
    const { view, thumbRight } = this;
    if (view.getOptions().range) {
      view.el.append(thumbRight);
    } else {
      thumbRight.remove();
    }
  }

  private takeStepIntoAccount(x: number, step: number): number {
    return Math.round(x / step) * step;
  }
}
