import { Slider } from './assets/blocks/Slider/Slider';
import './assets/blocks/demo-page/demo-page';
import './favicons/favicons';

$.fn.slider = function (props: unknown) {
  return new Slider(props);
};
