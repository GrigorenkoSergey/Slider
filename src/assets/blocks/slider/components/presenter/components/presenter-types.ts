import { ModelOptions } from '../../model/components/model-types';
import { ViewOptions } from '../../view/components/view-types';

export type PresenterOptions = ModelOptions & ViewOptions;

const PresenterOptionsDummy: Required<PresenterOptions> = {
  min: 0,
  max: 0,
  step: 0,
  partsNum: 0,
  thumbLeftPos: 0,
  thumbRightPos: 0,
  alternativeRange: [],
  angle: 0,
  className: '',
  hintAboveThumb: true,
  hintAlwaysShow: true,
  precision: 0,
  range: true,
  selector: '',
  showScale: true,
};

export function isPresenterOptions(options: unknown): options is PresenterOptions {
  if (typeof options !== 'object' || options === null) {
    return false;
  }

  return Object.keys(options).some((key) => key in PresenterOptionsDummy);
}
