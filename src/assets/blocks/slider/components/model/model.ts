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
    const { options } = this;

    Object.entries(expectant).forEach(([key, value]) => {
      if (isObjKey(options, key)) {
        tempObj = setOption(tempObj, key, value);
      }
    });

    tempObj = this.validator.validate(tempObj);
    this.options = { ...options, ...tempObj };

    Object.keys(tempObj).forEach((key) => {
      if (isObjKey(options, key)) {
        const value = tempObj[key];
        if (key === 'alternativeRange') {
          const valueArray = tempObj[key];
          if (valueArray === undefined) {
            throw new Error('You should set alternativeRange value!');
          }
          this.broadcast({ event: 'alternativeRange', value: valueArray });
        } else if (key === 'range') {
          this.broadcast({ event: 'range', value: Boolean(value) });
        } else if (key === 'min' || key === 'max') {
          this.broadcast({ event: key, value: Number(value) });
        } else if (key === 'precision' || key === 'partsNum') {
          this.broadcast({ event: key, value: Number(value) });
        } else if (key === 'step' || key === 'thumbLeftPos') {
          this.broadcast({ event: key, value: Number(value), method: 'setOptions' });
        } else if (key === 'thumbRightPos') {
          this.broadcast({ event: key, value: Number(value), method: 'setOptions' });
        }
      }
    });

    return this;
  }

  setThumbsPos(opts: {left?: number, right?: number}): Model {
    const { options, validator } = this;
    const {
      left = options.thumbLeftPos,
      right = options.thumbRightPos,
    } = opts;

    if ('left' in opts) {
      const res = validator.validate({ thumbLeftPos: left }).thumbLeftPos;
      if (typeof res !== 'undefined') {
        options.thumbLeftPos = res;

        this.broadcast({
          event: 'thumbLeftPos',
          value: options.thumbLeftPos,
          method: 'setThumbsPos',
        });
      }
    }

    if ('right' in opts) {
      const res = validator.validate({ thumbRightPos: right }).thumbRightPos;
      if (typeof res !== 'undefined') {
        options.thumbRightPos = res;
        this.broadcast({
          event: 'thumbRightPos',
          value: options.thumbRightPos,
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
