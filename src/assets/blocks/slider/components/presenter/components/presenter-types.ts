import { ModelOptions, isModelOptionsType } from '../../model/components/model-types';
import { ViewOptions, isViewOptionsType } from '../../view/components/view-types';

export type PresenterOptions = ModelOptions & ViewOptions;

export function isPresenterOptions(options: Object): options is PresenterOptions {
  return isModelOptionsType(options) || isViewOptionsType(options);
}
