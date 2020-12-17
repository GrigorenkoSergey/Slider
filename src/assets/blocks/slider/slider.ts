import './slider.scss';
import $ from 'jquery';
import { Presenter as Slider } from './components/presenter/presenter';

$.fn.slider = function (props: unknown) {
  return new Slider(props);
};

export { Slider };
