/* eslint-disable no-param-reassign */
import './slider.scss';

import jQuery from 'jquery';
import { Presenter as Slider } from './components/presenter/presenter';

(function ($) {
  $.fn.slider = function (props: any) {
    return new Slider(props);
  };
}(jQuery));

export { Slider };
