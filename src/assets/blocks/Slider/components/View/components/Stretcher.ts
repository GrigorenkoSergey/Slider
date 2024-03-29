import EventObserver from '../../../../helpers/EventObserver';
import View from '../View';

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
    view.addSubscriber('resize', this);
  }

  update(): void {
    const { el, view } = this;

    const { range } = view.getOptions();
    const { thumbs } = view;
    const { style } = el;
    const { thumbLeft, thumbRight } = thumbs.getThumbs();

    if (range) {
      style.left = `${parseFloat(getComputedStyle(thumbLeft).left)
        + thumbLeft.offsetWidth / 2}px`;

      style.right = `${view.el.clientWidth
        - parseFloat(getComputedStyle(thumbRight).left)}px`;
    } else {
      style.left = '0';
      style.right = `${view.el.clientWidth
        - parseFloat(getComputedStyle(thumbLeft).left)}px`;
    }
  }

  private render(): void {
    const { view, el } = this;

    el.classList.add(`${view.getOptions().className}__stretcher`);
    view.el.append(el);
    this.update();
  }
}
