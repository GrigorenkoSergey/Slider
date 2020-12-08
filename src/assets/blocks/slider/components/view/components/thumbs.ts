// Потом 2 строки ниже можно убрать
/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
import View from '../view';
import EventObserver from '../../../../helpers/event-observer';

import '../../../../helpers/types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../../helpers/debugger-point';

export default class Thumbs extends EventObserver {
  public thumbLeft!: HTMLDivElement;

  public thumbRight!: HTMLDivElement;

  public thumbLeftOffset: number = 0;

  public thumbRightOffset: number = 1;

  public view!: View;

  constructor(view: View) {
    super();
    this.view = view;
    this.render();
  }

  private render() {
    const [thumbLeft, thumbRight] = new Array(2).fill(1).map(() => document.createElement('div'));
    Object.assign(this, { thumbLeft, thumbRight });

    const { className } = this.view.getOptions();
    thumbLeft.className = `${className}__thumb-left`;
    thumbRight.className = `${className}__thumb-right`;

    this.view.el.append(thumbLeft);
    this.displayThumbRight();

    thumbLeft.addEventListener('mousedown', this.handleThumbMousedown.bind(this));
    thumbRight.addEventListener('mousedown', this.handleThumbMousedown.bind(this));

    this.view.addSubscriber('range', this);
  }

  public update(eventType: string): this {
    if (eventType === 'range') {
      this.displayThumbRight();
    }
    return this;
  }

  public moveThumbToPos(thumb: HTMLDivElement, offset: number) {
    const newLeft = offset * (this.view.el.clientWidth - thumb.offsetWidth);
    // eslint-disable-next-line no-param-reassign
    thumb.style.left = `${newLeft}px`;

    if (thumb === this.thumbLeft) {
      this.thumbLeftOffset = offset;
    } else {
      this.thumbRightOffset = offset;
    }

    this.broadcast('thumbProgramMove', {
      el: thumb,
      offset,
    });
  }

  private handleThumbMousedown(e: MouseEvent) {
    e.preventDefault();

    const thumb = <HTMLElement>e.target;
    const slider = this.view.el;
    const { view } = this;

    const sliderCoords: DOMRect = slider.getBoundingClientRect();
    const thumbCoords: DOMRect = thumb.getBoundingClientRect();

    const startX: number = sliderCoords.left + slider.clientLeft;
    const startY: number = sliderCoords.top + slider.clientTop;

    const { angle, step, range } = view.getOptions();
    const cosA: number = Math.cos((angle / 180) * Math.PI);
    const sinA: number = Math.sin((angle / 180) * Math.PI);

    const pixelStep: number = step * (slider.clientWidth - thumb.offsetWidth);

    let leftLimit: number;
    if (thumb === this.thumbLeft) {
      leftLimit = 0;
    } else {
      leftLimit = parseFloat(getComputedStyle(this.thumbLeft).left);
    }

    let rightLimit: number;
    if (thumb === this.thumbLeft && range) {
      rightLimit = parseFloat(getComputedStyle(this.thumbRight).left);
    } else {
      const scaleWidth = slider.clientWidth - thumb.offsetWidth;
      rightLimit = Math.floor(scaleWidth / pixelStep) * pixelStep;
    }

    const shiftX: number = e.clientX - thumbCoords.left;
    const shiftY: number = e.clientY - thumbCoords.top;

    thumb.classList.add(`${view.getOptions().className}__thumb_moving`);

    const scaleInnerWidth = slider.clientWidth - thumb.offsetWidth;
    const offset = thumb === this.thumbLeft ? this.thumbLeftOffset : this.thumbRightOffset;

    this.broadcast('thumbMousedown', {
      el: thumb,
      offset,
    });

    const self = this;
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    function handleDocumentMouseMove(e: MouseEvent): void {
      e.preventDefault();
      thumb.style.zIndex = `${1000}`;

      const newLeftX: number = e.clientX - startX - shiftX;
      const newLeftY: number = e.clientY - startY - shiftY;
      let newLeft: number = newLeftX * cosA + newLeftY * sinA;

      newLeft = takeStepIntoAccount(newLeft, pixelStep);
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
      if (thumb === self.thumbRight) {
        if (newLeft === leftLimit) {
          offset = self.thumbLeftOffset;
        }
      } else if (newLeft === rightLimit && self.view.getOptions().range) {
        offset = self.thumbRightOffset;
      }

      if (thumb === self.thumbLeft) {
        self.thumbLeftOffset = offset;
      } else {
        self.thumbRightOffset = offset;
      }

      self.broadcast('thumbMousemove', {
        el: thumb,
        offset,
      });
    }

    function handleDocumentMouseUp(): void {
      thumb.classList.remove(`${view.getOptions().className}__thumb_moving`);
      self.broadcast('thumbMouseup', {
        thumb,
      });
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    }

    function takeStepIntoAccount(x: number, step: number): number {
      return Math.round(x / step) * step;
    }
  }

  private displayThumbRight() {
    if (this.view.getOptions().range) {
      this.view.el.append(this.thumbRight);
    } else {
      this.thumbRight.remove();
    }
  }
}
