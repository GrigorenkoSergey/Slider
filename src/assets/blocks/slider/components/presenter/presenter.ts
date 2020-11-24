import '../../slider.scss';

import '../../../helpers/types';

import EventObserver from '../../../helpers/event-observer';
import {ISubscriber} from '../../../helpers/interfaces';
import View from '../../components/view/view';
import Model from '../model/model';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../helpers/debugger-point';

export default class Presenter extends EventObserver implements ISubscriber{
  view: View | null = null;
  model: Model | null = null;
  className: string = 'slider';

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

    view.addSubscriber('angle', this);
    view.addSubscriber('thumbMousedown', this);
    view.addSubscriber('thumbMousemove', this);
    view.addSubscriber('thumbMouseup', this);
    view.addSubscriber('thumbProgramMove', this);
    view.addSubscriber('showScale', this);
    view.addSubscriber('hintAlwaysShow', this);
    view.addSubscriber('hintAboveThumb', this);

    view.scale.addSubscriber('rerenderScale', this);
    this.addSubscriber('rerenderScale', this.view);

    model.addSubscriber('partsNum', this);
    // model.addSubscriber('alternativeRange', this); //не требуется, т.к. автоматически меняются min, max
    model.addSubscriber('min', this);
    model.addSubscriber('max', this);
    model.addSubscriber('step', this);
    model.addSubscriber('thumbLeftPos', this);
    model.addSubscriber('thumbRightPos', this);
    model.addSubscriber('range', this);
    model.addSubscriber('precision', this);

    this.setOptions(options);
  }

  setOptions(options: Obj) {
    const {model, view} = this;
    model.setOptions(options);

    const optionsCopy = {...options};

    const updateStepOptions = ['min', 'max', 'step'];
    const shouldUpdateStep = updateStepOptions.some(option => option in optionsCopy);

    if (shouldUpdateStep) {
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
      this._recountValue(model.thumbLeftPos),
    );

    view.setHintValue(
      view.thumbs.thumbRight, 
      this._recountValue(model.thumbRightPos),
    );

    const precision = model.precision;
    const anchorValues = this.view.scale.parts.map((value) => {
      const result = this._recountValue(Number(model.findValue(value).toFixed(precision)));
      return result;
    });

    view.setAnchorValues(anchorValues);
  }

  update(eventType: string, data: any) {
    if (eventType === 'thumbMousedown') {
      const thumb = data.el;
      let offset = this.model.findValue(data.offset);
      this.view.setHintValue(thumb, this._recountValue(offset));

    } else if (eventType === 'thumbMousemove') {
      const thumb = data.el;
      let offset = this.model.findValue(data.offset);
      this.view.setHintValue(thumb, this._recountValue(offset));


      if (thumb === this.view.thumbs.thumbLeft) {
        this.model.setThumbsPos({left: offset})
      } else {
        this.model.setThumbsPos({right: offset});
      }

    } else if (eventType === 'min' || eventType === 'max') {
      const {thumbLeft} = this.view.thumbs;
      this.view.moveThumbToPos(thumbLeft, this.model.findArgument(this.model.thumbLeftPos));
      
      if (this.model.range) {
        const {thumbRight} = this.view.thumbs;
        this.view.moveThumbToPos(thumbRight, this.model.findArgument(this.model.thumbRightPos));
      }
      this.scaleValues();

    } else if (eventType === 'step') {
      const step = this.model.step / (this.model.max - this.model.min);
      this.view.setOptions({step});

    } else if (eventType === 'partsNum') {
      this.view.setOptions({partsNum: this.model.partsNum});

    } else if (eventType === 'thumbLeftPos') {

      if (data.method == 'setThumbsPos'){
        this.broadcast(eventType, data);
        return;
      } 

      const {thumbLeft} = this.view.thumbs;
      this.view.moveThumbToPos(thumbLeft, this.model.findArgument(data.value));

    } else if (eventType === 'thumbRightPos') {

      if (data.method == 'setThumbsPos') {
        this.broadcast(eventType, data);
        return;
      }

      const {thumbRight} = this.view.thumbs;
      if (this.model.thumbRightPos === Infinity) return;
      this.view.moveThumbToPos(thumbRight, this.model.findArgument(data.value));

    } else if (eventType === 'range') {
      this.view.setOptions({range: data.value});

    } else if (eventType === 'thumbProgramMove') {
      let handledData = null;

      if ('left' in data) {
        handledData = {left: this.model.findValue(data.left)};
      } else {
        handledData = {right: this.model.findValue(data.right)}
      }

      this.model.setThumbsPos(handledData);
      this.scaleValues();

    } else {
      this.scaleValues();
    }

    this.broadcast(eventType, data);
    this.broadcast('changeSlider', this);
  }

  onChange(opts: Obj) {
    const {
      el, 
      callback = () => console.log(this),
    } = opts;

    const elemSubscriber = {
      update: callback,
      el,
    };

    this.addSubscriber('changeSlider', elemSubscriber);
    this.broadcast('changeSlider', this);
  }

  _recountValue(val: number) {
    const {model} = this;
    let result;

    if (model.alternativeRange.length) {
      result = model.alternativeRange[Math.round(val)];
    } else {
      result = String(val);
    }
    return result;
  }
}