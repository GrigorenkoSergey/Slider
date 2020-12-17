import '../template/template';
import './main-page.scss';
import $ from 'jquery';

import SliderOptionsPalette from './components/slider-options-palette';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../helpers/debugger-point';
import { Slider } from '../slider/slider';

const options1 = {
  min: 1000000,
  max: 6000000,
  step: 1,
  thumbLeftPos: 3322695,
  thumbRightPos: 4865248,
  selector: '.slider1',
  range: true,
  hintAboveThumb: true,
  hintAlwaysShow: true,
  partsNum: 2,
};

const slider1 = $('').slider(options1);
const example1: HTMLDivElement | null = document.querySelector('.example1');
if (example1 === null) {
  throw new Error('No class "example1" in document!');
}
const palette1 = new SliderOptionsPalette(example1, slider1);

const options2 = {
  min: 100,
  max: 2000,
  step: 1,
  selector: '.slider2',
  angle: 90,
  range: true,
  hintAboveThumb: true,
  hintAlwaysShow: true,
  thumbLeftPos: 800,
  thumbRightPos: 935,
};

const slider2 = new Slider(options2);
const example2: HTMLDivElement | null = document.querySelector('.example2');
if (example2 === null) {
  throw new Error('No class "example2" in document!');
}
const palette2 = new SliderOptionsPalette(example2, slider2);

const options3 = {
  alternativeRange: ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  step: 0.1,
  selector: '.slider3',
  angle: 45,
  range: true,
  hintAboveThumb: true,
  hintAlwaysShow: true,
  thumbLeftPos: 8,
  precision: 1,
};
const slider3 = new Slider(options3);
const example3: HTMLDivElement | null = document.querySelector('.example3');
if (example3 === null) {
  throw new Error('No class "example3" in document!');
}
const palette3 = new SliderOptionsPalette(example3, slider3);

const options4 = {
  max: 100,
  min: 0,
  step: 1,
  selector: '.slider4',
  angle: 0,
  range: true,
  hintAboveThumb: true,
};

const slider4 = new Slider(options4);

const p = document.querySelector('.slider4__p');
if (p === null) {
  throw new Error('No element with class "slider4_p" in document!');
}

const pContent = p.textContent;
slider4.setOptions({ max: pContent!.length });

slider4.onChange({
  el: p,
  callback: () => {
    const options = slider4.getOptions();
    const resLeft = Math.round(options.thumbLeftPos);
    const resRight = Math.round(options.thumbRightPos);
  p!.textContent = pContent!.slice(resLeft, resRight);
  },
});

const options5 = {
  max: 255,
  min: 0,
  step: 1,
  selector: '.slider5',
  angle: 0,
  range: false,
  hintAboveThumb: true,
};

const slider5 = new Slider(options5);

const letterA = <HTMLElement>document.querySelector('.slider5-container__text');

slider5.onChange({
  el: letterA,
  callback: () => {
    const offset = slider5.getOffsets().left;

    // offset == 0 -> 200
    // offset == 1 -> 360
    const resStr = `hsl(${offset * 160 + 200}, 100%, 50%)`;

    // offset == 0 -> 0
    // offset == 1 -> 20
    const resShadow = offset * 20;

    letterA.style.color = resStr;
    letterA.style.textShadow = `${resShadow}px 19px 7px grey`;
  },
});

const options6 = {
  max: 1000,
  min: 0,
  step: 10,
  selector: '.slider6',
  angle: 0,
  range: false,
  hintAboveThumb: true,
  showScale: false,
};

const slider6 = $('').slider(options6);

const birdImg = <HTMLElement>document.querySelector('.imgSprite');

slider6.onChange({
  el: birdImg,
  callback: () => {
    const imgWidth = 918 / 5;
    const imgHeight = 506 / 3;
    const offset = slider6.getOffsets().left;

    // offset == 0 -> 0
    // offset == 1 -> 13
    const resLeft = Math.round(offset * 13);

    const offsetLeft = imgWidth * (resLeft % 5);
    const offsetTop = imgHeight * Math.floor(resLeft / 5);

    birdImg.style.backgroundPositionX = `${-offsetLeft}px`;
    birdImg.style.backgroundPositionY = `${-offsetTop}px`;
  },
});

console.log(palette1, palette2, palette3);
