/* eslint-disable no-param-reassign */
import View from '../view';
import EventObserver from '../../../../helpers/event-observer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../../helpers/debugger-point';

import { Obj } from '../../../../helpers/types';
import isIncreasing from '../../../../helpers/functions/is-increasing';

export default class Scale extends EventObserver {
  public view: View;

  public el: HTMLDivElement = document.createElement('div');

  public width: number = 0;

  public parts: number[] = [];

  private anchors!: HTMLDivElement[];

  constructor(options: Obj) {
    super();
    this.view = options.view;

    Object.keys(options).forEach((key) => {
      if (key in this) this[<keyof this>key] = options[key];
    });

    this.init();
  }

  private init() {
    const propsToSubscribe = ['showScale', 'step', 'partsNum', 'angle'];
    propsToSubscribe.forEach((prop) => this.view.addSubscriber(prop, this));

    this.width = this.view.el.clientWidth - this.view.thumbs.thumbLeft.offsetWidth;
    this.anchors = [];

    this.render();
  }

  public update(prop: string) {
    if (prop === 'showScale') {
      this.displayScale();
    } else if (prop === 'partsNum') {
      this.setMilestones();
    } else if (prop === 'step') {
      this.setMilestones();
    } else if (prop === 'angle') {
      this.rotateScale();
    }
  }

  private render() {
    this.el.className = `${this.view.el.className}__scale`;
    this.view.el.append(this.el);

    this.setMilestones();
  }

  public setAnchorValues(values: number[] | string[]) {
    this.anchors.forEach((div, i) => {
      div.textContent = String(values[i]);
    });
  }

  public setMilestones(values?: number[]) {
    const { step, partsNum } = this.view.getOptions();

    this.anchors.forEach((item) => item.remove());
    this.anchors.length = 0;

    if (!values) {
      this.parts.length = 0;

      for (let i = 1; i < this.view.getOptions().partsNum; i += 1) {
        let value = Math.round(i / partsNum / step) * step;
        value = Math.min(1, value);

        this.parts.push(value);
      }
      this.parts = [0, ...this.parts];

      if (this.parts[this.parts.length - 1] !== 1) {
        this.parts.push(1);
      }
    } else {
      this.validateScaleParts(values);
      this.parts = values;
    }

    this.parts.forEach((value) => {
      const div = document.createElement('div');
      div.className = `${this.view.el.className}__scale-points`;

      const right = this.width * (1 - value) + this.view.thumbs.thumbLeft.offsetWidth / 2;
      div.style.right = `${right}px`;

      div.textContent = String(value);

      this.el.append(div);
      div.addEventListener('click', this.handleMouseClick.bind(this));

      this.anchors.push(div);
    });

    this.rotateScale();
    this.broadcast('rerenderScale', this.anchors);
  }

  private handleMouseClick(e: MouseEvent) {
    const el = <HTMLDivElement>e.target;
    const index = this.anchors.indexOf(el);
    let offset = this.parts[index];

    if (offset === 1) {
      const { step } = this.view.getOptions();
      offset = Math.floor(offset / step) * step;
    }

    this.broadcast('anchorClick', offset);
  }

  private displayScale() {
    if (!this.view.getOptions().showScale) {
      this.el.style.display = 'none';
    } else {
      this.el.style.display = '';
    }
  }

  private rotateScale() {
    const { angle } = this.view.getOptions();
    const { sin, PI } = Math;
    const radAngle = (angle * PI) / 180;

    const scaleStyles = getComputedStyle(this.el);
    const scaleTransform = ` translateY(${parseFloat(scaleStyles.top) * sin(radAngle)}px)`;
    this.el.style.transform = scaleTransform;

    this.anchors.forEach((anchor) => {
      anchor.style.transformOrigin = 'right top';
      let transformation = `rotate(-${angle}deg)`;

      if (angle <= 45) {
        transformation += ` translateX(${50 * (1 - sin(2 * radAngle))}%)`;
      }
      transformation += ` translateY(${-50 * sin(radAngle)}%)`;

      anchor.style.transform = transformation;
    });
  }

  private validateScaleParts(values: number[]) {
    if (values[0] !== 0) {
      throw new Error('First value of scalePoint should be zero');
    } else if (values[values.length - 1] !== 1) {
      throw new Error('Last value of scalePoint should be equal to "1"');
    } else if (!isIncreasing(values)) {
      throw new Error('Scale points should be increasing sequence');
    }
  }
}
