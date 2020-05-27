import './mySlider.scss';
import {EventObserver, ISubscriber} from './Helpers';
import {debuggerPoint} from './Helpers';

type Obj = {[key: string]: any};
type ViewUpdateDataFormat = {
  'L': {x: number, offset: number},
  'R': {x: number, offset: number}
};

export class View extends EventObserver implements ISubscriber {
  el: HTMLDivElement;
  className: string = 'slider';
  angle: number = 0;
  step: number = 10;
  min: number = 0;
  max: number = 100;
  range: boolean = true;
  selector: string = '';
  hintAboveThumb = true;
  hintEl: HTMLDivElement;
  thumbLeft: HTMLDivElement;
  thumbRight: HTMLDivElement;
  thumbs: ThumbsTwinsBrothers;

  scale: Scale;
  showScale: boolean = true;
  rangeValue: any[] = [];

  stretcher: Stretcher; // Ну как назвал, так назвал...

  constructor(options: Obj) {
    super();
    const argsRequire = ['min', 'max', 'selector'];

    if (!argsRequire.every((key) => key in options)) {
      throw new Error(
        `Not enough values. Should be at least 
        "${argsRequire.join('", "')}" in options`);
    }

    this.setOptions.call(this, options);
    if (!('step' in options) || this.step === 0) {
      this.step = (this.max - this.min) / 100;
    }

    this.render(true);
  }

  setOptions(options: {[key: string]: any}) {
    const expectant: Obj = {};
    Object.keys(options).filter((prop) => prop in this)
      .forEach((prop) => expectant[prop] = options[prop]);

    // ATTENTION: _validateOptions is dirty function!
    this._validateOptions(expectant) && Object.assign(this, expectant);

    this.scale && this.scale.update();
    this.thumbs && this.thumbs.update('', null);
    this.stretcher && this.stretcher.update();
    return this;
  }

  getOptions() {
    const publicOtions = ['min', 'max', 'range', 'step',
      'className', 'selector', 'hintAboveThumb',
      'angle', 'showScale', 'rangeValue'];

    const obj: Obj = {};
    publicOtions.forEach((key) => obj[key] = this[<keyof this>key]);
    return obj;
  }

  update(eventType: string, data: ViewUpdateDataFormat): this {
    this.thumbs.update(eventType, data);
    this.stretcher.update();
    this.el.style.transform = `rotate(${this.angle}deg)`;
    return this;
  }

  render(firstTime?: true): this {
    if (firstTime) {
      const wrapper = document.querySelector(this.selector);
      [this.el, this.hintEl] =
        new Array(2).fill(1).map(() => document.createElement('div'));
      wrapper.append(this.el);

      this.stretcher = new Stretcher(this);

      // Come, brothers!! COME!!!!
      this.thumbs = new ThumbsTwinsBrothers(this);
      this.thumbLeft = this.thumbs.thumbLeft;
      this.thumbRight = this.thumbs.thumbRight;
      this.scale = new Scale({view: this});
    }

    this.el.classList.add(this.className);

    this.hintEl.className = `${this.className}__hint`;
    this.hintEl.textContent = 'HINT!';
    this.el.style.transform = `rotate(${this.angle}deg)`;

    const scaleWidth = this.el.clientWidth - this.thumbLeft.offsetWidth;
    this.scale.width = scaleWidth;
    this.scale.renderAnchors();
    return this;
  }

  private _validateOptions(expectant: Obj): never | true {
    const obj: Obj = Object.assign({}, this);
    Object.assign(obj, expectant);

    const shouldBeNumbers: string[] = ['max', 'min', 'step', 'angle'];
    shouldBeNumbers.forEach((key) => obj[key] = Number(obj[key]));

    const {min, max, step, angle} = obj;

    if (!isFinite(min)) throw new Error('min should be a number!');
    if (!isFinite(max)) throw new Error('max should be a number!');
    if (!isFinite(step)) throw new Error('step should be a number!');
    if (!isFinite(angle)) throw new Error('angle should be a number!');

    if (max < min) throw new Error('max should be greater then min!');
    if (angle < 0 || angle > 90) {
      throw new Error('angle should be >= 0 and <= 90');
    }
    Object.assign(expectant, obj);

    return true;
  }
}

class ThumbsTwinsBrothers extends EventObserver {
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

    thumbLeft.addEventListener('mousedown', this._addClickHandlers.bind(this));
    thumbRight.addEventListener('mousedown', this._addClickHandlers.bind(this));
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

  _addClickHandlers(e: MouseEvent) {
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
    // scaleInnerWidth for use in onMouseMove

    // при любом событии элементы впредь будут пищать о нем ))
    view.broadcast('changeView', {
      el: thumb,
      offset: parseFloat(getComputedStyle(thumb).left) / scaleInnerWidth,
    });

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    function onMouseMove(e: MouseEvent): void {
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

    function onMouseUp(): void {
      thumb.classList.remove(`${view.className}__thumb_moving`);
      view.hintEl.remove();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
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
class Stretcher extends EventObserver {
  el: HTMLDivElement;
  view: View;

  constructor(view: View) {
    super();
    this.view = view;
    this.render();
    this.view.addSubscriber('changeView', this);
  }

  render() {
    this.el = document.createElement('div');
    this.el.className = `${this.view.className}__stretcher`;
    this.view.el.append(this.el);
  }

  update() {
    // Да, можно было изначально сделать thumbs в Stratcher,
    // но я благополучно слажал с самого начала, забыв про цветовое
    // выделение диапазона.
    if (this.view.range) {
      this.el.style.left =
        parseFloat(getComputedStyle(this.view.thumbLeft).left) +
        this.view.thumbLeft.offsetWidth / 2 + 'px';

      this.el.style.right =
        this.view.el.clientWidth -
        parseFloat(getComputedStyle(this.view.thumbRight).left) + 'px';
    } else {
      this.el.style.left = '0px';
      this.el.style.right =
        this.view.el.clientWidth -
        parseFloat(getComputedStyle(this.view.thumbLeft).left) + 'px';
    }
  }
}

class Scale extends EventObserver {
  width: number = 0;
  view: View | null = null;

  el: HTMLDivElement;
  private points: number[] = [0, 1];
  range: number[];

  constructor(options: Obj) {
    super();
    Object.keys(options).forEach((key) => {
      if (key in this) this[<keyof this>key] = options[key];
    });

    this.range = [this.view.min, this.view.max];
    this.view.addSubscriber('changeView', this);
  }

  update() {
    if (!this.view.showScale) {
      this.el.style.display = 'none';
      return;
    } else {
      this.el.style.display = '';
    }

    this.range = [this.view.min, this.view.max];

    const left = this.el.querySelector('[data-side=L]');
    const right: HTMLDivElement = this.el.querySelector('[data-side=R]');

    if (this.view.rangeValue.length) {
      left.textContent = this.view.rangeValue[0] + '';
      right.textContent = this.view.rangeValue[1] + '';
    } else {
      left.textContent = this.range[0] + '';
      right.textContent = this.range[1] + '';
    }

    right.style.left = this.view.el.clientWidth - right.offsetWidth + 'px';
  }

  renderAnchors() {
    const scaleDiv = document.createElement('div');
    scaleDiv.className = this.view.el.className + '__scale';
    this.view.el.append(scaleDiv);
    this.el = scaleDiv;

    for (let i = 0; i < this.points.length; i++) {
      const div = document.createElement('div');

      div.dataset.side = i == 0 ? 'L' : 'R';
      div.className = this.view.el.className + '__scale-points';
      scaleDiv.append(div);

      div.style.left = this.points[i] * this.width + 'px';
      div.textContent = this.range[i] + '';

      div.addEventListener('click', this._onMouseClick.bind(this));
    }

    this.update();
    debuggerPoint.start = 2;
  }

  _onMouseClick(e: MouseEvent) {
    const target: HTMLDivElement = <HTMLDivElement>e.target;
    let closestThumb: HTMLDivElement =
      this.view.el.querySelector('[class*=left]');

    if (target.dataset.side === 'R') {
      const rightThumb: HTMLDivElement | null =
        this.view.el.querySelector('[class*=right]');
      closestThumb = rightThumb ? rightThumb : closestThumb;
    }

    const data = {
      el: closestThumb,
      offset: target.dataset.side === 'L' ? 0 : 1,
    };

    this._moveThumbToOffset(data.el, data.offset);
    this.view.broadcast('changeView', data);
  }

  _moveThumbToOffset(thumb: HTMLDivElement, offset: number): void {
    thumb.style.left = offset * this.width + 'px';
  }
}
