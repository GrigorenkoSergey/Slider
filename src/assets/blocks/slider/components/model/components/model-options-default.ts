import { ModelOptions } from './model-types';

const MODEL_OPTIONS_DEFAULT: Required<ModelOptions> = {
  min: 0,
  max: 100,
  step: 1,
  partsAmount: 2,
  thumbLeftValue: 0,
  thumbRightValue: null,
  range: false,
  precision: 0,
  alternativeRange: [],
};

export { MODEL_OPTIONS_DEFAULT };
