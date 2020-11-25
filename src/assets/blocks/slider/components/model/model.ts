/* eslint-disable @typescript-eslint/no-unused-vars */
import debuggerPoint from '../../../helpers/debugger-point';
import EventObserver from '../../../helpers/event-observer';
import isIncreasing from '../../../helpers/functions/is-increasing';

import '../../../helpers/types';

export default class Model extends EventObserver {
  min = 0;
  max = 100;
  step = 1;
  partsNum = 2;
  thumbLeftPos = 0;
  thumbRightPos: number = Infinity;
  range = false;
  precision: number = 1;
  alternativeRange: string[] = [];

  constructor(options: Obj) {
    super();
    const optionsCopy = {...options};
    const argsRequire = ['min', 'max'];

    if (!argsRequire.every((key) => key in optionsCopy)) {
      if (!('alternativeRange' in optionsCopy)) {
        throw new Error(
          `Not enough values. There must be at least the "min" and "max" options
            or the "alternativeRange" option must be set`
        );
      }
    }

    const defaultOptions: Obj = {
      step: () => {
        if (!('alternativeRange' in optionsCopy)) {
          return Math.round((optionsCopy.max - optionsCopy.min) / 100);
        } else {
          return 1;
        }
      },
      thumbLeftPos: () => optionsCopy.min || 0,
      thumbRightPos: () => Infinity,
    };

    Object.keys(defaultOptions).forEach((key) => {
      if (!(key in options)) optionsCopy[key] = defaultOptions[key]();
    });

    this.setOptions(optionsCopy);
  }

  getOptions() {
    const publicOtions = ['min', 'max', 'range', 'step', 'partsNum',
      'thumbLeftPos', 'thumbRightPos', 'precision', 'alternativeRange'];

    const obj: Obj = {};
    publicOtions.forEach((key) => obj[key] = this[<keyof this>key]);
    return obj;
  }

  setOptions(expectant: Obj): Model {
    let tempObj: Obj = {};
    Object.entries(expectant).forEach(([key, value]) => {
      if (key in this) {
        tempObj[key] = value;
      }
    });

    tempObj = this._handleOptions(tempObj);
    Object.assign(this, tempObj);

    Object.keys(tempObj).forEach(key => {
      this.broadcast(key, {value: this[<keyof this>key], method: 'setOptions'});
    });

    return this;
  }

  setThumbsPos(opts: {left?: number, right?: number}): Model {
    let {left = this.thumbLeftPos, right = this.thumbRightPos} = opts;

    if ('left' in opts) {
      this.thumbLeftPos = this._handleOptions({thumbLeftPos: left}).thumbLeftPos;
      this.broadcast('thumbLeftPos', {value: this.thumbLeftPos, method: 'setThumbsPos'});
    }

    if ('right' in opts) {
      this.thumbRightPos = this._handleOptions({thumbRightPos: right}).thumbRightPos;
      this.broadcast('thumbRightPos', {value: this.thumbRightPos, method: 'setThumbsPos'});
    }
    return this;
  }

  findValue(x: number): number { // y = f(x), here we find 'y'
    let result =  x  * (this.max - this.min) + this.min;
    return Number(result.toFixed(this.precision));
  }

  findArgument(y: number): number { // y = f(x), here we find 'x'
    return (y - this.min) / (this.max - this.min);
  }

  private _handleOptions(expectant: Obj) {
    const expectantCopy = {...expectant};

    const handler: Obj = {
      precision: (val: number) => {
        if (![0, 1, 2, 3].includes(Number(val))) {
          throw new Error('"precision" should be integer in range [0, 3]');
        }
  
        expectantCopy.precision = Number(val);
      },

      partsNum: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('"partsNum" should be a number!');
        } else if (!Number.isInteger(val)) {
          throw new Error('"partsNum" should be integer!');
        } else if (val < 1) {
          throw new Error('"partsNum" should be >= 1');
        }

        const {
          min = this.min,
          max = this.max,
          step = this.step,
        } = expectantCopy;

        if ((val - 1) * step >= (max - min)) {
          throw new Error('"partsNum" is to large!');
        }

        expectantCopy.partsNum = val;
      },

      alternativeRange: (val: string[]) => {
        if (val.length  <= 1) {
          throw new Error('"alternativeRange" is a string array with more then one value!');
        }

        if ('min' in expectant) {
          throw new Error(`You should not set "min" when you set "alternativeRange"`);
        }
        if ('max' in expectant) {
          throw new Error(`You should not set "max" when you set "alternativeRange"`);
        }

        expectantCopy.min = 0;
        expectantCopy.max = val.length - 1;
      },

      min: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('"min" should be a number!');
        }

        const {
          max = this.max, 
          step = this.step, 
          partsNum = this.partsNum,
          thumbLeftPos = this.thumbLeftPos,
          thumbRightPos = this.thumbRightPos,
          precision = this.precision,
          alternativeRange = this.alternativeRange,
        } = expectantCopy;

        if (val >= max) {
          throw new Error('"min" should be < "max"!');

        } else if (max - val < step) {
          throw new Error('"max" - "min" should be >= "step"!');

        } else if (max - val < step * partsNum) {
          console.log('max - min should be >= partsNum * step!\nSet partsNum = 1');
          expectantCopy.partsNum = 1;

        } else if (alternativeRange.length != 0) {
          console.log('when you set "min" option "alternativeRange" sets to []');
          expectantCopy.alternativeRange = [];
        }

        if (val > thumbLeftPos) {
          if ('thumbLeftPos' in expectant) {
            throw new Error('"thumbLeftPos" should be >= "min"!');
          }
          expectantCopy.thumbLeftPos = +Number(val).toFixed(precision);
        }
        if (val > thumbRightPos) {
          if ('thumbRightPos' in expectant) {
            throw new Error('"thumbRightPos" should be > "min"!');
          }
          expectantCopy.thumbRightPos = +Number(max).toFixed(precision);
        }

        expectantCopy.min = +Number(val).toFixed(precision);
      },

      max: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('"max" should be a number!');
        }

        const {
          min = this.min, 
          step = this.step,
          partsNum = this.partsNum,
          thumbLeftPos = this.thumbLeftPos,
          thumbRightPos = this.thumbRightPos,
          precision = this.precision,
          alternativeRange = this.alternativeRange,
        } = expectantCopy;

        if (val <= min) {
          throw new Error('"max" should be >= "min"!');

        } else if (val - min < step) {
          throw new Error('"max" - "min" should be >= "step"!');

        } else if (val - min < step * partsNum) {
          console.log('max - min should be >= partsNum * step!\nSet partsNum = 1');
          expectantCopy.partsNum = 1;

        } else if (alternativeRange.length != 0) {
          console.log('when you set "max" option "alternativeRange" sets to []');
          expectantCopy.alternativeRange = [];
        }

        if (thumbLeftPos > val) {
          if ('thumbLeftPos' in expectant) {
            throw new Error('"thumbLeftPos" should be <= "max"!')
          }
          if (thumbRightPos !== Infinity) {
            expectantCopy.thumbLeftPos = min;
            expectantCopy.thumbRightPos = +Number(val).toFixed(precision);
          } else {
            expectantCopy.thumbLeftPos = +Number(val).toFixed(precision);
          }
        }

        if (thumbRightPos !== Infinity && thumbRightPos > val) {
          if ('thumbRightPos' in expectant) {
            throw new Error('"thumbRightPos should be <= "max"!');
          }
          expectantCopy.thumbRightPos = +Number(val).toFixed(precision);
        }

        expectantCopy.max = +Number(val).toFixed(precision);
      },

      step: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('"step" should be a number!');
        }

        const {
          min = this.min, 
          max = this.max, 
          precision = this.precision,
          partsNum = this.partsNum,
          alternativeRange = this.alternativeRange,
        } = expectantCopy;
        
        if (val > max - min) {
          throw new Error('"step" is too big!');
        } else if (val < 0) {
          throw new Error('"step" is negative!');
        } else if (val == 0) {
          throw new Error('"step" is equal to zero!');
        } else if (val * partsNum > max - min) {
          console.log('step * partsNum should be <= max - min!\nSet partsNum = 1');
          expectantCopy.partsNum = 1;
        }

        expectantCopy.step = +Number(val).toFixed(precision);
      },

      range: (val: boolean) => {
        if (typeof val !== 'boolean') {
          throw new Error('"range" should be boolean!');
        }

        const {thumbRightPos = this.thumbRightPos, max = this.max} = expectantCopy;

        if (val && thumbRightPos === Infinity) {
          expectantCopy.thumbRightPos = max;
        } else if (!val) {
          expectantCopy.thumbRightPos = Infinity;
        }

        expectantCopy.range = val;
      },

      thumbLeftPos: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('"thumbLeftPos" should be a number!');
        }

        let {
          thumbRightPos = this.thumbRightPos, 
          min = this.min, 
          max = this.max,
          precision = this.precision,
        } = expectantCopy;

        if (thumbRightPos <= val) {
          throw new Error('"thumbLeftPos" should be lesser than "thumbRightPos"')
        }

        expectantCopy.thumbLeftPos = +Math.min(Math.max(min, val), max).toFixed(precision);
      },

      thumbRightPos: (val: number) => {
        const {range = this.range, max = this.max} = expectantCopy;
        if (!range) return Infinity;

        if (!isFinite(val)) {
          throw new Error('"thumbRightPos" should be a number!');
        }

        let {thumbLeftPos = this.thumbLeftPos, precision = this.precision} = expectantCopy;

        if (val <= thumbLeftPos) {
          throw new Error('"thumbRightPos should be greater than "thumbLeftPos"');
        }

        expectantCopy.thumbRightPos = +Math.min(val, max).toFixed(precision)
      },
    }

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

    order.forEach(prop => {
      if (prop in expectant) {
        handler[prop].call(this, expectantCopy[prop]);
      }
    });

    return expectantCopy;
  }
}
