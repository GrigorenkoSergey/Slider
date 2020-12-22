import { SliderEvents } from './slider-events';

export interface ISubscriber {
  update: (data: SliderEvents) => void | this;
}
