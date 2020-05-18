import {EventObserver, ISubscriber} from './Helpers';
// import {debuggerPoint} from './Helpers';
import {Model} from './Model';
import {View} from './View';
import jQuery from 'jquery';

(function($) {
  $.fn.slider = function(props: any) {
    return new Slider(props);
  };
})(jQuery);

type fnResType = (elem: HTMLElement, leftX: number, scaledLeftX: number,
  rightX: number, scaledRightX: number, data: any) => void;
type Obj = {[key: string]: any};

export class Slider extends EventObserver implements ISubscriber {
  _model: Model;
  _view: View;
  // Хотел сделать приватными, но для отладки довольно неудобно.
  // Перенастраивать Karma для js неохота..

  hintEl: HTMLDivElement;
  private bindedElements: Array<ISubscriber & {el: HTMLElement}> = [];

  constructor(options: any) {
    super();
    this._model = new Model(options);
    this._view = new View(options);
    this.hintEl = this._view.hintEl;
    // для того, чтобы можно было отвязать и привязать подсказку над бегунком

    const [model, view] = [this._model, this._view];

    this.addSubscriber('changeView', model);
    model.addSubscriber('changeModel', this);

    this.addSubscriber('changeModel', view);
    view.addSubscriber('changeView', this);

    model.setThumbsPos(model.thumbLeftPos, model.thumbRightPos);

    // Займемся подсказкой
    const hint = this._view.hintEl;
    const fnRes: fnResType = (elem, leftX, resLeft, rightX, resRight, data) => {
      const res = data.el == 'L' ? leftX : rightX;
      elem.textContent = '' + Math.round(res);
    };

    // Информация в подсказке должна отображаться уже после того,
    // как обработана модель и вид, поэтому она добавлена именно в конце.
    this.bindWith(hint, this._model.min, this._model.max, fnRes);
  }

  update(eventType: string, data: any): void {
    if (eventType == 'changeModel') {
      // for View data should be {
      // "L": {x: number, offset: number}, "R": {x: number, offset: number}
      // }
      // data.offset should be in range from 0 to 1

      this.broadcast('changeModel', data);
    } else if (eventType == 'changeView') {
      // for Model data should be {el: HTMLDivElement, offset: number}
      // data.el.className should contain "left" of "right" substrings
      data.el && (data.el = data.el.className.includes('left') ? 'L' : 'R');
      this.broadcast('changeView', data);
    }
  }

  setThumbsPos(leftPos: number, rightPos?: number): Slider {
    this._model.setThumbsPos.call(this._model, leftPos, rightPos);
    return this;
  }

  setOptions(options: Obj): Slider {
    this._model.setOptions.call(this._model, options);
    this._view.setOptions.call(this._view, options);
    this._view.update('changeModel', this._model.getThumbsOffset());

    return this;
  }

  getOptions() {
    const viewOps = this._view.getOptions.call(this._view);
    const modelOps = this._model.getOptions.call(this._model);
    // Сравним, совпадают ли значения общих опций, если нет
    // (А ВДРУГ????), выкинем ошибку для отладки

    const synchronized = Object.keys(viewOps).every((key) => {
      return key in modelOps ? viewOps[key] === modelOps[key] : true;
    });

    if (!synchronized) throw new Error('Model не синхронизирована с View!');

    return Object.assign({}, viewOps, modelOps);
  }

  bindWith(elemDom: HTMLElement, fnStart: number, fnEnd: number,
    fnRes: fnResType): void {
    // fnRes(elem, leftX, scaledLeftX, rightX, scaledRightX, data)

    const model = this._model;
    const {min, max} = model;
    if (fnStart > fnEnd) {
      [fnStart, fnEnd] = [fnEnd, fnStart];
    }

    // создадим замыкание, чтобы не тащись в свойства elemSubscriber лишнего
    function update(eventType: string, data: any) {
      const dataModel = model.getThumbsOffset();

      return fnRes(elemDom,
        dataModel.L.x,
        (fnEnd - fnStart) / (max - min) * dataModel.L.x + fnStart,
        dataModel.R.x,
        (fnEnd - fnStart) / (max - min) * dataModel.R.x + fnStart,
        data);
    }

    const elemSubscriber = {
      update: update,
      el: elemDom,
    };

    this.addSubscriber('changeView', elemSubscriber);
    this.addSubscriber('changeModel', elemSubscriber);

    this._model.broadcast('changeModel', this._model.getThumbsOffset());
    this.bindedElements.push(elemSubscriber);
  }

  unbindFrom(elemDom: HTMLElement): Slider {
    const elemSubscriber = this.bindedElements
      .find((elem) => elem.el === elemDom);

    this.removeSubscriber('changeView', elemSubscriber);
    this.removeSubscriber('changeModel', elemSubscriber);
    this.bindedElements = this.bindedElements
      .filter((elem) => elem != elemSubscriber);
    return this;
  }
}
