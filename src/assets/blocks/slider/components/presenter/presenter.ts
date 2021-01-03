import '../../slider.scss';

import EventObserver from '../../../helpers/event-observer';
import { SliderEvents, ThumbProgramMove } from '../../../helpers/slider-events';
import { ISubscriber } from '../../../helpers/interfaces';

import { ModelOptions } from '../model/components/model-types';
import Model from '../model/model';
import { ViewOptions } from '../view/components/view-types';
import View from '../view/view';

import { PresenterNormalizer } from './components/presenter-normalizer';
import { isPresenterOptions } from './components/presenter-types';

type SummaryOptions = Required<ModelOptions & ViewOptions>

type OnChangeOpts = {
  callback?: <T>(data: T) => unknown
};

type OnChangeResult = {
  update: (data: SliderEvents) => void;
};

export class Presenter extends EventObserver implements ISubscriber {
  private view: View;

  private model: Model;

  private normalizer = new PresenterNormalizer();

  constructor(options: unknown) {
    super();
    const initObj = this.init(options);
    this.view = initObj.view;
    this.model = initObj.model;
  }

  private init(options: unknown): { model: Model, view: View } {
    if (!isPresenterOptions(options)) {
      throw new Error('No slider options in options');
    }

    const normalizedToModel = this.normalizer.normalizeModelOptions(options);

    this.model = new Model(normalizedToModel);
    const { model } = this;

    // step у View относительный, поэтому переделаем его
    const { step, max, min } = model.getOptions();
    const viewStep = step / (max - min);
    const normalizedToView = this.normalizer.normalizeViewOptions({ ...options, step: viewStep });

    this.view = new View(normalizedToView);
    const { view } = this;

    view.addSubscriber('angle', this);
    view.addSubscriber('thumbMouseDown', this);
    view.addSubscriber('thumbMouseMove', this);
    view.addSubscriber('thumbMouseUp', this);
    view.addSubscriber('thumbProgramMove', this);
    view.addSubscriber('showScale', this);
    view.addSubscriber('hintAlwaysShow', this);
    view.addSubscriber('hintAboveThumb', this);

    const { scale } = view;
    if (scale === null) throw new Error('Scale was not initialized');
    scale.addSubscriber('rerenderScale', this);

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
    return {
      model,
      view,
    };
  }

  setOptions(options: unknown): this {
    if (!isPresenterOptions(options)) {
      throw new Error('No slider options in options');
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

  getOptions(): SummaryOptions {
    const { model, view } = this;
    const res = { ...view.getOptions(), ...model.getOptions() };
    return res;
  }

  getOffsets(): { left: number, right: number } {
    const { view } = this;
    return {
      left: view.thumbs.thumbLeftOffset,
      right: view.thumbs.thumbRightOffset,
    };
  }

  update(data: SliderEvents): void {
    const modelOptions = this.model.getOptions();
    const { model, view } = this;

    if (data.event === 'thumbMouseDown') {
      const { thumb } = data;
      const offset = model.findValue(data.offset);
      view.setHintValue(thumb, this.recountValue(offset));
    } else if (data.event === 'thumbMouseMove') {
      const { thumb } = data;
      const offset = model.findValue(data.offset);
      view.setHintValue(thumb, this.recountValue(offset));

      if (thumb === view.thumbs.thumbLeft) {
        model.setThumbsPos({ left: offset });
      } else {
        model.setThumbsPos({ right: offset });
      }
    } else if (data.event === 'min' || data.event === 'max') {
      const { thumbLeft } = view.thumbs;
      view.moveThumbToPos(
        thumbLeft,
        model.findArgument(modelOptions.thumbLeftPos),
      );

      if (model.getOptions().range) {
        const { thumbRight } = view.thumbs;
        view.moveThumbToPos(thumbRight, model.findArgument(modelOptions.thumbRightPos));
      }
      this.scaleValues();
    } else if (data.event === 'step') {
      const step = modelOptions.step / (modelOptions.max - modelOptions.min);
      view.setOptions({ step });
    } else if (data.event === 'partsNum') {
      view.setOptions({ partsNum: modelOptions.partsNum });
    } else if (data.event === 'thumbLeftPos') {
      if (data.method === 'setThumbsPos') {
        return this.broadcast(data);
      }

      const { thumbLeft } = view.thumbs;
      view.moveThumbToPos(thumbLeft, model.findArgument(data.value));
    } else if (data.event === 'thumbRightPos') {
      if (data.method === 'setThumbsPos') {
        return this.broadcast(data);
      }

      const { thumbRight } = view.thumbs;
      if (modelOptions.thumbRightPos === Infinity) return;
      view.moveThumbToPos(thumbRight, model.findArgument(data.value));
    } else if (data.event === 'range') {
      view.setOptions({ range: data.value });
    } else if (data.event === 'thumbProgramMove') {
      let handledData: ThumbProgramMove;

      if ('left' in data && data.left !== undefined) {
        handledData = {
          event: 'thumbProgramMove',
          left: model.findValue(data.left),
        };
        model.setThumbsPos(handledData);
      } else if ('right' in data && data.right !== undefined) {
        handledData = {
          event: 'thumbProgramMove',
          right: model.findValue(data.right),
        };
        model.setThumbsPos(handledData);
      }

      this.scaleValues();
    } else {
      this.scaleValues();
    }

    this.broadcast(data);
    this.broadcast({ event: 'changeSlider', cause: data.event });
  }

  onChange(opts: OnChangeOpts): OnChangeResult {
    const {
      callback = (data: SliderEvents) => console.log(data),
    } = opts;

    const elemSubscriber = {
      update: callback,
    };

    this.addSubscriber('changeSlider', elemSubscriber);
    this.broadcast({ event: 'changeSlider', cause: 'onChangeInit' });
    return elemSubscriber;
  }

  private scaleValues(): void {
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
    const { scale } = view;
    if (scale === null) throw new Error('Scale was not initialized');

    const anchorValues = scale.parts.map((value) => {
      const result = this.recountValue(Number(model.findValue(value).toFixed(precision)));
      return result;
    });

    view.setAnchorValues(anchorValues);
  }

  private recountValue(val: number): string {
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
