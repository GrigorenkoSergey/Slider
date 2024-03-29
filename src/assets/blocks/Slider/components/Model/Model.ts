import EventObserver from '../../../helpers/EventObserver';
import { ModelValidator } from './components/ModelValidator';
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

  getOptions(): Required<ModelOptions> {
    const obj = { ...this.options };
    return obj;
  }

  setOptions(expectant: ModelOptions): Model {
    let tempObj: ModelOptions = {};

    Object.keys(expectant).forEach((key) => {
      switch (key) {
        case ('min'):
        case ('max'):
        case ('step'):
        case ('partsAmount'):
        case ('thumbLeftValue'):
        case ('precision'):
          tempObj[key] = expectant[key];
          break;

        case ('thumbRightValue'):
          tempObj[key] = expectant[key];
          break;

        case ('range'):
          tempObj[key] = expectant[key];
          break;

        case ('alternativeRange'):
          tempObj[key] = expectant[key];
          break;

        default:
          console.log(`No "${key}" option in model`);
          break;
      }
    });

    const { options } = this;
    tempObj = this.validator.validate(tempObj);
    this.options = { ...options, ...tempObj };
    this.broadcastChanges(tempObj);

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

  private broadcastChanges(options: ModelOptions): void {
    Object.keys(options).forEach((key) => {
      switch (key) {
        case ('min'):
        case ('max'):
        case ('step'):
        case ('partsAmount'):
        case ('precision'):
          return this.broadcast({ event: key, value: Number(options[key]) });

        case ('thumbLeftValue'):
        case ('thumbRightValue'):
          return this.broadcast({ event: key, value: Number(options[key]), method: 'setOptions' });

        case ('range'):
          return this.broadcast({ event: key, value: Boolean(options[key]) });

        case ('alternativeRange'): {
          const valueArray = options[key];
          if (valueArray === undefined) {
            throw new Error('You should set alternativeRange value!');
          }
          return this.broadcast({ event: key, value: valueArray });
        }

        default:
          throw new Error(`You forget to handle "${key}" option in model`);
      }
    });
  }
}
