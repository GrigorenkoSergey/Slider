import EventObserver from '../../../../helpers/EventObserver';
import { SliderEvents } from '../../../../helpers/slider-events';
import View from '../View';

export default class Thumbs extends EventObserver {
  thumbLeft = document.createElement('div');

  thumbRight = document.createElement('div');

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
    wasOverlap: false,
    startLeft: 0,
    maxLeft: 0,
  };

  private currentThumb: HTMLDivElement | null = null;

  constructor(view: View) {
    super();
    this.view = view;
    this.render();
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

  private render(): void {
    const { view, thumbLeft, thumbRight } = this;
    const { className } = view.getOptions();

    thumbLeft.classList.add(`${className}__thumb`);
    thumbLeft.classList.add(`${className}__thumb_side_left`);
    thumbRight.classList.add(`${className}__thumb`);
    thumbRight.classList.add(`${className}__thumb_side_right`);

    view.el.append(thumbLeft);
    this.displayThumbRight();

    thumbLeft.addEventListener('mousedown', this.handleThumbMouseDown);
    thumbRight.addEventListener('mousedown', this.handleThumbMouseDown);

    view.addSubscriber('range', this);
  }

  private handleThumbMouseDown = (e: MouseEvent): void => {
    e.preventDefault();

    const {
      closure, view,
      thumbLeftOffset,
      thumbRightOffset,
    } = this;

    closure.wasOverlap = thumbLeftOffset === thumbRightOffset;

    const thumb = e.target;
    if (!(thumb instanceof HTMLDivElement)) {
      throw new Error();
    }

    closure.startLeft = parseFloat(thumb.style.left);
    this.currentThumb = thumb;

    const slider = view.el;
    const sliderCoords: DOMRect = slider.getBoundingClientRect();
    const thumbCoords: DOMRect = thumb.getBoundingClientRect();
    const scaleInnerWidth = slider.clientWidth - this.thumbLeft.offsetWidth;

    closure.startX = sliderCoords.left + slider.clientLeft;
    closure.startY = sliderCoords.top + slider.clientTop;

    const { angle, step, range } = view.getOptions();
    closure.cosA = Math.cos((angle / 180) * Math.PI);
    closure.sinA = Math.sin((angle / 180) * Math.PI);

    closure.pixelStep = step * scaleInnerWidth;
    const { pixelStep } = closure;

    const { thumbLeft, thumbRight } = this;
    if (thumb === thumbLeft) {
      closure.leftLimit = 0;
    } else {
      closure.leftLimit = parseFloat(getComputedStyle(thumbLeft).left);
    }

    const maxLeft = Math.max(
      parseFloat(getComputedStyle(thumbLeft).left),
      Math.floor(scaleInnerWidth / pixelStep) * pixelStep,
    );
    closure.maxLeft = maxLeft;

    if (thumb === thumbLeft && range) {
      closure.rightLimit = parseFloat(getComputedStyle(thumbRight).left);
    } else {
      closure.rightLimit = maxLeft;
    }

    closure.shiftX = e.clientX - thumbCoords.left;
    closure.shiftY = e.clientY - thumbCoords.top;

    thumb.classList.add(`${view.getOptions().className}__thumb_moving`);

    closure.scaleInnerWidth = scaleInnerWidth;
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
      scaleInnerWidth,
      startLeft, wasOverlap,
    } = this.closure;

    const newLeftX = e.clientX - startX - shiftX;
    const newLeftY = e.clientY - startY - shiftY;
    let newLeft = newLeftX * cosA + newLeftY * sinA;

    const { currentThumb: thumb } = this;
    if (thumb === null) throw new Error('No thumb in closure');

    thumb.style.zIndex = `${1000}`;

    if (wasOverlap) {
      // засунуть все в функцию
      const minDistanceToDeside = 5;
      if (Math.abs(newLeft - startLeft) < minDistanceToDeside) return;

      const {
        currentThumb, thumbLeft, thumbRight, closure,
      } = this;
      if (newLeft < startLeft && currentThumb !== thumbLeft) {
        this.swapMovingThumbs();
        closure.rightLimit = this.closure.leftLimit;
        closure.leftLimit = 0;
      } else if (newLeft > startLeft && currentThumb !== thumbRight) {
        this.swapMovingThumbs();
        closure.leftLimit = this.closure.rightLimit;
        closure.rightLimit = this.closure.maxLeft;
      }
      closure.wasOverlap = false;
    }

    const { leftLimit, rightLimit } = this.closure;
    newLeft = this.takeStepIntoAccount(newLeft, pixelStep);
    newLeft = Math.max(leftLimit, newLeft);
    newLeft = Math.min(newLeft, rightLimit);

    thumb.style.left = `${newLeft}px`;

    let offset = newLeft / scaleInnerWidth;
    /*
        Вот здесь может возникнуть ошибка из-за механики округления значений left
        браузером. Он округляет до 1/1000, а наши вычисления гораздо точнее,
        поэтому на может возникнуть ошибка, например, когда
        наши значения left бегунков совпадают, а вычисленные значения offset отличаются.
        Соответственно не совпадают и значения подсказок над бегунками.
        Поэтому удостоверимся, что не будет никаких неприятных сюрпризов.
      */
    const {
      thumbLeft, thumbLeftOffset, thumbRight, thumbRightOffset, view,
    } = this;

    if (thumb === thumbRight && newLeft === leftLimit) {
      offset = thumbLeftOffset;
    } else if (thumb === thumbLeft && view.getOptions().range) {
      if (newLeft === rightLimit) offset = thumbRightOffset;
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

  private swapMovingThumbs(): void {
    [this.thumbLeft, this.thumbRight] = [this.thumbRight, this.thumbLeft];

    const { thumbLeft, thumbRight } = this;
    const { className } = this.view.getOptions();
    const tempClassName = thumbLeft.className;

    thumbLeft.className = thumbRight.className;
    thumbLeft.classList.toggle(`${className}__thumb_moving`);

    thumbRight.className = tempClassName;
    thumbRight.classList.toggle(`${className}__thumb_moving`);
  }
}
