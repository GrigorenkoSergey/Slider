import EventObserver from '../../../helpers/event-observer';
import isIncreasing from '../../../helpers/functions/is-increasing';

import '../../../helpers/types';

// import debuggerPoint from '../../../helpers/debugger-point';

export default class Model extends EventObserver {
  min = 0;
  max = 100;
  step = 1;
  thumbLeftPos = 0;
  thumbRightPos = 0;
  ticks: {[key: number]: number} = {0: 0};
  range = false;

  private _totalItems: number;
  private _ticksRange: number[];
  private _ticksValues: number[];

  constructor(options: Obj) {
    super();
    const argsRequire = ['min', 'max'];

    if (!argsRequire.every((key) => key in options)) {
      throw new Error(
        `Not enough values. Should be at least 
        "${argsRequire.join('", "')}" in options`,
      );
    }

    const defaultOptions: Obj = {
      step: () => Math.round((options.max - options.min) / 100),
      thumbLeftPos: () => options.min,
      thumbRightPos: () => options.max,
      ticks: () => {
        return {[options.max]: options.max};
      },
      range: () => false,
    };

    Object.keys(defaultOptions).forEach((key) => {
      if (!(key in options)) options[key] = defaultOptions[key]();
    });

    this.setOptions(options);
  }

  getOptions() { //Нормально
    const publicOtions = ['min', 'max', 'range', 'step',
      'thumbLeftPos', 'thumbRightPos', 'ticks',];

    const obj: Obj = {};
    publicOtions.forEach((key) => obj[key] = this[<keyof this>key]);
    return obj;
  }

  setOptions(expectant: Obj): Model {
    const shouldBeNumbers: string[] = [
      'min', 
      'max', 
      'step', 
      'thumbLeftPos',
      'thumbRightPos',
    ];

    // Проигнорируем лишние свойства
    const commonKeys = Object.keys(expectant).filter((key: string) => key in this);

    const trimedObj: Obj = {};
    commonKeys.forEach((key) => trimedObj[key] = expectant[key]);
    expectant = trimedObj;

    // Преобразуем необходимые значения в Number или выкинем ошибку при неудаче
    shouldBeNumbers.forEach((key) => {
      if (key in expectant) {
        expectant[key] = Number(expectant[key]);
        if (!isFinite(expectant[key])) {
          throw new Error(
            key[0].toUpperCase().slice(1) + ' should be a number!',
          );
        }
      }
    });

    const obj = Object.assign({}, this);
    Object.assign(obj, expectant);

    // if (debuggerPoint.start == 5) debugger; //Для будущей отладки
    if (Object.keys(obj.ticks).length < 2) obj.ticks = {[obj.max]: obj.max};

    let {min, max, step, thumbLeftPos, thumbRightPos, ticks} = obj;

    if (max < min) throw new Error('Max should be greater then min!');
    if (step > (max - min)) throw new Error('To large step!');
    if (step <= 0) throw new Error('Step should be >= 0');

    if (!obj.range) {
      thumbRightPos = max;
    } else {
      thumbRightPos = Math.max(min, Math.min(max, thumbRightPos));
    }
    thumbLeftPos = Math.min(max, Math.max(min, thumbLeftPos));

    if (thumbLeftPos > thumbRightPos) {
      [thumbLeftPos, thumbRightPos] = [thumbRightPos, thumbLeftPos];
    }

    Object.assign(obj, {thumbLeftPos, thumbRightPos});

    obj._totalItems = Object.values(ticks).pop();
    obj._ticksRange = Object.keys(ticks).map((item) => Number(item));
    obj._ticksValues = Object.values(ticks);
    this._validateTicks.call(obj);

    Object.assign(this, obj);
    Object.keys(expectant).forEach(key => {
      this.broadcast(key, {value: this[<keyof this>key]});
    });
    return this;
  }

  setThumbsPos(opts: {left?: number, right?: number, initiator?: any }): Model {
    let {left = this.thumbLeftPos, right = this.thumbRightPos, initiator = null} = opts;

    if (left > right) {
      [left, right] = [right, left];
    }

    if ('left' in opts) {
      left = Math.max(this.min, left);
      this.thumbLeftPos = this._takeStepIntoAccount(left);
      this.broadcast('thumbLeftPos', {value: this.thumbLeftPos, initiator});
    }

    if (this.range && 'right' in opts) {
      right = Math.min(right, this.max);
      this.thumbRightPos = this._takeStepIntoAccount(right);
      this.broadcast('thumbRightPos', {value: this.thumbRightPos, initiator});
    }

    return this;
  }

  findValue(offset: number): number { // y = f(x), here we find 'y'
    const ticksRange = this._ticksRange;
    const ticksValue = this._ticksValues;

    for (let i = 0; i < ticksRange.length; i++) {
      // немного бизнес-логики (просто интерполяция)
      if (ticksValue[i] / this._totalItems >= offset) {
        let a = ticksRange[i - 1] ? ticksValue[i - 1] : 0;
        a /= this._totalItems;
        let b = ticksValue[i];
        b /= this._totalItems;

        const fnA = ticksRange[i - 1] ? ticksRange[i - 1] : this.min;
        const fnB = ticksRange[i];

        return this._takeStepIntoAccount((offset - a) * (fnB - fnA) / (b - a) + fnA);
      }
    }
  }

  findArgument(x: number): number { // y = f(x), here we find 'x'
    const ticksRange = this._ticksRange;
    const ticksValue = this._ticksValues;

    for (let i = 0; i < ticksRange.length; i++) {
      if (ticksRange[i] >= x) {
        let a = ticksRange[i - 1] ? this._ticksValues[i - 1] : 0;
        a /= this._totalItems;
        let b = ticksValue[i];
        b /= this._totalItems;

        const fnA = ticksRange[i - 1] ? ticksRange[i - 1] : this.min;
        const fnB = ticksRange[i];

        return (x - fnA) * (b - a) / (fnB - fnA) + a;
      }
    }
  }

  private _takeStepIntoAccount(x: number): number {
    return Math.round((x - this.min) / this.step) * this.step + this.min;
  }

  private _validateTicks(): never | boolean {
    const ticksRange = this._ticksRange;
    const ticksValue = this._ticksValues;

    if (Number(ticksRange[ticksRange.length - 1]) != this.max) {
      throw new Error('last key of ticks should be equal to max!');
    } else if (Number(ticksRange[0]) < this.min) {
      throw new Error('First key of ticks should be greater then min!');
    } else if (!isIncreasing(ticksRange) || !isIncreasing(ticksValue)) {
      throw new Error(
        'Both keys and values of ticks must be increasing sequenses!',
      );
    }

    return true;
  };
}
