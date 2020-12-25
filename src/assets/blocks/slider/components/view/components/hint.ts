import EventObserver from '../../../../helpers/event-observer';
import { SliderEvents } from '../../../../helpers/slider-events';
import View from '../view';

export default class Hint extends EventObserver {
  readonly el: HTMLDivElement = document.createElement('div');

  private view: View;

  value: string = 'hint';

  constructor(view: View, parentNode: HTMLElement) {
    super();
    this.view = view;
    this.init(parentNode);
  }

  private init(parent: HTMLElement): void {
    const { view, el } = this;
    el.classList.add(`${view.getOptions().className}__hint`);
    el.hidden = true;

    parent.append(el);

    el.addEventListener('mousedown', this.handleMouseDown);

    if (view.getOptions().hintAlwaysShow) {
      this.showHint();
    }

    view.addSubscriber('angle', this);
  }

  update(data: SliderEvents) {
    if (data.event === 'angle') {
      this.rotateHint();
    }
  }

  setHintValue(value: string) {
    const { el } = this;
    this.value = value;
    if (!el.hidden) el.textContent = value;
  }

  showHint() {
    const { el } = this;
    el.hidden = false;
    el.textContent = this.value;
  }

  hideHint() {
    this.el.hidden = true;
  }

  private rotateHint() {
    const { angle } = this.view.getOptions();
    const { style } = this.el;

    const transformation = `rotate(-${angle}deg)`;
    style.transform = transformation;
    style.transformOrigin = 'left';
  }

  private handleMouseDown(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }
}
