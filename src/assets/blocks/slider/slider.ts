import $ from 'jquery';

import {
  PresenterOptions as SliderOptions,
} from './components/presenter/components/presenter-types';

import { Presenter as Slider } from './components/presenter/presenter';
import './slider.scss';

$.fn.slider = function (props: unknown) {
  return new Slider(props);
};

export { Slider, SliderOptions };
