/* eslint-disable no-param-reassign */
import { isIncreasingSequence } from '../../../../helpers/functions/is-increasing-sequence';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../../helpers/debugger-point';
import EventObserver from '../../../../helpers/event-observer';

import View from '../view';
import { SliderEvents } from '../../../../helpers/interfaces';

export default class Scale extends EventObserver {
  view: View;

  el: HTMLDivElement = document.createElement('div');

  width: number = 0;

  parts: number[] = [];

  private anchors!: HTMLDivElement[];

  constructor(options: {view: View}) {
    super();
    this.view = options.view;
    this.init();
    return this;
  }

  private init() {
    const { view } = this;
    const propsToSubscribe = ['showScale', 'step', 'partsNum', 'angle'];
    propsToSubscribe.forEach((prop) => view.addSubscriber(prop, this));

    this.width = view.el.clientWidth - view.thumbs.thumbLeft.offsetWidth;
    this.anchors = [];

    this.render();
  }

  update(data: SliderEvents) {
    if (data.event === 'showScale') {
      this.displayScale();
    } else if (data.event === 'partsNum') {
      this.setMilestones();
    } else if (data.event === 'step') {
      this.setMilestones();
    } else if (data.event === 'angle') {
      this.rotateScale();
    }
  }

  private render() {
    const { view, el } = this;
    el.className = `${view.el.className}__scale`;
    view.el.append(el);

    this.setMilestones();
  }

  setAnchorValues(values: number[] | string[]) {
    this.anchors.forEach((div, i) => {
      div.textContent = String(values[i]);
    });
  }

  setMilestones(values?: number[]) {
    const { view, anchors, el } = this;
    /*
      Не стоит, наверное, деструктурировать объекты, которые
      мы собираемся менять, а то получается как-то неоднозначно
    */
    let { parts } = this;
    const { step, partsNum } = view.getOptions();

    anchors.forEach((item) => item.remove());
    anchors.length = 0;

    if (!values) {
      parts.length = 0;

      for (let i = 1; i < view.getOptions().partsNum; i += 1) {
        let value = Math.round(i / partsNum / step) * step;
        value = Math.min(1, value);

        parts.push(value);
      }
      this.parts = [0, ...parts];
      parts = this.parts;

      if (parts[parts.length - 1] !== 1) {
        parts.push(1);
      }
    } else {
      this.validateScaleParts(values);
      this.parts = values;
      parts = this.parts;
    }

    parts.forEach((value) => {
      const div = document.createElement('div');
      div.className = `${view.el.className}__scale-points`;

      const right = this.width * (1 - value) + view.thumbs.thumbLeft.offsetWidth / 2;
      div.style.right = `${right}px`;

      div.textContent = String(value);

      el.append(div);
      div.addEventListener('click', this.handleMouseClick.bind(this));

      anchors.push(div);
    });

    this.rotateScale();
    this.broadcast({ event: 'rerenderScale', anchors });
  }

  private handleMouseClick(e: MouseEvent) {
    const { view, anchors, parts } = this;
    const el = <HTMLDivElement>e.target;
    const index = anchors.indexOf(el);
    let offset = parts[index];

    if (offset === 1) {
      const { step } = view.getOptions();
      offset = Math.floor(offset / step) * step;
    }

    this.broadcast({ event: 'anchorClick', offset });
  }

  private displayScale() {
    const { view, el } = this;
    if (!view.getOptions().showScale) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
    }
  }

  private rotateScale() {
    const { view, anchors, el } = this;
    const { angle } = view.getOptions();
    const { sin, PI } = Math;
    const radAngle = (angle * PI) / 180;

    const scaleStyles = getComputedStyle(el);
    const scaleTransform = ` translateY(${parseFloat(scaleStyles.top) * sin(radAngle)}px)`;
    el.style.transform = scaleTransform;

    anchors.forEach((anchor) => {
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
    } else if (!isIncreasingSequence(values)) {
      throw new Error('Scale points should be increasing sequence');
    }
  }
}
