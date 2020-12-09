/* eslint-disable no-restricted-globals */
/* eslint-disable @typescript-eslint/no-unused-vars */
import debuggerPoint from '../../../helpers/debugger-point';
import EventObserver from '../../../helpers/event-observer';

import { Obj } from '../../../helpers/types';
import { ModelType, ModelOptions } from './model-types';

export default class Model extends EventObserver {
  private options: ModelType = {
    min: 0,
    max: 100,
    step: 1,
    partsNum: 2,
    thumbLeftPos: 0,
    thumbRightPos: Infinity,
    range: false,
    precision: 0,
    alternativeRange: [] as string[],
  }

  constructor(options: ModelOptions) {
    super();
    const optionsCopy = { ...options };
    // const argsRequire = ['min', 'max'];

    // if (!argsRequire.every((key) => key in optionsCopy)) {
    //   if (!('alternativeRange' in optionsCopy)) {
    //     throw new Error(
    //       `Not enough values. There must be at least the "min" and "max" options
    //         or the "alternativeRange" option must be set`,
    //     );
    //   }
    // }

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

      (<Obj>optionsCopy)[key] = (defaultDependentOptions as Obj)[key]();
    });

    this.setOptions(optionsCopy);
  }

  getOptions() {
    const obj = { ...this.options };
    return obj;
  }

  setOptions(expectant: ModelOptions): Model {
    let tempObj: Obj = {};

    Object.entries(expectant).forEach(([key, value]) => {
      if (key in this.options) {
        tempObj[key] = value;
      }
    });

    tempObj = this.handleOptions(tempObj);
    Object.assign(this.options, tempObj);

    Object.keys(tempObj).forEach((key) => {
      this.broadcast(key, { value: tempObj[key], method: 'setOptions' });
    });

    return this;
  }

  setThumbsPos(opts: {left?: number, right?: number}): Model {
    const {
      left = this.options.thumbLeftPos,
      right = this.options.thumbRightPos,
    } = opts;

    if ('left' in opts) {
      this.options.thumbLeftPos = this.handleOptions({ thumbLeftPos: left }).thumbLeftPos;

      this.broadcast('thumbLeftPos', {
        value: this.options.thumbLeftPos,
        method: 'setThumbsPos',
      });
    }

    if ('right' in opts) {
      this.options.thumbRightPos = this.handleOptions({ thumbRightPos: right }).thumbRightPos;
      this.broadcast('thumbRightPos', {
        value: this.options.thumbRightPos,
        method: 'setThumbsPos',
      });
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

  private handleOptions(expectant: Obj) {
    const expectantCopy = { ...expectant };

    const handler: Obj = {
      precision: (val: number) => {
        if (![0, 1, 2, 3].includes(Number(val))) {
          throw new Error('"precision" should be integer in range [0, 3]');
        }

        expectantCopy.precision = Number(val);
      },

      partsNum: (val: number) => {
        if (!Number.isInteger(val)) {
          throw new Error('"partsNum" should be integer!');
        } else if (val < 1) {
          throw new Error('"partsNum" should be >= 1');
        }

        const { min, max, step } = { ...this.options, ...expectantCopy };

        if ((val - 1) * step >= (max - min)) {
          throw new Error('"partsNum" is to large!');
        }

        expectantCopy.partsNum = val;
      },

      alternativeRange: (val: string[]) => {
        if (val.length <= 1) {
          throw new Error('"alternativeRange" is a string array with more then one value!');
        }
        if ('min' in expectant) {
          throw new Error('You should not set "min" when you set "alternativeRange"');
        }
        if ('max' in expectant) {
          throw new Error('You should not set "max" when you set "alternativeRange"');
        }

        expectantCopy.min = 0;
        expectantCopy.max = val.length - 1;
      },

      min: (val: number) => {
        const {
          max,
          step,
          partsNum,
          thumbLeftPos,
          thumbRightPos,
          precision,
          alternativeRange,
        } = { ...this.options, ...expectantCopy };

        if (val >= max) {
          throw new Error('"min" should be < "max"!');
        } else if (max - val < step) {
          throw new Error('"max" - "min" should be >= "step"!');
        } else if (val + step * partsNum > max + step) {
          console.log('min + step * partsNum should be > max + step\nSet partsNum = 1');
          expectantCopy.partsNum = 1;
        } else if (alternativeRange.length !== 0) {
          if ('min' in expectant) {
            console.log('when you set "min" option "alternativeRange" sets to []');
            expectantCopy.alternativeRange = [];
          }
        }

        if (val > thumbLeftPos) {
          if ('thumbLeftPos' in expectant) {
            throw new Error('"thumbLeftPos" should be >= "min"!');
          }
          expectantCopy.thumbLeftPos = Number(Number(val).toFixed(precision));
        }

        if (val > thumbRightPos) {
          if ('thumbRightPos' in expectant) {
            throw new Error('"thumbRightPos" should be > "min"!');
          }
          expectantCopy.thumbRightPos = Number(Number(max).toFixed(precision));
        }

        expectantCopy.min = Number(Number(val).toFixed(precision));
      },

      max: (val: number) => {
        const {
          min,
          step,
          partsNum,
          thumbLeftPos,
          thumbRightPos,
          precision,
          alternativeRange,
        } = { ...this.options, ...expectantCopy };

        if (val <= min) {
          throw new Error('"max" should be >= "min"!');
        } else if (val - min < step) {
          throw new Error('"max" - "min" should be >= "step"!');
        } else if (min + step * partsNum > val + step) {
          console.log('min + step * partsNum should be > max + step\nSet partsNum = 1');
          expectantCopy.partsNum = 1;
        } else if (alternativeRange.length !== 0) {
          if ('max' in expectant) {
            console.log('when you set "max" option "alternativeRange" sets to []');
            expectantCopy.alternativeRange = [];
          }
        }

        if (thumbLeftPos > val) {
          if ('thumbLeftPos' in expectant) {
            throw new Error('"thumbLeftPos" should be <= "max"!');
          }
          if (thumbRightPos !== Infinity) {
            expectantCopy.thumbLeftPos = min;
            expectantCopy.thumbRightPos = Number(Number(val).toFixed(precision));
          } else {
            expectantCopy.thumbLeftPos = Number(Number(val).toFixed(precision));
          }
        }

        if (thumbRightPos !== Infinity && thumbRightPos > val) {
          if ('thumbRightPos' in expectant) {
            throw new Error('"thumbRightPos should be <= "max"!');
          }
          expectantCopy.thumbRightPos = Number(Number(val).toFixed(precision));
        }

        expectantCopy.max = Number(Number(val).toFixed(precision));
      },

      step: (val: number) => {
        const {
          min,
          max,
          precision,
          partsNum,
          thumbLeftPos,
          thumbRightPos,
        } = { ...this.options, ...expectantCopy };

        if (val > max - min) {
          throw new Error('"step" is too big!');
        } else if (val < 0) {
          throw new Error('"step" is negative!');
        } else if (val === 0) {
          throw new Error('"step" is equal to zero!');
        } else if (min + val * partsNum > max + val) {
          console.log('min + step * partsNum should be > max + step\nSet partsNum = 1');
          expectantCopy.partsNum = 1;
        }

        expectantCopy.step = Number(Number(val).toFixed(precision));
        expectantCopy.thumbLeftPos = thumbLeftPos;
        expectantCopy.thumbRightPos = thumbRightPos;
      },

      range: (val: boolean) => {
        const { thumbRightPos, max } = { ...this.options, ...expectantCopy };

        if (val && thumbRightPos === Infinity) {
          expectantCopy.thumbRightPos = max;
        } else if (!val) {
          expectantCopy.thumbRightPos = Infinity;
        }

        expectantCopy.range = val;
      },

      thumbLeftPos: (val: number) => {
        const {
          thumbRightPos, min, max, precision, step,
        } = { ...this.options, ...expectantCopy };

        if (thumbRightPos < val) {
          throw new Error('"thumbLeftPos" should be <= than "thumbRightPos"');
        }

        const maxValue = Math.floor((max - min) / step) * step + min;
        const roundedToStep = Math.round((val - min) / step) * step + min;
        expectantCopy.thumbLeftPos = Number(
          Math.min(Math.max(min, roundedToStep), maxValue).toFixed(precision),
        );
      },

      thumbRightPos: (val: number) => {
        const {
          range, max, step, min,
        } = { ...this.options, ...expectantCopy };

        if (!range) return Infinity;

        const { thumbLeftPos, precision } = { ...this.options, ...expectantCopy };

        if (val < thumbLeftPos) {
          throw new Error('"thumbRightPos should be greater than "thumbLeftPos"');
        }

        const maxValue = Math.floor((max - min) / step) * step + min;
        const roundedToStep = Math.round((val - min) / step) * step + min;
        expectantCopy.thumbRightPos = Number(Math.min(roundedToStep, maxValue).toFixed(precision));
      },
    };

    const order = [
      'precision',
      'partsNum',
      'alternativeRange',
      'min',
      'max',
      'step',
      'range',
      'thumbLeftPos',
      'thumbRightPos',
    ];

    order.forEach((prop) => {
      if (prop in expectantCopy) {
        handler[prop].call(this.options, expectantCopy[prop]);
      }
    });

    return expectantCopy;
  }
}
