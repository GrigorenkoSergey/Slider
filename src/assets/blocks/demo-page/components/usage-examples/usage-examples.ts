import $ from 'jquery';

import { Slider, SliderOptions } from '../../../Slider/Slider';
import '../js-slider/js-slider';
import './usage-examples.scss';

$.fn.slider = function (props: unknown) {
  return new Slider(props);
};

const optionsD: SliderOptions = {
  max: 100,
  min: 0,
  step: 1,
  selector: '.js-slider_test_D',
  angle: 0,
  range: true,
  hintAboveThumb: true,
};

let selector = '.usage-examples__text';
const text = document.querySelector(selector);
if (text === null) {
  throw new Error(`No element with selector "${selector}" in document!`);
}

const { textContent } = text;

if (textContent === null) {
  throw new Error();
}

const sliderD = new Slider(optionsD);
sliderD.setOptions({ max: textContent.length });

sliderD.onChange({
  callback: () => {
    const options = sliderD.getOptions();
    if (options.thumbRightValue === null) throw new Error();

    const resLeft = Math.round(options.thumbLeftValue);
    const resRight = Math.round(options.thumbRightValue);
    text.textContent = textContent.slice(resLeft, resRight);
  },
});

const optionsE: SliderOptions = {
  max: 255,
  min: 0,
  step: 1,
  selector: '.js-slider_test_E',
  angle: 0,
  range: false,
  hintAboveThumb: true,
};

const sliderE = new Slider(optionsE);

selector = '.usage-examples__letter';
const letter: HTMLDivElement | null = document.querySelector(selector);
if (letter === null) {
  throw new Error(`No element with selector "${selector}"`);
}

sliderE.onChange({
  callback: () => {
    const offset = sliderE.getOffsets().left;

    // offset == 0 -> 200
    // offset == 1 -> 360
    const resStr = `hsl(${offset * 160 + 200}, 100%, 50%)`;

    // offset == 0 -> 0
    // offset == 1 -> 20
    const resShadow = offset * 20;

    letter.style.color = resStr;
    letter.style.textShadow = `${resShadow}px 19px 7px grey`;
  },
});

const optionsF: SliderOptions = {
  max: 1000,
  min: 0,
  step: 10,
  selector: '.js-slider_test_F',
  angle: 0,
  range: false,
  hintAboveThumb: true,
  showScale: false,
};

selector = '.usage-examples__img';
const birdImg: HTMLDivElement | null = document.querySelector(selector);

if (birdImg === null) {
  throw new Error(`No element with selector "${selector}" in document`);
}

const sliderF = $('.js-slider_test_F').slider(optionsF);

sliderF.slider('onChange', {
  callback: () => {
    const imgWidth = 918 / 5;
    const imgHeight = 506 / 3;
    const offset = sliderF.getOffsets().left;

    // offset == 0 -> 0
    // offset == 1 -> 13
    const resLeft = Math.round(offset * 13);

    const offsetLeft = imgWidth * (resLeft % 5);
    const offsetTop = imgHeight * Math.floor(resLeft / 5);

    birdImg.style.backgroundPositionX = `${-offsetLeft}px`;
    birdImg.style.backgroundPositionY = `${-offsetTop}px`;
  },
});
