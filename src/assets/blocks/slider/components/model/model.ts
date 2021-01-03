import EventObserver from '../../../helpers/event-observer';
import { makeUA } from '../../../helpers/functions/make-ua';
import { ModelValidator } from './components/model-validator';
import { ModelOptions } from './components/model-types';
import { MODEL_OPTIONS_DEFAULT } from './components/model-options-default';

export default class Model extends EventObserver {
  private options = { ...MODEL_OPTIONS_DEFAULT };

  private validator: ModelValidator;

  constructor(options: ModelOptions) {
    super();
    this.validator = new ModelValidator(this);
    this.init(options);
  }

  private init(options: ModelOptions): void {
    const optionsCopy = { ...options };

    const defaultDependentOptions = {
      step: () => {
        if (!('alternativeRange' in optionsCopy)) {
          if (optionsCopy.max !== undefined && optionsCopy.min !== undefined) {
            return Math.round((optionsCopy.max - optionsCopy.min) / 100);
          }
        }
        return 1;
      },
      thumbLeftValue: () => {
        let result = 0;
        if (optionsCopy.min !== undefined) {
          result = optionsCopy.min;
        }
        return result;
      },
    };

    if (!('step' in optionsCopy)) {
      optionsCopy.step = defaultDependentOptions.step();
    }
    if (!('thumbLeftValue' in optionsCopy)) {
      optionsCopy.thumbLeftValue = defaultDependentOptions.thumbLeftValue();
    }

    this.setOptions(optionsCopy);
  }

  getOptions(): Required<ModelOptions> {
    const obj = { ...this.options };
    return obj;
  }

  setOptions(expectant: ModelOptions): Model {
    let tempObj: ModelOptions = {};
    const { options } = this;

    const keys = makeUA<keyof ModelOptions>()(
      'min', 'max', 'step', 'partsAmount',
      'thumbLeftValue', 'thumbRightValue', 'precision',
    );

    keys.forEach((key) => {
      if (key in expectant) { tempObj[key] = expectant[key]; }
    });

    if (expectant.range !== undefined) {
      tempObj.range = expectant.range;
    }
    if (expectant.alternativeRange !== undefined) {
      tempObj.alternativeRange = expectant.alternativeRange;
    }

    tempObj = this.validator.validate(tempObj);
    this.options = { ...options, ...tempObj };

    Object.keys(tempObj).forEach((key) => {
      if (key === 'alternativeRange') {
        const valueArray = tempObj[key];
        if (valueArray === undefined) {
          throw new Error('You should set alternativeRange value!');
        }
        this.broadcast({ event: 'alternativeRange', value: valueArray });
      } else if (key === 'range') {
        this.broadcast({ event: 'range', value: Boolean(tempObj[key]) });
      } else if (key === 'min' || key === 'max') {
        this.broadcast({ event: key, value: Number(tempObj[key]) });
      } else if (key === 'precision' || key === 'partsAmount') {
        this.broadcast({ event: key, value: Number(tempObj[key]) });
      } else if (key === 'step' || key === 'thumbLeftValue') {
        this.broadcast({ event: key, value: Number(tempObj[key]), method: 'setOptions' });
      } else if (key === 'thumbRightValue') {
        this.broadcast({ event: key, value: Number(tempObj[key]), method: 'setOptions' });
      }
    });

    return this;
  }

  setThumbsPos(opts: { left?: number, right?: number }): Model {
    const { options, validator } = this;
    const {
      left = options.thumbLeftValue,
      right = options.thumbRightValue,
    } = opts;

    if ('left' in opts) {
      const res = validator.validate({ thumbLeftValue: left }).thumbLeftValue;
      if (res !== undefined) {
        options.thumbLeftValue = res;

        this.broadcast({
          event: 'thumbLeftValue',
          value: options.thumbLeftValue,
          method: 'setThumbsPos',
        });
      }
    }

    if ('right' in opts) {
      const res = validator.validate({ thumbRightValue: right }).thumbRightValue;
      if (res !== undefined) {
        options.thumbRightValue = res;
        this.broadcast({
          event: 'thumbRightValue',
          value: options.thumbRightValue,
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
