import { Example } from '../example/example';
import { SliderOptions } from '../../../slider/slider';
import '../template/template';
import './examples.scss';

const sliderOptions: SliderOptions[] = [
  {
    min: 1000000,
    max: 6000000,
    step: 1,
    thumbLeftPos: 3322695,
    thumbRightPos: 4865248,
    selector: '.js-slider_test_A',
    range: true,
    hintAboveThumb: true,
    hintAlwaysShow: true,
    partsNum: 2,
  },

  {
    min: 100,
    max: 2000,
    step: 1,
    selector: '.js-slider_test_B',
    angle: 90,
    range: true,
    hintAboveThumb: true,
    hintAlwaysShow: true,
    thumbLeftPos: 800,
    thumbRightPos: 935,
  },
  {
    alternativeRange: [
      'Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ],
    step: 0.1,
    selector: '.js-slider_test_C',
    angle: 45,
    range: true,
    hintAboveThumb: true,
    hintAlwaysShow: true,
    thumbLeftPos: 8,
    precision: 1,
  },
];

sliderOptions.forEach((option) => new Example(option));
