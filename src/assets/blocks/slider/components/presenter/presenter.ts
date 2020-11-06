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
    view.addSubscriber('thumbMousemove', this);
    view.addSubscriber('thumbMouseup', this);
    view.addSubscriber('partsNum', this);

    model.addSubscriber('min', this);
    model.addSubscriber('max', this);
    model.addSubscriber('step', this);
    model.addSubscriber('thumbLeftPos', this);
    model.addSubscriber('thumbRightPos', this);
    model.addSubscriber('range', this);
    model.addSubscriber('ticks', this);

    this.setOptions(options);
  }

  setOptions(options: Obj) {
    const {model, view} = this;
    model.setOptions(options);

    const optionsCopy = {...options};
    if ('step' in optionsCopy) {
      const step = model.step / (model.max - model.min);
      optionsCopy.step = step;
    }

    view.setOptions(optionsCopy);
  }

  getOptions() {
    const {model, view} = this;
    const res = {...view.getOptions(), ...model.getOptions()};
    return res;
  }

  scaleValues() {
    const {view, model} = this;

    view.setHintValue(
      view.thumbs.thumbLeft, 
      String(model.thumbLeftPos),
    );

    view.setHintValue(
      view.thumbs.thumbRight, 
      String(model.thumbRightPos),
    );

    const anchorValues = this.view.scale.parts.map(value => Math.round(model.findValue(value)));
    view.setAnchorValues(anchorValues);

    const step = model.step / (model.max - model.min);
    view.setOptions({step});
  }

  update(eventType: string, data: any) {
    if (eventType === 'thumbMousedown') {
      const thumb = data.el;
      let offset = Math.round(this.model.findValue(data.offset));
      this.view.setHintValue(thumb, String(offset));

    } else if (eventType === 'thumbMousemove') {
      const thumb = data.el;
      let offset = Math.round(this.model.findValue(data.offset));
      this.view.setHintValue(thumb, String(offset));

      if (thumb === this.view.thumbs.thumbLeft) {
        this.model.setThumbsPos({left: offset})
      } else {
        this.model.setThumbsPos({right: offset});
      }

    } else if (eventType === 'step') {
      const step = this.model.step / (this.model.max - this.model.min);
      this.view.setOptions({step});

    } else if (eventType === 'thumbLeftPos') {
      const {thumbLeft} = this.view.thumbs;
      this.view.moveThumbToPos(thumbLeft, this.model.findArgument(data.value));

    } else if (eventType === 'thumbRightPos') {
      const {thumbRight} = this.view.thumbs;
      this.view.moveThumbToPos(thumbRight, this.model.findArgument(data.value));

    } else if (eventType === 'range') {
      this.view.setOptions({range: data.value});

    } else if (eventType === 'ticks') {
      this.handleTicks();
      this.scaleValues();
    } else {
      this.scaleValues();
    }
  }

  handleTicks() {
    const {model, view} = this;

    if (Object.keys(model.ticks).length > 1) {
      const max = Object.values(model.ticks).slice(-1)[0];
      const scaleParts = [0];
      Object.values(model.ticks).forEach(value => {
        scaleParts.push(value / max);
      });
      view.scale.setMilestones(scaleParts);
    }
  }
}