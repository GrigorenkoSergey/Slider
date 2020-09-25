import View from '../view';
import EventObserver from '../../../../helpers/event-observer';

import '../../../../helpers/types';

export default class Scale extends EventObserver {
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