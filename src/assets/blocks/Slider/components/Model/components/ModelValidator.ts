import Model from '../Model';
import { ModelOptions } from './model-types';

export class ModelValidator {
  private model: Model;

  private modifiedObj: ModelOptions;

  private originObj: ModelOptions;

  constructor(model: Model) {
    this.model = model;
    this.modifiedObj = {};
    this.originObj = {};
  }

  validate(originObj: ModelOptions): ModelOptions {
    this.modifiedObj = { ...originObj };
    this.originObj = originObj;

    const order = [
      'precision',
      'partsAmount',
      'alternativeRange',
      'min',
      'max',
      'step',
      'range',
      'thumbLeftValue',
      'thumbRightValue',
    ];

    const { modifiedObj } = this;

    order.forEach((prop) => {
      if (prop in modifiedObj) {
        switch (prop) {
          case 'precision':
          case 'partsAmount':
          case 'min':
          case 'max':
          case 'step':
          case 'thumbLeftValue': {
            const value = modifiedObj[prop];
            if (value !== undefined) {
              this[prop](value);
            }
          }
            break;
          case 'thumbRightValue': {
            const value = modifiedObj[prop];
            if (value !== undefined) {
              this[prop](value);
            }
          }
            break;
          case 'alternativeRange': {
            const value = modifiedObj[prop];
            if (value !== undefined) {
              this[prop](value);
            }
          }
            break;
          case 'range': {
            const value = modifiedObj[prop];
            if (value !== undefined) {
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

  private precision(val: number): void {
    if (![0, 1, 2, 3].includes(Number(val))) {
      throw new Error('"precision" should be integer in range [0, 3]');
    }
    const { modifiedObj } = this;
    modifiedObj.precision = Number(val);
  }

  private partsAmount(val: number): void {
    if (!Number.isInteger(val)) {
      throw new Error('"partsAmount" should be integer!');
    } else if (val < 1) {
      throw new Error('"partsAmount" should be >= 1');
    }

    const { modifiedObj } = this;
    const { min, max, step } = { ...this.model.getOptions(), ...modifiedObj };

    if ((val - 1) * step >= (max - min)) {
      throw new Error('"partsAmount" is to large!');
    }

    if (val > 100) {
      throw new Error('"partsAmout" must be less than 101');
    }

    modifiedObj.partsAmount = val;
  }

  private alternativeRange(val: string[]): void {
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

  private min(val: number): void {
    const { modifiedObj, originObj } = this;
    const {
      max,
      step,
      partsAmount,
      thumbLeftValue,
      thumbRightValue,
      precision,
      alternativeRange,
    } = { ...this.model.getOptions(), ...modifiedObj };

    if (val >= max) {
      throw new Error('"min" should be < "max"!');
    } else if (max - val < step) {
      throw new Error('"max" - "min" should be >= "step"!');
    } else if (val + step * partsAmount >= max + step) {
      console.log('min + step * partsAmount should be < max + step\nSet partsAmount = 1');
      modifiedObj.partsAmount = 1;
    } else if (alternativeRange.length !== 0) {
      if ('min' in originObj) {
        console.log('when you set "min" option "alternativeRange" sets to []');
        modifiedObj.alternativeRange = [];
      }
    }

    if (val > thumbLeftValue) {
      if ('thumbLeftValue' in originObj) {
        throw new Error('"thumbLeftValue" should be >= "min"!');
      }
      modifiedObj.thumbLeftValue = Number(val.toFixed(precision));
    }

    if (thumbRightValue !== null && val > thumbRightValue) {
      if ('thumbRightValue' in originObj) {
        throw new Error('"thumbRightValue" should be > "min"!');
      }
      modifiedObj.thumbRightValue = Number(max.toFixed(precision));
    }

    modifiedObj.min = Number(val.toFixed(precision));
  }

  private max(val: number): void {
    const { modifiedObj, originObj } = this;
    const {
      min,
      step,
      partsAmount,
      thumbLeftValue,
      thumbRightValue,
      precision,
      alternativeRange,
    } = { ...this.model.getOptions(), ...modifiedObj };

    if (val <= min) {
      throw new Error('"max" should be >= "min"!');
    } else if (val - min < step) {
      throw new Error('"max" - "min" should be >= "step"!');
    } else if (min + step * partsAmount >= val + step) {
      console.log('min + step * partsAmount should be < max + step\nSet partsAmount = 1');
      modifiedObj.partsAmount = 1;
    } else if (alternativeRange.length !== 0) {
      if ('max' in originObj) {
        console.log('when you set "max" option "alternativeRange" sets to []');
        modifiedObj.alternativeRange = [];
      }
    }

    if (thumbLeftValue > val) {
      if ('thumbLeftValue' in originObj) {
        throw new Error('"thumbLeftValue" should be <= "max"!');
      }
      if (thumbRightValue !== null) {
        modifiedObj.thumbLeftValue = min;
        modifiedObj.thumbRightValue = Number(val.toFixed(precision));
      } else {
        modifiedObj.thumbLeftValue = Number(val.toFixed(precision));
      }
    }

    if (thumbRightValue !== null && thumbRightValue > val) {
      if ('thumbRightValue' in originObj) {
        throw new Error('"thumbRightValue should be <= "max"!');
      }
      modifiedObj.thumbRightValue = Number(val.toFixed(precision));
    }

    modifiedObj.max = Number(val.toFixed(precision));
  }

  private step(val: number): void {
    const { modifiedObj } = this;
    const {
      min,
      max,
      precision,
      partsAmount,
      thumbLeftValue,
      thumbRightValue,
    } = { ...this.model.getOptions(), ...modifiedObj };

    const newStep = Number(val.toFixed(precision));

    if (newStep > max - min) {
      throw new Error('"step" is too big!');
    } else if (newStep < 0) {
      throw new Error('"step" is negative!');
    } else if (newStep === 0) {
      throw new Error('"step" is equal or rounds to zero!');
    } else if (min + newStep * partsAmount >= max + newStep) {
      console.log('min + step * partsAmount should be < max + step\nSet partsAmount = 1');
      modifiedObj.partsAmount = 1;
    }

    modifiedObj.step = newStep;
    modifiedObj.thumbLeftValue = thumbLeftValue;
    modifiedObj.thumbRightValue = thumbRightValue;
  }

  private range(val: boolean): void {
    const { modifiedObj } = this;
    const { thumbRightValue, max } = { ...this.model.getOptions(), ...modifiedObj };

    if (val && thumbRightValue === null) {
      modifiedObj.thumbRightValue = max;
    } else if (!val) {
      modifiedObj.thumbRightValue = null;
    }

    modifiedObj.range = val;
  }

  private thumbLeftValue(val: number): void {
    const { modifiedObj } = this;
    const {
      thumbRightValue, min, max, precision, step,
    } = { ...this.model.getOptions(), ...modifiedObj };

    if (thumbRightValue !== null && thumbRightValue < val) {
      throw new Error(`"thumbLeftValue" should be <= than "thumbRightValue"
      thumbLeftValue = ${val}
      thumbRightValue = ${thumbRightValue}`);
    }

    const maxValue = Math.floor((max - min) / step) * step + min;
    const roundedToStep = Math.round((val - min) / step) * step + min;
    modifiedObj.thumbLeftValue = Number(
      Math.min(Math.max(min, roundedToStep), maxValue).toFixed(precision),
    );
  }

  private thumbRightValue(val: number | null): void {
    if (val === null) return;

    const { modifiedObj } = this;
    const {
      range, max, step, min,
    } = { ...this.model.getOptions(), ...modifiedObj };

    if (!range) {
      modifiedObj.thumbRightValue = null;
      return;
    }

    const { thumbLeftValue, precision } = { ...this.model.getOptions(), ...modifiedObj };

    if (val < thumbLeftValue) {
      throw new Error(`"thumbRightValue should be greater than "thumbLeftValue"
      thumbLeftValue = ${thumbLeftValue}
      thumbRightValue = ${val}`);
    }

    const maxValue = Math.floor((max - min) / step) * step + min;
    const roundedToStep = Math.round((val - min) / step) * step + min;
    modifiedObj.thumbRightValue = Number(Math.min(roundedToStep, maxValue).toFixed(precision));
  }
}
