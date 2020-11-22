import View from '../view';
import EventObserver from '../../../../helpers/event-observer';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../../helpers/debugger-point';

export default class Hint extends EventObserver{
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

    this.view.addSubscriber('angle', this);
  }

  update(eventType: string) {
    if (eventType === 'angle') {
      this.rotateHint();
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

  rotateHint() {
    const {angle} = this.view;
    const hint = this.el;

    let transformation = `rotate(-${angle}deg)`;
    hint.style.transform = transformation;
    hint.style.transformOrigin = 'left';

    const {sin, PI} = Math;
    let radAngle = angle * PI / 180;

    if (angle <= 45) {
      transformation += ` translateX(${-50 * (1 -  sin(2 * radAngle))}%)`;
      hint.style.transform = transformation;
    }
  }
}