import '../../slider.scss';

import EventObserver from '../../../helpers/event-observer';
import { ISubscriber } from '../../../helpers/interfaces';
import { isObject } from '../../../helpers/functions/is-object';

import Model from '../model/model';
import { isModelInitType, isModelOptionsType } from '../model/components/model-types';

import View from '../view/view';
import { isViewInitType, isViewOptionsType } from '../view/components/view-types';

import { PresenterNormalizer } from './components/presenter-normalizer';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../helpers/debugger-point';

type onChangeOpts = {
  el: any,
  callback?: <T>(eventType: string, data: T) => any,
};

export class Presenter extends EventObserver implements ISubscriber {
  view!: View;

  model!: Model;

  normalizer = new PresenterNormalizer();

  constructor(options: unknown) {
    super();
    this.init(options);
  }

  private init(options: unknown) {
    if (!isObject(options)) {
      throw new Error('Options should be an object!');
    }

    if (!isModelInitType(options) || !isViewInitType(options)) {
      throw new Error('Not enough options to initialization!');
    }

    const normalizedToModel = this.normalizer.normalizeModelOptions(options);

    this.model = new Model(normalizedToModel);
    const { model } = this;

    // step у View относительный, поэтому переделаем его
    const { step, max, min } = model.getOptions();
    const ViewStep = step / (max - min);
    const normalizedToView = this.normalizer.normalizeViewOptions({ ...options, step: ViewStep });

    this.view = new View(normalizedToView);
    const { view } = this;

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
    // model.addSubscriber('alternativeRange', this);
    // не требуется, т.к. автоматически меняются min, max
    model.addSubscriber('min', this);
    model.addSubscriber('max', this);
    model.addSubscriber('step', this);
    model.addSubscriber('thumbLeftPos', this);
    model.addSubscriber('thumbRightPos', this);
    model.addSubscriber('range', this);
    model.addSubscriber('precision', this);

    this.setOptions(options);
  }

  setOptions(options: unknown) {
    if (!isObject(options)) {
      throw new Error('Options should be an object!');
    }

    if (!isModelOptionsType(options) && !isViewOptionsType(options)) {
      throw new Error('No slider options!');
    }

    const { model, view } = this;
    const optionsCopy = { ...options };

    const normalizedToModel = this.normalizer.normalizeModelOptions(options);
    model.setOptions(normalizedToModel);

    const updateStepOptions = ['min', 'max', 'step'];
    const shouldUpdateStep = updateStepOptions.some((option) => option in normalizedToModel);

    if (shouldUpdateStep) {
      const { step, max, min } = model.getOptions();
      const viewStep = step / (max - min);
      optionsCopy.step = viewStep;
    }

    const normalizedToView = this.normalizer.normalizeViewOptions(optionsCopy);
    view.setOptions(normalizedToView);
    return this;
  }

  getOptions() {
    const { model, view } = this;
    const res = { ...view.getOptions(), ...model.getOptions() };
    return res;
  }

  getOffsets() {
    return {
      left: this.view.thumbs.thumbLeftOffset,
      right: this.view.thumbs.thumbRightOffset,
    };
  }

  update(eventType: string, data: any) {
    const modelOptions = this.model.getOptions();

    if (eventType === 'thumbMousedown') {
      const thumb = data.el;
      const offset = this.model.findValue(data.offset);
      this.view.setHintValue(thumb, this.recountValue(offset));
    } else if (eventType === 'thumbMousemove') {
      const thumb = data.el;
      const offset = this.model.findValue(data.offset);
      this.view.setHintValue(thumb, this.recountValue(offset));

      if (thumb === this.view.thumbs.thumbLeft) {
        this.model.setThumbsPos({ left: offset });
      } else {
        this.model.setThumbsPos({ right: offset });
      }
    } else if (eventType === 'min' || eventType === 'max') {
      const { thumbLeft } = this.view.thumbs;
      this.view.moveThumbToPos(
        thumbLeft,
        this.model.findArgument(modelOptions.thumbLeftPos),
      );

      if (this.model.getOptions().range) {
        const { thumbRight } = this.view.thumbs;
        this.view.moveThumbToPos(thumbRight, this.model.findArgument(modelOptions.thumbRightPos));
      }
      this.scaleValues();
    } else if (eventType === 'step') {
      const step = modelOptions.step / (modelOptions.max - modelOptions.min);
      this.view.setOptions({ step });
    } else if (eventType === 'partsNum') {
      this.view.setOptions({ partsNum: modelOptions.partsNum });
    } else if (eventType === 'thumbLeftPos') {
      if (data.method === 'setThumbsPos') {
        this.broadcast(eventType, data);
        return;
      }

      const { thumbLeft } = this.view.thumbs;
      this.view.moveThumbToPos(thumbLeft, this.model.findArgument(data.value));
    } else if (eventType === 'thumbRightPos') {
      if (data.method === 'setThumbsPos') {
        this.broadcast(eventType, data);
        return;
      }

      const { thumbRight } = this.view.thumbs;
      if (modelOptions.thumbRightPos === Infinity) return;
      this.view.moveThumbToPos(thumbRight, this.model.findArgument(data.value));
    } else if (eventType === 'range') {
      this.view.setOptions({ range: data.value });
    } else if (eventType === 'thumbProgramMove') {
      let handledData = null;

      if ('left' in data) {
        handledData = { left: this.model.findValue(data.left) };
      } else {
        handledData = { right: this.model.findValue(data.right) };
      }

      this.model.setThumbsPos(handledData);
      this.scaleValues();
    } else {
      this.scaleValues();
    }

    this.broadcast(eventType, data);
    this.broadcast('changeSlider', eventType);
  }

  onChange(opts: onChangeOpts) {
    const {
      el,
      callback = (eventType: string, data: any) => console.log(data),
    } = opts;

    const elemSubscriber = {
      update: callback,
      el,
    };

    this.addSubscriber('changeSlider', elemSubscriber);
    this.broadcast('changeSlider', 'onChangeInit');
    return elemSubscriber;
  }

  private scaleValues() {
    const { view, model } = this;
    const modelOptions = model.getOptions();

    view.setHintValue(
      view.thumbs.thumbLeft,
      this.recountValue(modelOptions.thumbLeftPos),
    );

    view.setHintValue(
      view.thumbs.thumbRight,
      this.recountValue(modelOptions.thumbRightPos),
    );

    const { precision } = modelOptions;
    const anchorValues = this.view.scale.parts.map((value) => {
      const result = this.recountValue(Number(model.findValue(value).toFixed(precision)));
      return result;
    });

    view.setAnchorValues(anchorValues);
  }

  private recountValue(val: number) {
    const { model } = this;
    let result;

    const { alternativeRange } = model.getOptions();
    if (alternativeRange.length) {
      result = alternativeRange[Math.round(val)];
    } else {
      result = String(val);
    }
    return result;
  }
}
