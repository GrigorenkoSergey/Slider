/* eslint-disable no-restricted-globals */
/* eslint-disable @typescript-eslint/no-unused-vars */
import debuggerPoint from '../../../helpers/debugger-point';
import EventObserver from '../../../helpers/event-observer';
import { isObjKey } from '../../../helpers/functions/is-obj-key';
import { setOption } from '../../../helpers/functions/set-option';
import { ModelValidator } from './components/model-validator';

import { ModelOptions } from './components/model-types';

export default class Model extends EventObserver {
  private options: Required<ModelOptions> = {
    min: 0,
    max: 100,
    step: 1,
    partsNum: 2,
    thumbLeftPos: 0,
    thumbRightPos: Infinity,
    range: false,
    precision: 0,
    alternativeRange: [],
  }

  validator!: ModelValidator;

  constructor(options: ModelOptions) {
    super();
    this.init(options);
  }

  private init(options: ModelOptions) {
    const optionsCopy = { ...options };

    const defaultDependentOptions = {
      step: () => {
        if (!('alternativeRange' in optionsCopy)) {
          return Math.round((optionsCopy.max! - optionsCopy.min!) / 100);
        }
        return 1;
      },
      thumbLeftPos: () => {
        let result = 0;
        if ('min' in optionsCopy) {
          result = optionsCopy.min!;
        }
        return result;
      },
      thumbRightPos: () => Infinity,
    };

    Object.keys(defaultDependentOptions).forEach((key) => {
      if (key in options) return;

      if (isObjKey(this.options, key)) {
        if (isObjKey(defaultDependentOptions, key)) {
          optionsCopy[key] = defaultDependentOptions[key]();
        }
      }
    });

    this.validator = new ModelValidator(this);
    this.setOptions(optionsCopy);
  }

  getOptions() {
    const obj = { ...this.options };
    return obj;
  }

  setOptions(expectant: ModelOptions): Model {
    let tempObj: ModelOptions = {};

    Object.entries(expectant).forEach(([key, value]) => {
      if (isObjKey(this.options, key)) {
        tempObj = setOption(tempObj, key, value);
      }
    });

    tempObj = this.validator.validate(tempObj);
    Object.assign(this.options, tempObj);

    Object.keys(tempObj).forEach((key) => {
      if (isObjKey(this.options, key)) {
        this.broadcast(key, { value: tempObj[key], method: 'setOptions' });
      }
    });

    return this;
  }

  setThumbsPos(opts: {left?: number, right?: number}): Model {
    const {
      left = this.options.thumbLeftPos,
      right = this.options.thumbRightPos,
    } = opts;

    if ('left' in opts) {
      const res = this.validator.validate({ thumbLeftPos: left }).thumbLeftPos;
      if (typeof res !== 'undefined') {
        this.options.thumbLeftPos = res;

        this.broadcast('thumbLeftPos', {
          value: this.options.thumbLeftPos,
          method: 'setThumbsPos',
        });
      }
    }

    if ('right' in opts) {
      const res = this.validator.validate({ thumbRightPos: right }).thumbRightPos;
      if (typeof res !== 'undefined') {
        this.options.thumbRightPos = res;
        this.broadcast('thumbRightPos', {
          value: this.options.thumbRightPos,
          method: 'setThumbsPos',
        });
      }
    }
    return this;
  }

  findValue(x: number): number { // y = f(x), here we find 'y'
    const { max, min, precision } = this.options;
    const result = x * (max - min) + min;
    return Number(result.toFixed(precision));
  }

  findArgument(y: number): number { // y = f(x), here we find 'x'
    const { min, max } = this.options;
    return (y - min) / (max - min);
  }
}
