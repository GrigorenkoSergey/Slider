import View from '../view';
import EventObserver from '../../../../helpers/event-observer';

export default class Hint extends EventObserver {
  el: HTMLDivElement = document.createElement('div');
  view: View;
  value: string = 'hint';

  constructor(view: View, parentNode: HTMLElement) {
    super();
    this.view = view;
    this.init(parentNode);
  }

  init(parent: HTMLElement) {
    this.el.className = `${this.view.className}__hint`;
    this.el.hidden = true;

    parent.append(this.el);

    this.el.addEventListener('mousedown', this.handleMousedown);

    if (this.view.hintAlwaysShow) {
      this.showHint();
    }
  }

  handleMousedown(e: Event) {
    e.preventDefault();
    e.stopPropagation();
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
    if (this.view.hintAlwaysShow) return;
    this.el.hidden = true;
  }
}