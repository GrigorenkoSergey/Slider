/* eslint-disable @typescript-eslint/no-unused-vars */
import View from '../view';
import EventObserver from '../../../../helpers/event-observer';
import debuggerPoint from '../../../../helpers/debugger-point';

import '../../../../helpers/types';

export default class Scale extends EventObserver {
  width: number = 0;
  view: View | null = null;

  el: HTMLDivElement = document.createElement('div');
  parts: number;
  anchors: HTMLDivElement[];
  values: number[] = [];

  constructor(options: Obj) {
    super();
    Object.keys(options).forEach((key) => {
      if (key in this) this[<keyof this>key] = options[key];
    });

    this.init();
  }

  init() {
    const propsToSubscribe = ['showScale', 'rangeValue', 'parts'];
    propsToSubscribe.forEach(prop => this.view.addSubscriber(prop, this));

    this.width = this.view.el.clientWidth - this.view.thumbs.thumbLeft.offsetWidth;
    this.parts = this.view.parts;
    this.anchors = [];

    this.render();
  }

  update(prop: string, data: any) { // пока не обработал rangeValue
    if (debuggerPoint.start == 1) debugger;
    if (prop === 'showScale') {
      this.displayScale();
    }

    if (prop === 'parts') {
      this.parts = this.view.parts;
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
    this.values.length = 0;

    for (let i = 1; i < this.parts; i++) {
      let value = Math.round(Math.round(i / this.parts / step) * step * 1000) / 1000;
      value = Math.min(1, value);

      this.values.push(value);
    }

    this.values = [0, ...this.values, 1];

    this.values.forEach(value => {
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