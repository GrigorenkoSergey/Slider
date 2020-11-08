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
  min: 2,
  max: 6,
  step: 2,
  selector: ".slider1",
  angle: 0,
  range: false,
  hintAboveThumb: true,
  // hintAlwaysShow: true,
  hintAlwaysShow: false,
  partsNum: 2,
}
// let slider1 = $('.slider1').slider(options1);
let slider1 = new Presenter(options1);
const palette1 = new SliderOptionsPalette(document.querySelector('.example1'), slider1);
console.log(palette1)
/*
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
let slider2 = $().slider(options2);

let options3 = {
  min: 0,
  max: 1000,
  step: 1,
  selector: ".slider3",
  angle: 45,
  range: true,
  hintAboveThumb: true,
  rangeValue: ["Jan", "Dec"],
}
let slider3 = $('.slider3').slider(options3);

//Пример задания вообще левых значений
slider3.unbindFrom(slider3.hintEl);
let fnMonths: fnResType = (elem, leftX, scaledLeftX, rightX, scaledRightX, data) => {
  let months = ["Jan", "Feb", "March", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (data.el == "L") {
    elem.textContent = months[Math.round(scaledLeftX)];
  } else {
    elem.textContent = months[Math.round(scaledRightX)];
  }
}
slider3.bindWith(slider3.hintEl, 0, 11, fnMonths);

let options4 = {
  min: 100,
  max: 20000,
  ticks: {500: 100, 10000: 150, 20000: 180},
  step: 10,
  selector: ".slider4",
  angle: 0,
  range: false,
  hintAboveThumb: true
}
let slider4 = $('.slider4').slider(options4);

console.log(palette1)
const palette2 = new SliderOptionsPalette(document.querySelector('.example2'), slider2);
const palette3 = new SliderOptionsPalette(document.querySelector('.example3'), slider3);
const palette4 = new SliderOptionsPalette(document.querySelector('.example4'), slider4);

let options5 = {
  max: 100,
  min: 0,
  step: 1,
  selector: ".slider5",
  angle: 0,
  range: true,
  hintAboveThumb: true
}

let slider5 = $('.slider5').slider(options5);
let pContent = document.querySelector('.slider5__p').textContent;

let fnResLine: fnResType = (elem, leftX, resLeft, rightX, resRight) => {
  resLeft = Math.round(resLeft);
  resRight = Math.round(resRight);
  elem.textContent = pContent.slice(resLeft, resRight);
}
slider5.bindWith(document.querySelector('.slider5__p'), 0,
  document.querySelector('.slider5__p').textContent.length, fnResLine);

let options6 = {
  max: 1000,
  min: 0,
  step: 10,
  selector: ".slider6",
  angle: 0,
  range: false,
  hintAboveThumb: true
}

// let slider6 = new Slider(options6);
let slider6 = $('.slider6').slider(options6);

let fnResShadow: fnResType = (elem, leftX, resLeft, rightX, resRight, data) => {
  elem.style.textShadow = resLeft + "px 19px 7px grey";
}
let fnResColor: fnResType = (elem, leftX, resLeft) => {
  resLeft = Math.round(resLeft);
  let resStr = "hsl(" + resLeft + ", 100%, 50%)";
  elem.style.color = resStr;
}
slider6.bindWith(document.querySelector("[class*=__text]"), 0, 20, fnResShadow);
slider6.bindWith(document.querySelector('[class*=__text]'), 200, 360, fnResColor);

let options7 = {
  max: 1000,
  min: 0,
  step: 10,
  selector: ".slider7",
  angle: 0,
  range: false,
  hintAboveThumb: true
}

// let slider7 = new Slider(options7);
let slider7 = $('.slider7').slider(options7);
let fnResBird: fnResType = (elem, leftX, resLeft) => {
  let imgWidth = 918 / 5;
  let imgHeight = 506 / 3;
  resLeft = Math.round(resLeft);

  let offsetLeft = imgWidth * (resLeft % 5);
  let offsetTop = imgHeight * Math.floor(resLeft / 5);

  elem.style.backgroundPositionX = -offsetLeft + "px";
  elem.style.backgroundPositionY = -offsetTop + "px";
}

slider7.bindWith(document.querySelector('.imgSprite'), 0, 13, fnResBird);
*/


/*
import View from '../slider/components/view/view';
import Presenter from '../slider/components/presenter/presenter';
let options = {
  min: 0,
  max: 20000,
  // ticks: {500: 100, 10000: 150, 20000: 180},
  step: 10,
  selector: ".slider1",
  angle: 0,
  range: true,
  hintAboveThumb: true
}
const view = new View({selector: '.slider', hintAboveThumb: true, range: true});
// const presenter = new Presenter({selector: '.slider1', range: true, hintAboveThumb: true, min: 10, max: 100, partsNum: 4,});
const presenter = new Presenter(options);
const model = presenter.model;
debugger;
model.setOptions({ticks: {500: 100, 10000: 150, 20000: 180}, range: true});
*/