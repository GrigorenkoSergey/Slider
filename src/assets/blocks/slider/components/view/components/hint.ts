import EventObserver from '../../../../helpers/event-observer';
import { SliderEvents } from '../../../../helpers/slider-events';
import View from '../view';

export default class Hint extends EventObserver {
  readonly el: HTMLDivElement = document.createElement('div');

  private view: View;

  private parent: HTMLElement;

  value: string = 'hint';

  constructor(view: View, parentNode: HTMLElement) {
    super();
    this.view = view;
    this.parent = parentNode;
    this.init();
  }

  private init(): void {
    const { view, el } = this;
    el.classList.add(`${view.getOptions().className}__hint`);

    if (view.getOptions().hintAlwaysShow) {
      this.showHint();
    }

    view.addSubscriber('angle', this);
  }

  update(data: SliderEvents): void {
    if (data.event === 'angle') {
      this.rotateHint();
    }
  }

  setHintValue(value: string): void {
    const { el } = this;
    this.value = value;
    if (!el.hidden) el.textContent = value;
  }

  showHint(): void {
    const { el, value, parent } = this;
    el.textContent = value;
    parent.append(el);
  }

  hideHint(): void {
    this.el.remove();
  }

  private rotateHint(): void {
    const { angle } = this.view.getOptions();
    const { style } = this.el;

    const transformation = `rotate(-${angle}deg)`;
    style.transform = transformation;
    style.transformOrigin = 'left';
  }
}
