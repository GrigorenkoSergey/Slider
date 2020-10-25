import View from '../view';
import EventObserver from '../../../../helpers/event-observer';

import '../../../../helpers/types.ts';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../../helpers/debugger-point';

export default class Thumbs extends EventObserver {
  thumbLeft: HTMLDivElement;
  thumbRight: HTMLDivElement;
  thumbLeftOffset: number = 0;
  thumbRightOffset: number = 1;
  view: View | null = null;

  constructor(view: View) {
    super();
    this.view = view;
    this.render();
  }

  render() {
    const [thumbLeft, thumbRight] = new Array(2).fill(1).map(() => document.createElement('div'));
    Object.assign(this, {thumbLeft, thumbRight});

    thumbLeft.className = `${this.view.className}__thumb-left`;
    thumbRight.className = `${this.view.className}__thumb-right`;

    this.view.el.append(thumbLeft);
    this.displayThumbRight();

    thumbLeft.addEventListener('mousedown', this.handleThumbMousedown.bind(this));
    thumbRight.addEventListener('mousedown', this.handleThumbMousedown.bind(this));

    this.view.addSubscriber('range', this);
  }

  update(eventType: string): this {
    if (eventType === 'range') {
      this.displayThumbRight();
    }
    return this;
  }

  moveThumbToPos(thumb: HTMLDivElement, offset: number) {
    thumb.style.left = offset * (this.view.el.clientWidth - thumb.offsetWidth) + 'px';

    if (thumb == this.thumbLeft) {
      this.thumbLeftOffset = offset;
    } else {
      this.thumbRightOffset = offset;
    }

    this.broadcast('thumbMove', {
      el: thumb,
      offset: offset,
    });
  }

  handleThumbMousedown(e: MouseEvent) {
    e.preventDefault();

    const thumb = <HTMLElement>e.target;
    const slider = this.view.el;
    const {view} = this;

    const sliderCoords: DOMRect = slider.getBoundingClientRect();
    const thumbCoords: DOMRect = thumb.getBoundingClientRect();

    const startX: number = sliderCoords.left + slider.clientLeft;
    const startY: number = sliderCoords.top + slider.clientTop;

    const cosA: number = Math.cos(view.angle / 180 * Math.PI);
    const sinA: number = Math.sin(view.getOptions().angle / 180 * Math.PI);

    const pixelStep: number =
      this.view.step * (slider.clientWidth - thumb.offsetWidth);

    let leftLimit: number; 
    if (thumb === this.thumbLeft) {
      leftLimit = 0;
    } else {
      leftLimit = parseFloat(getComputedStyle(this.thumbLeft).left) + this.thumbLeft.offsetWidth;
    }

    let rightLimit: number;
    if (thumb === this.thumbLeft && this.view.range) {
      rightLimit = parseFloat(getComputedStyle(this.thumbRight).left)- thumb.offsetWidth;
    } else {
      rightLimit = slider.clientWidth - thumb.offsetWidth;
    } 

    const shiftX: number = e.clientX - thumbCoords.left;
    const shiftY: number = e.clientY - thumbCoords.top;

    thumb.classList.add(`${view.className}__thumb_moving`);

    const scaleInnerWidth = slider.clientWidth - thumb.offsetWidth;
    const offset = thumb == this.thumbLeft ? this.thumbLeftOffset : this.thumbRightOffset;

    this.broadcast('thumbMousedown', {
      el: thumb,
      offset,
    });

    const self = this;
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    function handleDocumentMouseMove(e: MouseEvent): void {
      e.preventDefault();
      thumb.style.zIndex = '' + 1000;

      const newLeftX: number = e.clientX - startX - shiftX;
      const newLeftY: number = e.clientY - startY - shiftY;
      let newLeft: number = newLeftX * cosA + newLeftY * sinA;

      newLeft = takeStepIntoAccount(newLeft, pixelStep);
      newLeft = Math.max(leftLimit, newLeft);
      newLeft = Math.min(newLeft, rightLimit);

      thumb.style.left = newLeft + 'px';

      const offset = newLeft / scaleInnerWidth;

      if (thumb === self.thumbLeft) {
        self.thumbLeftOffset = offset;
      } else {
        self.thumbRightOffset = offset;
      }

      self.broadcast('thumbMove', {
        el: thumb,
        offset,
      });
    }

    function handleDocumentMouseUp(): void {
      thumb.classList.remove(`${view.className}__thumb_moving`);
      self.broadcast('thumbMouseup', thumb);
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    }

    function takeStepIntoAccount(x: number, step: number): number {
      return Math.round(x / step) * step;
    }
  }

  displayThumbRight() {
    if (this.view.range) {
      this.view.el.append(this.thumbRight);
    } else {
      this.thumbRight.remove();
    }
  }
}