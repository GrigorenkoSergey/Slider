import { Slider } from './slider';

declare global {
  interface JQuery {
    slider(options: unknown): Slider;
  }
}
