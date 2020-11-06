import '../src/assets/blocks/slider/slider';
import '../src/assets/blocks/helpers/types';
// import {Slider} from '../src/assets/blocks/slider/slider';
import Presenter from '../src/assets/blocks/slider/components/presenter/presenter';
import SliderOptionsPalette from '../src/assets/blocks/main-page/components/slider-options-palette';

import '../src/assets/blocks/main-page/main-page.scss';
import '../src/assets/blocks/slider/slider.scss';
import debuggerPoint from '../src/assets/blocks/helpers/debugger-point';

const div = document.createElement('div');
div.className = 'sliderPalette';
document.body.append(div);

describe('Проверка связи значения инпута со значением привязанного слайдера', () => {

  let options: Obj = {
    min: 2,
    max: 600,
    step: 4,
    selector: ".sliderPalette",
    angle: 0,
    range: false,
    hintAboveThumb: true,

  };
  let slider: Presenter = new Presenter(options);

  let example = document.createElement('div');

  example.className = 'example1';
  const inputTextes = [
    'min',
    'max', 
    'step', 
    'angle', 
    'thumbLeftPos', 
    'thumbRightPos', 
  ];

  const inputCheckboxes = [
    ["range", "Диапазон"], 
    ["hintAboveThumb", "Подсказка"], 
    ["showScale", "Покaзать шкалу"]
  ];

  let str = '';
  inputTextes.forEach(key => str += `
      <input type="text" name="${key}" value="${options[key]}">${key}
    `);
  inputCheckboxes.forEach(([key, description]) => str += `
      <label>
        <input type="checkbox" name="${key}" value="${options[key]}">
        ${description}
      </label>
    `);

  example.insertAdjacentHTML('beforeend', str);
  document.body.append(example);

  const palette = new SliderOptionsPalette(example, slider);

  const fakeChange = new Event('change', {
    bubbles: true, cancelable: true,
  });

  it(`Поменяем значение min`, () => {
    palette.min.el.value = '4';
    palette.min.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().min).toEqual(4);
  });

  it(`Поменяем значение max`, () => {
    palette.max.el.value = '500';
    palette.max.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().max).toEqual(500);
  });

  it(`Поменяем значение step`, () => {
    palette.step.el.value = '5';
    palette.step.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().step).toEqual(5);
  });

  it(`Поменяем значение angle`, () => {
    palette.angle.el.value = '45';
    palette.angle.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().angle).toEqual(45);
  });

  it(`Поменяем значение thumbLeftPos`, () => {
    palette.thumbLeftPos.el.value = '50';
    debuggerPoint.start = 1;
    palette.thumbLeftPos.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().thumbLeftPos).toEqual(50);
  });

  /*
  it(`Поменяем значение "Диапазон"`, () => {
    palette.range.el.checked = true;
    palette.range.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().range).toBeTrue();
  });

  it(`Поменяем значение thumbRightPos`, () => {
    palette.range.el.checked = true;
    palette.range.el.dispatchEvent(fakeChange);
    palette.thumbRightPos.el.value = '400';
    palette.thumbRightPos.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().thumbRightPos).toEqual(400);
  });

  it(`Поменяем значение range`, () => {
    palette.range.el.checked = true;
    palette.range.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().range).toBeTrue();
  });

  it(`Поменяем значение showScale`, () => {
    palette.showScale.el.checked = false;
    palette.showScale.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().showScale).toBeFalse();
  });
  */
});
