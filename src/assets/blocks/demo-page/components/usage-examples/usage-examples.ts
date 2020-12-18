import $ from 'jquery';
import { Slider, SliderOptions } from '../../../slider/slider';
import './usage-examples.scss';

const optionsA: SliderOptions = {
  max: 100,
  min: 0,
  step: 1,
  selector: '.js-usage-examples__sliderA',
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

const sliderA = new Slider(optionsA);
sliderA.setOptions({ max: textContent.length });

sliderA.onChange({
  el: text,
  callback: () => {
    const options = sliderA.getOptions();
    const resLeft = Math.round(options.thumbLeftPos);
    const resRight = Math.round(options.thumbRightPos);
    text.textContent = textContent.slice(resLeft, resRight);
  },
});

const optionsB: SliderOptions = {
  max: 255,
  min: 0,
  step: 1,
  selector: '.js-usage-examples__sliderB',
  angle: 0,
  range: false,
  hintAboveThumb: true,
};

const sliderB = new Slider(optionsB);

selector = '.usage-examples__letter';
const letter: HTMLDivElement | null = document.querySelector(selector);
if (letter === null) {
  throw new Error(`No element with selector "${selector}"`);
}

sliderB.onChange({
  el: letter,
  callback: () => {
    const offset = sliderB.getOffsets().left;

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

const optionsC: SliderOptions = {
  max: 1000,
  min: 0,
  step: 10,
  selector: '.js-usage-examples__sliderC',
  angle: 0,
  range: false,
  hintAboveThumb: true,
  showScale: false,
};

const sliderC = $('').slider(optionsC);

selector = '.usage-examples__img';
const birdImg: HTMLDivElement | null = document.querySelector(selector);

if (birdImg === null) {
  throw new Error(`No element with selector "${selector}" in document`);
}

sliderC.onChange({
  el: birdImg,
  callback: () => {
    const imgWidth = 918 / 5;
    const imgHeight = 506 / 3;
    const offset = sliderC.getOffsets().left;

    // offset == 0 -> 0
    // offset == 1 -> 13
    const resLeft = Math.round(offset * 13);

    const offsetLeft = imgWidth * (resLeft % 5);
    const offsetTop = imgHeight * Math.floor(resLeft / 5);

    birdImg.style.backgroundPositionX = `${-offsetLeft}px`;
    birdImg.style.backgroundPositionY = `${-offsetTop}px`;
  },
});
