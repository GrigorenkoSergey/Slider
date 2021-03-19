import { ViewOptions } from './view-types';
import { VIEW_OPTIONS_DEFAULT } from './view-options-default';

export function isViewOptions(options: unknown): options is ViewOptions {
  if (typeof options !== 'object' || options === null) {
    return false;
  }

  return Object.keys(options).some((key) => key in VIEW_OPTIONS_DEFAULT);
}
