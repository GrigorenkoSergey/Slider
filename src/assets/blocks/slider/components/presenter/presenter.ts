/* eslint-disable @typescript-eslint/no-unused-vars */
import '../../slider.scss';

import '../../../helpers/types';

import EventObserver from '../../../helpers/event-observer';
import {ISubscriber} from '../../../helpers/interfaces';
import View from '../../components/view/view';
import Model from '../model/model';

import debuggerPoint from '../../../helpers/debugger-point';

export default class Presenter extends EventObserver implements ISubscriber{
  view: View | null = null;
  model: Model | null = null;
  className: string = 'slider';

  step: number = 1/100;
  angle: number = 0;
  range: boolean = true;
  selector: string = '';
  hintAboveThumb = true;
  hintAlwaysShow: boolean = false;

  showScale: boolean = true;
  partsNum: number = 2;

  constructor(options: Obj) {
    super();
    this.init(options);
  }

  init(options: Obj) {
    const optionsCopy = Object.assign({}, options);
    this.model = new Model(options);
    const model = this.model;

    optionsCopy.step = model.step / (model.max - model.min);
    this.view = new View(optionsCopy);
    const view = this.view;

    view.addSubscriber('thumbMousedown', this);
    view.addSubscriber('thumbMove', this);
    view.addSubscriber('thumbMouseup', this);

    view.setHintValue(
      view.thumbs.thumbLeft, 
      String(Math.round(model.intempolate(view.thumbs.thumbLeftOffset)
      )));

    view.setHintValue(
      view.thumbs.thumbRight, 
      String(Math.round(model.intempolate(view.thumbs.thumbRightOffset)
      )));

    view.setAnchorValues(this.view.parts.map(value => Math.round(model.intempolate(value))));
  }

  update(eventType: string, data: any) {
    if (eventType === 'thumbMousedown') {
      const thumb = data.el;
      let offset = Math.round(this.model.intempolate(data.offset));
      this.view.setHintValue(thumb, String(offset));

    } else if (eventType === 'thumbMove') {
      const thumb = data.el;
      let offset = Math.round(this.model.intempolate(data.offset));
      this.view.setHintValue(thumb, String(offset));
    }
  }
}