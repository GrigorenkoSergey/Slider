import View from '../view';
import EventObserver from '../../../../helpers/event-observer';

export default class Stretcher extends EventObserver {
  el: HTMLDivElement;
  view: View;

  constructor(view: View) {
    super();
    this.view = view;
    this.render();
    this.view.addSubscriber('changeView', this);
  }

  render() {
    this.el = document.createElement('div');
    this.el.className = `${this.view.className}__stretcher`;
    this.view.el.append(this.el);
  }

  update() {
    // Да, можно было изначально сделать thumbs в Stratcher,
    // но я благополучно слажал с самого начала, забыв про цветовое
    // выделение диапазона.
    if (this.view.range) {
      this.el.style.left =
        parseFloat(getComputedStyle(this.view.thumbs.thumbLeft).left) +
        this.view.thumbs.thumbLeft.offsetWidth / 2 + 'px';

      this.el.style.right =
        this.view.el.clientWidth -
        parseFloat(getComputedStyle(this.view.thumbs.thumbRight).left) + 'px';
    } else {
      this.el.style.left = '0px';
      this.el.style.right =
        this.view.el.clientWidth -
        parseFloat(getComputedStyle(this.view.thumbs.thumbLeft).left) + 'px';
    }
  }
}