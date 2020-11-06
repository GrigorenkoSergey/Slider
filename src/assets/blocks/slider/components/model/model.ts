/* eslint-disable @typescript-eslint/no-unused-vars */
import debuggerPoint from '../../../helpers/debugger-point';
import EventObserver from '../../../helpers/event-observer';
import isIncreasing from '../../../helpers/functions/is-increasing';

import '../../../helpers/types';

export default class Model extends EventObserver {
  min = 0;
  max = 100;
  step = 1;
  thumbLeftPos = 0;
  thumbRightPos: number = Infinity;
  ticks: {[key: number]: number} = {0: 0};
  range = false;

  constructor(options: Obj) {
    super();
    const optionsCopy = {...options};
    const argsRequire = ['min', 'max'];

    if (!argsRequire.every((key) => key in optionsCopy)) {
      throw new Error(
        `Not enough values. Should be at least 
        "${argsRequire.join('", "')}" in options`,
      );
    }

    const defaultOptions: Obj = {
      step: () => Math.round((optionsCopy.max - optionsCopy.min) / 100),
      thumbLeftPos: () => optionsCopy.min,
      ticks: () => {
        return {[optionsCopy.max]: optionsCopy.max};
      },
      range: () => false,
      thumbRightPos: () => Infinity,
    };

    Object.keys(defaultOptions).forEach((key) => {
      if (!(key in options)) optionsCopy[key] = defaultOptions[key]();
    });

    this.setOptions(optionsCopy);
  }

  getOptions() { //Нормально
    const publicOtions = ['min', 'max', 'range', 'step',
      'thumbLeftPos', 'thumbRightPos', 'ticks',];

    const obj: Obj = {};
    publicOtions.forEach((key) => obj[key] = this[<keyof this>key]);
    return obj;
  }

  setOptions(expectant: Obj): Model {
    const tempObj: Obj = {};
    const expectantCopy = {...expectant};

    if ('range' in expectantCopy) {
      const {range, thumbRightPos = this.thumbRightPos, max = this.max} = expectantCopy;

      if (range && thumbRightPos === Infinity) {
        expectantCopy.thumbRightPos = max;
      } else if (!range) {
        expectantCopy.thumbRightPos = Infinity;
      }
    }

    Object.entries(expectantCopy).forEach(([key, value]) => {
      if (key in this) {
        tempObj[key] = this._handleOption(key, value, expectantCopy)
      }
    });

    if (!('ticks' in tempObj) ) {
      if (Object.keys(this.ticks).length > 1) {
        tempObj.ticks = this._handleOption('ticks', this.ticks, expectantCopy);
      } else {
        const {max = this.max} = tempObj;
        tempObj.ticks = {[max]: max};
      }
    }

    Object.assign(this, tempObj);

    Object.keys(tempObj).forEach(key => {
      this.broadcast(key, {value: this[<keyof this>key]});
    });

    return this;
  }

  setThumbsPos(opts: {left?: number, right?: number}): Model {
    let {left = this.thumbLeftPos, right = this.thumbRightPos} = opts;

    if ('left' in opts) {
      this.thumbLeftPos = this._handleOption('thumbLeftPos', left, this);
      this.broadcast('thumbLeftPos', {value: this.thumbLeftPos});
    }

    if ('right' in opts) {
      this.thumbRightPos = this._handleOption('thumbRightPos', right, this);
      this.broadcast('thumbRightPos', {value: this.thumbRightPos});
    }
    return this;
  }

  findValue(offset: number): number { // y = f(x), here we find 'y'
    const ticksRange = Object.keys(this.ticks).map((item) => Number(item));
    const ticksValues = Object.values(this.ticks);
    const totalItems = Object.values(this.ticks).pop();

    for (let i = 0; i < ticksRange.length; i++) {
      // немного бизнес-логики (просто интерполяция)
      if (ticksValues[i] / totalItems >= offset) {
        let a = ticksRange[i - 1] ? ticksValues[i - 1] : 0;
        a /= totalItems;
        let b = ticksValues[i];
        b /= totalItems;

        const fnA = ticksRange[i - 1] ? ticksRange[i - 1] : this.min;
        const fnB = ticksRange[i];

        return this._takeStepIntoAccount((offset - a) * (fnB - fnA) / (b - a) + fnA);
      }
    }
  }

  findArgument(x: number): number { // y = f(x), here we find 'x'
    const ticksRange = Object.keys(this.ticks).map((item) => Number(item));
    const ticksValues = Object.values(this.ticks);
    const totalItems = Object.values(this.ticks).pop();

    for (let i = 0; i < ticksRange.length; i++) {
      if (ticksRange[i] >= x) {
        let a = ticksRange[i - 1] ? ticksValues[i - 1] : 0;
        a /= totalItems;
        let b = ticksValues[i];
        b /= totalItems;
        const fnA = ticksRange[i - 1] ? ticksRange[i - 1] : this.min;
        const fnB = ticksRange[i];

        return (x - fnA) * (b - a) / (fnB - fnA) + a;
      }
    }
  }

  private _takeStepIntoAccount(x: number): number {
    return Math.round((x - this.min) / this.step) * this.step + this.min;
  }

  private _handleOption(key: string, value: any, expectant: Obj) {
    const handler: Obj = {
      step: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('step should be a number!');
        }

        const {min = this.min, max = this.max} = expectant;
        
        if (val > max - min) {
          throw new Error('step is too big!');
        } else if (val < 0) {
          throw new Error('step is negative!');
        } else if (val == 0) {
          throw new Error('step is equal to zero!');
        }
        return Number(val);
      },

      min: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('"min" should be a number!');
        }

        const {max = this.max, step = this.step} = expectant;
        if (val >= max) {
          throw new Error('"min" should be lesser than "max"!');
        } else if (max - val < step) {
          throw new Error('"max" - "min" should be >= "step"!');
        }

        return Number(val);
      },

      max: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('"max" should be a number!');
        }

        const {min = this.min, step = this.step} = expectant;

        if (val <= min) {
          throw new Error('"max" should be greater than "min"!');
        } else if (val - min < step) {
          throw new Error('"max" - "min" should be >= "step"!');
        }

        return Number(val);
      },

      range: (val: boolean) => {
        if (typeof val !== 'boolean') {
          throw new Error('"range" should be boolean!');
        }

        return val;
      },

      thumbLeftPos: (val: number) => {
        if (!isFinite(val)) {
          throw new Error('"thumbLeftPos" should be a number!');
        }

        let {thumbRightPos = this.thumbRightPos, min = this.min, max = this.max} = expectant;

        if (thumbRightPos && thumbRightPos <= val) {
          throw new Error('"thumbLeftPos" should be lesser than "thumbRightPos"')
        }

        return Math.min(Math.max(min, val), max);
      },

      thumbRightPos: (val: number) => {
        const {range = this.range, max = this.max} = expectant;
        if (!range) return Infinity;

        if (!isFinite(val)) {
          throw new Error('"thumbRightPos" should be a number!');
        }

        let {thumbLeftPos = this.thumbLeftPos} = expectant;

        if (val <= thumbLeftPos) {
          throw new Error('"thumbRightPos should be greater than "thumbLeftPos"');
        }
        return Math.min(val, max);
      },

      ticks: (val: Obj) => {
        const keys = Object.keys(val);
        const vals = Object.values(val);
        const {max = this.max, min = this.min} = expectant;

        if (keys[keys.length - 1] != max) {
          if (debuggerPoint.start == 8) debugger;
          throw new Error('Last key of ticks should be equal to max!');
        } else if (keys[0] < min) {
          throw new Error('First key of ticks should be greater then min!');
        } else if (!isIncreasing(vals) || !isIncreasing(keys)) {
          throw new Error('Both keys and values of ticks must be increasing sequenses!');
        }

        return val;
      },
    }

    if (!(key in handler)) return;
    return handler[key](value);
  }
}
