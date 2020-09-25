import View from '../view';
import EventObserver from '../../../../helpers/event-observer';

export default class ThumbsTwinsBrothers extends EventObserver {
  thumbLeft: HTMLDivElement = document.createElement('div');
  thumbRight: HTMLDivElement = document.createElement('div');
  view: View | null = null;

  constructor(view: View) {
    super();
    this.view = view;
    this.render();
  }

  render() {
    const {thumbLeft, thumbRight} = this;
    thumbLeft.className = `${this.view.className}__thumb-left`;
    thumbRight.className = `${this.view.className}__thumb-right`;

    this.view.el.append(thumbLeft);

    if (this.view.range) {
      this.view.el.append(thumbRight);
    } else {
      thumbRight.remove();
    }

    thumbLeft.addEventListener('mousedown', this.handleThumbClick.bind(this));
    thumbRight.addEventListener('mousedown', this.handleThumbClick.bind(this));
  }

  update(eventType: string, data: ViewUpdateDataFormat | null): this {
    if (data) {
      this.thumbLeft.style.left =
        data.L.offset *
        (this.view.el.clientWidth - this.thumbLeft.offsetWidth) + 'px';
    }

    if (this.view.range) {
      this.view.el.append(this.thumbRight);

      if (data) {
        this.thumbRight.style.left =
          data.R.offset *
          (this.view.el.clientWidth - this.thumbRight.offsetWidth) + 'px';
      }
    } else {
      this.thumbRight.remove();
    }
    return this;
  }

  handleThumbClick(e: MouseEvent) {
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
      view.getOptions().step * (slider.clientWidth - thumb.offsetWidth) /
      (view.max - view.min);

    // Найдем ограничители для бегунка
    const leftLimit: number = 0;
    const rightLimit: number = slider.clientWidth - thumb.offsetWidth;

    let swapClassLimit: number | null = null;

    if (view.range) {
      const thumbList = (view.el.querySelectorAll('[class*=thumb]'));
      const nextThumb = [].filter
        .call(thumbList, (item: Element) => item != e.target)[0];

      const nextThumbStyle = getComputedStyle(nextThumb);
      swapClassLimit = parseFloat(nextThumbStyle.left);
    }

    const shiftX: number = e.clientX - thumbCoords.left;
    const shiftY: number = e.clientY - thumbCoords.top;

    if (view.hintAboveThumb) {
      thumb.append(view.hintEl);
    }
    thumb.classList.add(`${view.className}__thumb_moving`);

    const scaleInnerWidth = slider.clientWidth - thumb.offsetWidth;
    // scaleInnerWidth for use in handleDocumentMouseMove

    // при любом событии элементы впредь будут пищать о нем ))
    view.broadcast('changeView', {
      el: thumb,
      offset: parseFloat(getComputedStyle(thumb).left) / scaleInnerWidth,
    });

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

      if (view.range) {
        if (thumb.className.includes('right')) {
          (newLeft < swapClassLimit) && swapThumbClasses();
        } else {
          (newLeft > swapClassLimit) && swapThumbClasses();
        }
      }

      view.broadcast('changeView', {
        el: thumb,
        offset: newLeft / scaleInnerWidth,
      });
    }

    function handleDocumentMouseUp(): void {
      thumb.classList.remove(`${view.className}__thumb_moving`);
      view.hintEl.remove();
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    }

    function takeStepIntoAccount(x: number, step: number): number {
      return Math.round(x / step) * step;
    }

    function swapThumbClasses(): void {
      [view.thumbLeft, view.thumbRight] = [view.thumbRight, view.thumbLeft];
      view.thumbRight.className =
        view.thumbRight.className.replace(/left/, 'right');
      view.thumbLeft.className =
        view.thumbLeft.className.replace(/right/, 'left');
    }
  }
}