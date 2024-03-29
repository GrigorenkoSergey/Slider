/* eslint-disable no-param-reassign */
import { isIncreasingSequence } from '../../../../helpers/functions/is-increasing-sequence';
import EventObserver from '../../../../helpers/EventObserver';
import { SliderEvents } from '../../../../helpers/slider-events';
import View from '../View';

export default class Scale extends EventObserver {
  private view: View;

  readonly el: HTMLDivElement = document.createElement('div');

  width: number = 0;

  parts: number[] = [];

  private anchors: HTMLDivElement[] = [];

  constructor(options: { view: View }) {
    super();
    this.view = options.view;
    this.init();
    return this;
  }

  update(data: SliderEvents): void {
    if (data.event === 'showScale') {
      this.handleShowScaleChange();
    } else if (data.event === 'partsAmount') {
      this.setMilestones();
    } else if (data.event === 'step') {
      this.setMilestones();
    } else if (data.event === 'angle') {
      this.rotateScale();
    } else if (data.event === 'resize') {
      this.handleResize();
    }
  }

  setAnchorValues(values: number[] | string[]): void {
    this.anchors.forEach((div, i) => {
      div.textContent = String(values[i]);
    });
  }

  setMilestones(values?: number[]): void {
    const { view, anchors, el } = this;

    anchors.forEach((item) => item.remove());
    anchors.length = 0;

    if (!values) {
      this.parts.length = 0;

      const { step, partsAmount } = view.getOptions();

      for (let i = 1; i < view.getOptions().partsAmount; i += 1) {
        let value = Math.round(i / partsAmount / step) * step;
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
      div.classList.add(`${view.el.className}__scale-points`);

      const { thumbLeft } = view.thumbs.getThumbs();
      const right = this.width * (1 - value) + thumbLeft.offsetWidth / 2;
      div.style.right = `${right}px`;

      div.textContent = String(value);

      el.append(div);
      div.addEventListener('click', this.handleMouseClick.bind(this));

      anchors.push(div);
    });

    this.rotateScale();
    this.broadcast({ event: 'redrawScale', anchors });
  }

  private init(): void {
    const { view } = this;
    const propsToSubscribe = ['showScale', 'step', 'partsAmount', 'angle', 'resize'];
    propsToSubscribe.forEach((prop) => view.addSubscriber(prop, this));

    const { thumbLeft } = view.thumbs.getThumbs();
    this.width = view.el.clientWidth - thumbLeft.offsetWidth;
    this.render();
  }

  private render(): void {
    const { view, el } = this;
    el.classList.add(`${view.el.className}__scale`);

    if (view.getOptions().showScale) {
      view.el.append(el);
      this.setMilestones();
    }
  }

  private handleMouseClick(e: MouseEvent): void {
    const { view, anchors, parts } = this;
    const el = e.target;

    if (el instanceof HTMLDivElement) {
      const index = anchors.indexOf(el);
      let offset = parts[index];

      if (offset === 1) {
        const { step } = view.getOptions();
        offset = Math.floor(offset / step) * step;
      }

      this.broadcast({ event: 'anchorClick', offset });
    }
  }

  private handleShowScaleChange(): void {
    const { view, el } = this;
    if (!view.getOptions().showScale) {
      el.remove();
    } else {
      view.el.append(el);
    }
  }

  private rotateScale(): void {
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

  private validateScaleParts(values: number[]): void {
    if (values[0] !== 0) {
      throw new Error('First value of scalePoint should be zero');
    } else if (values[values.length - 1] !== 1) {
      throw new Error('Last value of scalePoint should be equal to "1"');
    } else if (!isIncreasingSequence(values)) {
      throw new Error('Scale points should be increasing sequence');
    }
  }

  private handleResize(): void {
    const { view } = this;
    const { thumbLeft } = view.thumbs.getThumbs();
    this.width = this.view.el.clientWidth - thumbLeft.offsetWidth;

    this.setMilestones();
  }
}
