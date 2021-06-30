import { ViewOptions } from './view-types';

const VIEW_OPTIONS_DEFAULT: Required<ViewOptions> = {
  className: 'slider',
  selector: '',
  angle: 0,
  step: 1 / 100, // 0 < step <= 1
  range: false,
  hintAboveThumb: true,
  hintAlwaysShow: false,
  showScale: true,
  partsAmount: 2,
};

export { VIEW_OPTIONS_DEFAULT };
