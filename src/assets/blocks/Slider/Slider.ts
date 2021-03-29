import { ModelOptions } from './components/Model/components/model-types';
import { ViewOptions } from './components/View/components/view-types';
import { Presenter as Slider } from './components/Presenter/Presenter';
import './slider.scss';

export type SliderOptions = ModelOptions & ViewOptions;

declare global {
  interface JQuery {
    slider(options: unknown): Slider;
  }
}

export { Slider };
