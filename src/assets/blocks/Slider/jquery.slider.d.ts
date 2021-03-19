import { Slider } from './Slider';

declare global {
  interface JQuery {
    slider(options: unknown): Slider;
  }
}
