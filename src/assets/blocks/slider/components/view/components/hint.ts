import View from '../view';
import EventObserver from '../../../../helpers/event-observer';

export default class Hint extends EventObserver {
  el: HTMLDivElement = document.createElement('div');
  view: View;
  value: string = 'hint';
  alwaysShow = false;

  constructor(view: View, parentNode: HTMLElement, value ?: string) {
    super();
    this.view = view;
    this.value = value;
    this.init(parentNode);
  }

  init(parent: HTMLElement) {
    this.el.className = `${this.view.className}__hint`;
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

  showHint() {
    this.el.hidden = false;
    this.el.textContent = this.value;
  }

  hideHint() {
    if (this.alwaysShow) return;
    this.el.hidden = true;
  }

  setHintValue(value: number | string) {
    this.value = String(value);
  }
}