import View from '../view';
import EventObserver from '../../../../helpers/event-observer';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../../helpers/debugger-point';

export default class Hint extends EventObserver {
  el: HTMLDivElement = document.createElement('div');

  private view: View;

  value: string = 'hint';

  constructor(view: View, parentNode: HTMLElement) {
    super();
    this.view = view;
    this.init(parentNode);
  }

  private init(parent: HTMLElement) {
    this.el.className = `${this.view.getOptions().className}__hint`;
    this.el.hidden = true;

    parent.append(this.el);

    this.el.addEventListener('mousedown', this.handleMousedown);

    if (this.view.getOptions().hintAlwaysShow) {
      this.showHint();
    }

    this.view.addSubscriber('angle', this);
  }

  update(eventType: string) {
    if (eventType === 'angle') {
      this.rotateHint();
    }
  }

  setHintValue(value: string) {
    this.value = value;
    if (!this.el.hidden) this.el.textContent = this.value;
  }

  showHint() {
    this.el.hidden = false;
    this.el.textContent = this.value;
  }

  hideHint() {
    this.el.hidden = true;
  }

  private rotateHint() {
    const { angle } = this.view.getOptions();
    const hint = this.el;

    const transformation = `rotate(-${angle}deg)`;
    hint.style.transform = transformation;
    hint.style.transformOrigin = 'left';
  }

  private handleMousedown(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }
}
