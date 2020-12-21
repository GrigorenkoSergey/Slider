// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../../helpers/debugger-point';
import EventObserver from '../../../../helpers/event-observer';
import View from '../view';

export default class Thumbs extends EventObserver {
  thumbLeft!: HTMLDivElement;

  thumbRight!: HTMLDivElement;

  thumbLeftOffset: number = 0;

  thumbRightOffset: number = 1;

  view!: View;

  private handlers!: {
    handleThumbMouseDown: (e: MouseEvent) => void,
    handleDocumentMouseMove: (e: MouseEvent) => void,
    handleDocumentMouseUp : (e: MouseEvent) => void,
  };

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

  private currentThumb!: HTMLElement;

  constructor(view: View) {
    super();
    this.view = view;
    this.bindHandlers();
    this.render();
  }

  private bindHandlers() {
    this.handlers = {
      handleThumbMouseDown: this.handleThumbMouseDown.bind(this),
      handleDocumentMouseMove: this.handleDocumentMouseMove.bind(this),
      handleDocumentMouseUp: this.handleDocumentMouseUp.bind(this),
    };
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

    thumbLeft.addEventListener('mousedown', this.handlers.handleThumbMouseDown);
    thumbRight.addEventListener('mousedown', this.handlers.handleThumbMouseDown);

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

  private handleThumbMouseDown(e: MouseEvent) {
    e.preventDefault();
    const { closure, view } = this;

    const thumb = <HTMLElement>e.target;
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

    this.broadcast('thumbMouseDown', {
      el: thumb,
      offset,
    });

    const { handlers } = this;
    document.addEventListener('mousemove', handlers.handleDocumentMouseMove);
    document.addEventListener('mouseup', handlers.handleDocumentMouseUp);
  }

  private handleDocumentMouseMove(e: MouseEvent): void {
    e.preventDefault();

    const {
      startX, shiftX, startY,
      shiftY, cosA, sinA, pixelStep,
      leftLimit, rightLimit, scaleInnerWidth,
    } = this.closure;
    const { currentThumb: thumb } = this;
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

    this.broadcast('thumbMouseMove', {
      el: thumb,
      offset,
    });
  }

  private handleDocumentMouseUp(): void {
    const { view } = this;
    const { currentThumb: thumb, handlers } = this;

    thumb.classList.remove(`${view.getOptions().className}__thumb_moving`);
    this.broadcast('thumbMouseUp', {
      thumb,
    });
    document.removeEventListener('mousemove', handlers.handleDocumentMouseMove);
    document.removeEventListener('mouseup', handlers.handleDocumentMouseUp);
  }

  private displayThumbRight() {
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
