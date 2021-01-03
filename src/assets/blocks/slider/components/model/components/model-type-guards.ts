import { ModelOptions } from './model-types';
import { MODEL_OPTIONS_DEFAULT } from './model-options-default';

export function isModelOptions(options: unknown): options is ModelOptions {
  if (typeof options !== 'object' || options === null) {
    return false;
  }

  return Object.keys(options).some((key) => key in MODEL_OPTIONS_DEFAULT);
}
