import { Slider, SliderOptions } from '../../../Slider/Slider';
import { SliderOptionsPalette } from '../SliderOptionsPalette/SliderOptionsPalette';
import './example.scss';

class Example {
  slider: Slider;

  palette: SliderOptionsPalette;

  constructor(opts: SliderOptions) {
    const initObj = this.init(opts);
    this.slider = initObj.slider;
    this.palette = initObj.palette;
  }

  init(opts: SliderOptions) {
    this.slider = new Slider(opts);

    if (opts.selector === undefined) {
      throw new Error(`No selector "${opts.selector}" in document!`);
    }

    const letter = opts.selector.slice(-1);
    const selector = `[class*=${letter}]`;

    const paletteElement: HTMLDivElement | null = document.querySelector(selector);

    if (paletteElement === null) {
      throw new Error(`No element with selector "${selector}"`);
    }
    this.palette = new SliderOptionsPalette(paletteElement, this.slider);
    const { slider, palette } = this;

    return { slider, palette };
  }
}

export { Example };
