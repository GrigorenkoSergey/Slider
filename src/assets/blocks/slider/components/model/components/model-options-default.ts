import { ModelOptions } from './model-types';

const MODEL_OPTIONS_DEFAULT: Required<ModelOptions> = {
  min: 0,
  max: 100,
  step: 1,
  partsNum: 2,
  thumbLeftPos: 0,
  thumbRightPos: Infinity,
  range: false,
  precision: 0,
  alternativeRange: [],
};

export { MODEL_OPTIONS_DEFAULT };
