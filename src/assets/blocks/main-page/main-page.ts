import '../template/template';
import '../helpers/types';
import '../slider/slider';

import './main-page.scss';
// import '../slider/components/presenter/presenter';
// import '../slider/slider.scss';

import SliderOptionsPalette from './components/slider-options-palette';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../helpers/debugger-point';
import Presenter from '../slider/components/presenter/presenter';

let options1 = {
  min: 0,
  max: 20000,
  step: 2,
  selector: ".slider1",
  range: true,
  hintAboveThumb: true,
  hintAlwaysShow: true,
  // hintAlwaysShow: false,
  partsNum: 2,
}
// let slider1 = $('.slider1').slider(options1);
let slider1 = new Presenter(options1);
const palette1 = new SliderOptionsPalette(document.querySelector('.example1'), slider1);

let options2 = {
  min: 100,
  max: 2000,
  step: 1,
  selector: ".slider2",
  angle: 90,
  range: false,
  hintAboveThumb: true,
  thumbLeftPos: 800,
}
let slider2 = new Presenter(options2);
const palette2 = new SliderOptionsPalette(document.querySelector('.example2'), slider2);

let options3 = {
  // min: 0,
  // max: 1000,
  alternativeRange: ["Jan", "Feb", "March", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  step: 1,
  selector: '.slider3',
  angle: 45,
  range: true,
  hintAboveThumb: true,
  hintAlwaysShow: true,
}
let slider3 = new Presenter(options3);
const palette3 = new SliderOptionsPalette(document.querySelector('.example3'), slider3);


let options4 = {
  max: 100,
  min: 0,
  step: 1,
  selector: ".slider4",
  angle: 0,
  range: true,
  hintAboveThumb: true
}

let slider4 = new Presenter(options4)

let p = document.querySelector('.slider4__p');
let pContent = p.textContent;
slider4.setOptions({max: pContent.length});

slider4.onChange({el: p, callback: () => {
  const options = slider4.getOptions();
  let resLeft = Math.round(options.thumbLeftPos);
  let resRight = Math.round(options.thumbRightPos);
  p.textContent = pContent.slice(resLeft, resRight);
} });


let options5 = {
  max: 255,
  min: 0,
  step: 1,
  selector: ".slider5",
  angle: 0,
  range: false,
  hintAboveThumb: true
}

let slider5 = new Presenter(options5);

const letterA = <HTMLElement>document.querySelector('.slider5-container__text');

slider5.onChange({el: letterA, callback: () => {
  const options = slider5.getOptions();
  const offset = options._thumbLeftOffset();

  let resStr = "hsl(" + (offset * 160 + 200) + ", 100%, 50%)";
  let resShadow = offset * 20;

  letterA.style.color = resStr;
  letterA.style.textShadow = resShadow + "px 19px 7px grey";
}});


let options6 = {
  max: 1000,
  min: 0,
  step: 10,
  selector: ".slider6",
  angle: 0,
  range: false,
  hintAboveThumb: true,
  showScale: false,
}

// let slider7 = new Slider(options7);
// let slider7 = $('.slider7').slider(options7);
let slider6 = new Presenter(options6);

const birdImg = <HTMLElement>document.querySelector('.imgSprite');

slider6.onChange({
  el: birdImg,
  callback: () => {
    let imgWidth = 918 / 5;
    let imgHeight = 506 / 3;
    let offset = slider6.getOptions()._thumbLeftOffset();
    
    // offset == 0 -> 0
    // offset == 1 -> 13
    let resLeft = Math.round(offset * 13);

    let offsetLeft = imgWidth * (resLeft % 5);
    let offsetTop = imgHeight * Math.floor(resLeft / 5);

    birdImg.style.backgroundPositionX = -offsetLeft + "px";
    birdImg.style.backgroundPositionY = -offsetTop + "px";
  },
})