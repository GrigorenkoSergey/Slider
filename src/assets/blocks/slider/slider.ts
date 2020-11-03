/*
import './slider.scss';

import '../helpers/types';

import EventObserver from '../helpers/event-observer';
import {ISubscriber} from '../helpers/interfaces';
import Model from './components/model/model';
import View from './components/view/view';
import jQuery from 'jquery';

// import debuggerPoint from '../helpers/debugger-point';

(function($) {
  $.fn.slider = function(props: any) {
    return new Slider(props);
  };
})(jQuery);

class Slider extends EventObserver implements ISubscriber {
  _model: Model;
  _view: View;

  private bindedElements: Array<ISubscriber & {el: HTMLElement}> = [];

  constructor(options: any) {
    super();
    this._model = new Model(options);

    // step для View немного отличается
    let optionsCopy = Object.assign({}, options);
    const {min, max, step} = optionsCopy;
    optionsCopy.step = step / (max - min);
    this._view = new View(optionsCopy);

    this.init();
  }

  init() {
    const [model, view] = [this._model, this._view];

    this.addSubscriber('changeView', model);
    model.addSubscriber('changeModel', this);

    this.addSubscriber('changeModel', view);
    view.addSubscriber('changeView', this);

    view.thumbs.removeSubscriber('thumbMousedown', view);
    view.thumbs.addSubscriber('thumbMousedown', this);
    this.addSubscriber('thumbMousedown', view);

    view.thumbs.removeSubscriber('thumbMove', view);
    view.thumbs.addSubscriber('thumbMove', this);
    this.addSubscriber('thumbMove', view);

    const scaleValues = view.scale.parts.map(value => this._model.intempolate(value));
    view.scale.setAnchorValues(scaleValues);

    model.setThumbsPos(model.thumbLeftPos, model.thumbRightPos);
  }

  update(eventType: string, data: any): void {
    let dataCopy = Object.assign({}, data);

    if (eventType == 'changeView') {
      dataCopy.el && (dataCopy.el = dataCopy.el.className.includes('left') ? 'L' : 'R');

    } else if (eventType == 'changeModel') {
      console.log(eventType);
      console.log(data);


    } else if (eventType == 'thumbMousedown') {
      dataCopy.offset = this._model.intempolate(dataCopy.offset);

    } else if (eventType == 'thumbMove') {
      dataCopy.offset = this._model.intempolate(dataCopy.offset);
    }

    this.broadcast(eventType, dataCopy);
  }

  setThumbsPos(leftPos: number, rightPos?: number): Slider {
    this._model.setThumbsPos.call(this._model, leftPos, rightPos);
    return this;
  }

  setOptions(options: Obj): Slider {
    this._model.setOptions(options);

    const optionsCopy = Object.assign(options);

    if ('step' in optionsCopy) {
      const {min = this._model.min, max = this._model.max, step} = optionsCopy;
      optionsCopy.step = step / (max - min);
    }

    this._view.setOptions(optionsCopy);
    return this;
  }

  getOptions() {
    const viewOps = this._view.getOptions();
    const modelOps = this._model.getOptions();

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

    // создадим замыкание, чтобы не тащить в свойства elemSubscriber лишнего
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

export {Slider};
*/