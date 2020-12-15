import Model from '../model';
import { ModelOptions } from './model-types';

export class ModelValidator {
  model: Model;

  modifiedObj: ModelOptions;

  originObj: ModelOptions;

  constructor(model: Model) {
    this.model = model;
    this.modifiedObj = {};
    this.originObj = {};
  }

  validate(originObj: ModelOptions) {
    this.modifiedObj = { ...originObj };
    this.originObj = originObj;

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

    const { modifiedObj } = this;

    order.forEach((prop) => {
      if (prop in modifiedObj) {
        switch (prop) {
          case 'precision':
          case 'partsNum':
          case 'min':
          case 'max':
          case 'step':
          case 'thumbLeftPos':
          case 'thumbRightPos': {
            const value = modifiedObj[prop];
            if (typeof value !== 'undefined') {
              this[prop](value);
            }
          }
            break;
          case 'alternativeRange': {
            const value = modifiedObj[prop];
            if (typeof value !== 'undefined') {
              this[prop](value);
            }
          }
            break;
          case 'range': {
            const value = modifiedObj[prop];
            if (typeof value !== 'undefined') {
              this[prop](value);
            }
          }
            break;
          default:
            throw new Error();
        }
      }
    });

    return modifiedObj;
  }

  private precision(val: number) {
    if (![0, 1, 2, 3].includes(Number(val))) {
      throw new Error('"precision" should be integer in range [0, 3]');
    }
    const { modifiedObj } = this;
    modifiedObj.precision = Number(val);
  }

  private partsNum(val: number) {
    if (!Number.isInteger(val)) {
      throw new Error('"partsNum" should be integer!');
    } else if (val < 1) {
      throw new Error('"partsNum" should be >= 1');
    }

    const { modifiedObj } = this;
    const { min, max, step } = { ...this.model.getOptions(), ...modifiedObj };

    if ((val - 1) * step >= (max - min)) {
      throw new Error('"partsNum" is to large!');
    }

    modifiedObj.partsNum = val;
  }

  private alternativeRange(val: string[]) {
    if (val.length <= 1) {
      throw new Error('"alternativeRange" is a string array with more then one value!');
    }

    const { originObj, modifiedObj } = this;
    if ('min' in originObj) {
      throw new Error('You should not set "min" when you set "alternativeRange"');
    }
    if ('max' in originObj) {
      throw new Error('You should not set "max" when you set "alternativeRange"');
    }

    modifiedObj.min = 0;
    modifiedObj.max = val.length - 1;
  }

  private min(val: number) {
    const { modifiedObj, originObj } = this;
    const {
      max,
      step,
      partsNum,
      thumbLeftPos,
      thumbRightPos,
      precision,
      alternativeRange,
    } = { ...this.model.getOptions(), ...modifiedObj };

    if (val >= max) {
      throw new Error('"min" should be < "max"!');
    } else if (max - val < step) {
      throw new Error('"max" - "min" should be >= "step"!');
    } else if (val + step * partsNum >= max + step) {
      console.log('min + step * partsNum should be < max + step\nSet partsNum = 1');
      modifiedObj.partsNum = 1;
    } else if (alternativeRange.length !== 0) {
      if ('min' in originObj) {
        console.log('when you set "min" option "alternativeRange" sets to []');
        modifiedObj.alternativeRange = [];
      }
    }

    if (val > thumbLeftPos) {
      if ('thumbLeftPos' in originObj) {
        throw new Error('"thumbLeftPos" should be >= "min"!');
      }
      modifiedObj.thumbLeftPos = Number(Number(val).toFixed(precision));
    }

    if (val > thumbRightPos) {
      if ('thumbRightPos' in originObj) {
        throw new Error('"thumbRightPos" should be > "min"!');
      }
      modifiedObj.thumbRightPos = Number(Number(max).toFixed(precision));
    }

    modifiedObj.min = Number(Number(val).toFixed(precision));
  }

  private max(val: number) {
    const { modifiedObj, originObj } = this;
    const {
      min,
      step,
      partsNum,
      thumbLeftPos,
      thumbRightPos,
      precision,
      alternativeRange,
    } = { ...this.model.getOptions(), ...modifiedObj };

    if (val <= min) {
      throw new Error('"max" should be >= "min"!');
    } else if (val - min < step) {
      throw new Error('"max" - "min" should be >= "step"!');
    } else if (min + step * partsNum >= val + step) {
      console.log('min + step * partsNum should be < max + step\nSet partsNum = 1');
      modifiedObj.partsNum = 1;
    } else if (alternativeRange.length !== 0) {
      if ('max' in originObj) {
        console.log('when you set "max" option "alternativeRange" sets to []');
        modifiedObj.alternativeRange = [];
      }
    }

    if (thumbLeftPos > val) {
      if ('thumbLeftPos' in originObj) {
        throw new Error('"thumbLeftPos" should be <= "max"!');
      }
      if (thumbRightPos !== Infinity) {
        modifiedObj.thumbLeftPos = min;
        modifiedObj.thumbRightPos = Number(Number(val).toFixed(precision));
      } else {
        modifiedObj.thumbLeftPos = Number(Number(val).toFixed(precision));
      }
    }

    if (thumbRightPos !== Infinity && thumbRightPos > val) {
      if ('thumbRightPos' in originObj) {
        throw new Error('"thumbRightPos should be <= "max"!');
      }
      modifiedObj.thumbRightPos = Number(Number(val).toFixed(precision));
    }

    modifiedObj.max = Number(Number(val).toFixed(precision));
  }

  private step(val: number) {
    const { modifiedObj } = this;
    const {
      min,
      max,
      precision,
      partsNum,
      thumbLeftPos,
      thumbRightPos,
    } = { ...this.model.getOptions(), ...modifiedObj };

    if (val > max - min) {
      throw new Error('"step" is too big!');
    } else if (val < 0) {
      throw new Error('"step" is negative!');
    } else if (val === 0) {
      throw new Error('"step" is equal to zero!');
    } else if (min + val * partsNum >= max + val) {
      console.log('min + step * partsNum should be < max + step\nSet partsNum = 1');
      modifiedObj.partsNum = 1;
    }

    modifiedObj.step = Number(Number(val).toFixed(precision));
    modifiedObj.thumbLeftPos = thumbLeftPos;
    modifiedObj.thumbRightPos = thumbRightPos;
  }

  private range(val: boolean) {
    const { modifiedObj } = this;
    const { thumbRightPos, max } = { ...this.model.getOptions(), ...modifiedObj };

    if (val && thumbRightPos === Infinity) {
      modifiedObj.thumbRightPos = max;
    } else if (!val) {
      modifiedObj.thumbRightPos = Infinity;
    }

    modifiedObj.range = val;
  }

  private thumbLeftPos(val: number) {
    const { modifiedObj } = this;
    const {
      thumbRightPos, min, max, precision, step,
    } = { ...this.model.getOptions(), ...modifiedObj };

    if (thumbRightPos < val) {
      throw new Error('"thumbLeftPos" should be <= than "thumbRightPos"');
    }

    const maxValue = Math.floor((max - min) / step) * step + min;
    const roundedToStep = Math.round((val - min) / step) * step + min;
    modifiedObj.thumbLeftPos = Number(
      Math.min(Math.max(min, roundedToStep), maxValue).toFixed(precision),
    );
  }

  private thumbRightPos(val: number) {
    const { modifiedObj } = this;
    const {
      range, max, step, min,
    } = { ...this.model.getOptions(), ...modifiedObj };

    if (!range) {
      modifiedObj.thumbRightPos = Infinity;
      return;
    }

    const { thumbLeftPos, precision } = { ...this.model.getOptions(), ...modifiedObj };

    if (val < thumbLeftPos) {
      throw new Error('"thumbRightPos should be greater than "thumbLeftPos"');
    }

    const maxValue = Math.floor((max - min) / step) * step + min;
    const roundedToStep = Math.round((val - min) / step) * step + min;
    modifiedObj.thumbRightPos = Number(Math.min(roundedToStep, maxValue).toFixed(precision));
  }
}
