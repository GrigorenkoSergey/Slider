/* eslint-disable @typescript-eslint/no-unused-vars */
import View from '../view';
import EventObserver from '../../../../helpers/event-observer';
import debuggerPoint from '../../../../helpers/debugger-point';

import '../../../../helpers/types';

export default class Scale extends EventObserver {
  view: View | null = null;

  el: HTMLDivElement = document.createElement('div');
  width: number = 0;
  anchors: HTMLDivElement[];
  parts: number[] = [];

  constructor(options: Obj) {
    super();
    Object.keys(options).forEach((key) => {
      if (key in this) this[<keyof this>key] = options[key];
    });

    this.init();
  }

  init() {
    const propsToSubscribe = ['showScale', 'rangeValue', 'partsNum'];
    propsToSubscribe.forEach(prop => this.view.addSubscriber(prop, this));

    this.width = this.view.el.clientWidth - this.view.thumbs.thumbLeft.offsetWidth;
    this.anchors = [];

    this.render();
  }

  update(prop: string, data: any) {
    if (prop === 'showScale') {
      this.displayScale();
    }

    if (prop === 'partsNum') {
      this.render();
    }

    if(prop === 'step') {
      this.render();
    }
  }

  render() {
    this.anchors.forEach(item => item.remove());
    this.anchors.length = 0;

    this.el.className = this.view.el.className + '__scale';
    this.view.el.append(this.el);

    const {step} = this.view;
    this.parts.length = 0;

    for (let i = 1; i < this.view.partsNum; i++) {
      let value = Math.round(Math.round(i / this.view.partsNum / step) * step * 1000) / 1000;
      value = Math.min(1, value);

      this.parts.push(value);
    }

    this.parts = [0, ...this.parts, 1];

    this.parts.forEach(value => {
      const div = document.createElement('div');
      div.className = this.view.el.className + '__scale-points';

      const pixelStep: number = step * this.width;
      let left = value * this.width;
      div.style.left = left + 'px';
      div.textContent = String(value);

      this.anchors.push(div);
      div.style.transform = `rotate(-${this.view.angle}deg)`; //?

      this.el.append(div);
      div.addEventListener('click', this.handleMouseClick.bind(this));
    });
  }

  setAnchorValues(values: number[] | string[]) {
    this.anchors.forEach((div, i) => {
      div.textContent = String(values[i]);
    });
  }

  handleMouseClick(e: MouseEvent) {
    const el = <HTMLDivElement>e.target;
    const left = getComputedStyle(el).left;
    const offset = parseFloat(left) / this.width;

    this.broadcast('anchorClick', offset);
  }

  displayScale() {
    if (!this.view.showScale) {
      this.el.style.display = 'none';
    } else {
      this.el.style.display = '';
    }
  }
}