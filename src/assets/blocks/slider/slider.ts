import $ from 'jquery';
import { ModelOptions } from './components/model/components/model-types';

import { Presenter as Slider } from './components/presenter/presenter';
import { ViewOptions } from './components/view/components/view-types';
import './slider.scss';

export type SliderOptions = ModelOptions & ViewOptions;

$.fn.slider = function (props: unknown) {
  return new Slider(props);
};

export { Slider };
