import EventObserver from '../../../../helpers/EventObserver';
import { SliderEvents } from '../../../../helpers/slider-events';
import View from '../View';

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

  update(data: SliderEvents): void {
    if (data.event === 'angle') {
      this.rotateHint();
    }
  }

  setHintValue(value: string): void {
    const { el } = this;
    this.value = value;
    el.textContent = value;
  }

  appendHint(): void {
    const { el, value, parent } = this;
    el.textContent = value;
    parent.append(el);
  }

  removeHint(): void {
    this.el.remove();
  }

  private init(): void {
    const { view, el } = this;
    el.classList.add(`${view.getOptions().className}__hint`);

    el.addEventListener('mousedown', this.handleMouseDown);
    view.addSubscriber('angle', this);
  }

  private rotateHint(): void {
    const { style } = this.el;
    const { angle } = this.view.getOptions();

    const transformation = `rotate(-${angle}deg)`;
    style.transform = transformation;
    style.transformOrigin = 'left';
  }

  private handleMouseDown(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }
}
