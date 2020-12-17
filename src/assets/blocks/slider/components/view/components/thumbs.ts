// Потом 2 строки ниже можно убрать
/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
import View from '../view';
import EventObserver from '../../../../helpers/event-observer';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../../helpers/debugger-point';

export default class Thumbs extends EventObserver {
  thumbLeft!: HTMLDivElement;

  thumbRight!: HTMLDivElement;

  thumbLeftOffset: number = 0;

  thumbRightOffset: number = 1;

  view!: View;

  constructor(view: View) {
    super();
    this.view = view;
    this.render();
  }

  private render() {
    const [thumbLeft, thumbRight] = new Array(2).fill(1).map(() => document.createElement('div'));
    const { view } = this;
    Object.assign(this, { thumbLeft, thumbRight });

    const { className } = view.getOptions();
    thumbLeft.className = `${className}__thumb-left`;
    thumbRight.className = `${className}__thumb-right`;

    view.el.append(thumbLeft);
    this.displayThumbRight();

    thumbLeft.addEventListener('mousedown', this.handleThumbMousedown.bind(this));
    thumbRight.addEventListener('mousedown', this.handleThumbMousedown.bind(this));

    view.addSubscriber('range', this);
  }

  update(eventType: string) {
    if (eventType === 'range') {
      this.displayThumbRight();
    }
    return this;
  }

  moveThumbToPos(thumb: HTMLDivElement, offset: number) {
    const { view, thumbLeft } = this;
    const newLeft = offset * (view.el.clientWidth - thumb.offsetWidth);
    // eslint-disable-next-line no-param-reassign
    thumb.style.left = `${newLeft}px`;

    if (thumb === thumbLeft) {
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
    const { view } = this;
    const slider = view.el;

    const sliderCoords: DOMRect = slider.getBoundingClientRect();
    const thumbCoords: DOMRect = thumb.getBoundingClientRect();

    const startX: number = sliderCoords.left + slider.clientLeft;
    const startY: number = sliderCoords.top + slider.clientTop;

    const { angle, step, range } = view.getOptions();
    const cosA: number = Math.cos((angle / 180) * Math.PI);
    const sinA: number = Math.sin((angle / 180) * Math.PI);

    const pixelStep: number = step * (slider.clientWidth - thumb.offsetWidth);

    const { thumbLeft, thumbRight } = this;
    let leftLimit: number;
    if (thumb === thumbLeft) {
      leftLimit = 0;
    } else {
      leftLimit = parseFloat(getComputedStyle(thumbLeft).left);
    }

    let rightLimit: number;
    if (thumb === thumbLeft && range) {
      rightLimit = parseFloat(getComputedStyle(thumbRight).left);
    } else {
      const scaleWidth = slider.clientWidth - thumb.offsetWidth;
      rightLimit = Math.floor(scaleWidth / pixelStep) * pixelStep;
    }

    const shiftX: number = e.clientX - thumbCoords.left;
    const shiftY: number = e.clientY - thumbCoords.top;

    thumb.classList.add(`${view.getOptions().className}__thumb_moving`);

    const scaleInnerWidth = slider.clientWidth - thumb.offsetWidth;
    const offset = thumb === thumbLeft ? this.thumbLeftOffset : this.thumbRightOffset;

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
      const {
        thumbLeft, thumbLeftOffset, thumbRight, thumbRightOffset, view,
      } = self;
      if (thumb === thumbRight) {
        if (newLeft === leftLimit) {
          offset = thumbLeftOffset;
        }
      } else if (newLeft === rightLimit && view.getOptions().range) {
        offset = thumbRightOffset;
      }

      if (thumb === thumbLeft) {
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
    const { view, thumbRight } = this;
    if (view.getOptions().range) {
      view.el.append(thumbRight);
    } else {
      thumbRight.remove();
    }
  }
}
