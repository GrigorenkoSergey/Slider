import EventObserver from '../../../../helpers/event-observer';
import View from '../view';

export default class Stretcher extends EventObserver {
  readonly el: HTMLDivElement = document.createElement('div');

  private view: View;

  constructor(view: View) {
    super();
    this.view = view;
    this.render();
    view.addSubscriber('thumbMouseMove', this);
    view.addSubscriber('thumbProgramMove', this);
    view.addSubscriber('range', this);
  }

  private render() {
    const { view, el } = this;

    el.className = `${view.getOptions().className}__stretcher`;
    view.el.append(el);
    this.update();
  }

  update() {
    const { el, view } = this;

    const { range } = view.getOptions();
    const { thumbs } = view;
    const { style } = el;

    if (range) {
      style.left = `${parseFloat(getComputedStyle(thumbs.thumbLeft).left)
        + thumbs.thumbLeft.offsetWidth / 2}px`;

      style.right = `${view.el.clientWidth
        - parseFloat(getComputedStyle(thumbs.thumbRight).left)}px`;
    } else {
      style.left = '0px';
      style.right = `${view.el.clientWidth
        - parseFloat(getComputedStyle(thumbs.thumbLeft).left)}px`;
    }
  }
}
