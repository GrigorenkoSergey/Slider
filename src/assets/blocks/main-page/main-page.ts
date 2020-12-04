import '../template/template';
import '../helpers/types';
import '../slider/slider';

import './main-page.scss';

import SliderOptionsPalette from './components/slider-options-palette';
import debuggerPoint from '../helpers/debugger-point';
import {Slider} from '../slider/slider';

let options1 = {
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

let slider1 = $().slider(options1);
const example1 = document.querySelector('.example1') as HTMLDivElement;
const palette1 = new SliderOptionsPalette(example1, slider1);

let options2 = {
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
}

let slider2 = new Slider(options2);
const example2 = document.querySelector('.example2') as HTMLDivElement;
const palette2 = new SliderOptionsPalette(example2, slider2);

let options3 = {
  alternativeRange: ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  step: 0.1,
  selector: '.slider3',
  angle: 45,
  range: true,
  hintAboveThumb: true,
  hintAlwaysShow: true,
  thumbLeftPos: 8,
  precision: 1,
}
let slider3 = new Slider(options3);
const example3 = document.querySelector('.example3') as HTMLDivElement;
const palette3 = new SliderOptionsPalette(example3, slider3);


let options4 = {
  max: 100,
  min: 0,
  step: 1,
  selector: '.slider4',
  angle: 0,
  range: true,
  hintAboveThumb: true
}

let slider4 = new Slider(options4)

let p = document.querySelector('.slider4__p');
let pContent = p!.textContent as string;
slider4.setOptions({max: pContent.length});

slider4.onChange({el: p, callback: () => {
    const options = slider4.getOptions();
    let resLeft = Math.round(options.thumbLeftPos);
    let resRight = Math.round(options.thumbRightPos);
    p!.textContent = pContent.slice(resLeft, resRight);
}});
  


let options5 = {
  max: 255,
  min: 0,
  step: 1,
  selector: '.slider5',
  angle: 0,
  range: false,
  hintAboveThumb: true
}

let slider5 = new Slider(options5);

const letterA = <HTMLElement>document.querySelector('.slider5-container__text');

slider5.onChange({el: letterA, callback: () => {
  const options = slider5.getOptions();
  const offset = options._thumbLeftOffset();

  // offset == 0 -> 200
  // offset == 1 -> 360 
  let resStr = 'hsl(' + (offset * 160 + 200) + ', 100%, 50%)';

  // offset == 0 -> 0
  // offset == 1 -> 20 
  let resShadow = offset * 20;

  letterA.style.color = resStr;
  letterA.style.textShadow = resShadow + 'px 19px 7px grey';
}});


let options6 = {
  max: 1000,
  min: 0,
  step: 10,
  selector: '.slider6',
  angle: 0,
  range: false,
  hintAboveThumb: true,
  showScale: false,
}

let slider6 = $('.slider6').slider(options6);

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

    birdImg.style.backgroundPositionX = -offsetLeft + 'px';
    birdImg.style.backgroundPositionY = -offsetTop + 'px';
  },
})