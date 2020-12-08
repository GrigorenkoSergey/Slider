import View from '../view';
import EventObserver from '../../../../helpers/event-observer';

export default class Stretcher extends EventObserver {
  el!: HTMLDivElement;

  view: View;

  constructor(view: View) {
    super();
    this.view = view;
    this.render();
    this.view.addSubscriber('thumbMousemove', this);
    this.view.addSubscriber('thumbProgramMove', this);
    this.view.addSubscriber('range', this);
  }

  private render() {
    this.el = document.createElement('div');
    this.el.className = `${this.view.getOptions().className}__stretcher`;
    this.view.el.append(this.el);
    this.update();
  }

  update() {
    const { range } = this.view.getOptions();
    const { thumbs } = this.view;
    if (range) {
      this.el.style.left = `${parseFloat(getComputedStyle(thumbs.thumbLeft).left)
        + thumbs.thumbLeft.offsetWidth / 2}px`;

      this.el.style.right = `${this.view.el.clientWidth
        - parseFloat(getComputedStyle(thumbs.thumbRight).left)}px`;
    } else {
      this.el.style.left = '0px';
      this.el.style.right = `${this.view.el.clientWidth
        - parseFloat(getComputedStyle(thumbs.thumbLeft).left)}px`;
    }
  }
}
