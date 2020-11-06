import '../src/assets/blocks/slider/slider';
import '../src/assets/blocks/helpers/types';
import Presenter from '../src/assets/blocks/slider/components/presenter/presenter';
import SliderOptionsPalette from '../src/assets/blocks/main-page/components/slider-options-palette';

import '../src/assets/blocks/main-page/main-page.scss';
import '../src/assets/blocks/slider/slider.scss';
import debuggerPoint from '../src/assets/blocks/helpers/debugger-point';

const div = document.createElement('div');
div.className = 'sliderPalette';
div.style.marginTop = "100px";

describe('Проверка связи значения инпута со значением привязанного слайдера', () => {

  let options: Obj = {
    min: 2,
    max: 600,
    step: 4,
    selector: ".sliderPalette",
    angle: 0,
    range: true,
    hintAboveThumb: true,
  };

  let example = document.createElement('div');
  example.className = 'example1';

  const inputTextes = [
    'min',
    'max', 
    'step', 
    'angle', 
    'thumbLeftPos', 
    'thumbRightPos', 
    'partsNum',
  ];

  const inputCheckboxes = [
    ["range", "Диапазон"], 
    ["hintAboveThumb", "Подсказка"], 
    ["showScale", "Покaзать шкалу"],
    ["hintAlwaysShow", "Всегда показывать подсказку"],
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


  // beforeEach(() => {
  //   document.body.append(example);
  //   document.body.append(div);
  // });

  // afterEach(() => {
  //   div.innerHTML = '';
  //   div.remove();
  //   example.remove();
  // });

  const fakeChange = new Event('change', {
    bubbles: true, cancelable: true,
  });

  const fakeMouseDown = new MouseEvent('mousedown',
    {bubbles: true, cancelable: true, clientX: 0, clientY: 0});

  const fakeMouseUp = new MouseEvent('mouseup', {
    bubbles: true, cancelable: true,
  });

  const fakeClick = new MouseEvent('click', {
    bubbles: true, cancelable: true,
  })

  example.insertAdjacentHTML('beforeend', str);
  document.body.append(example);
  document.body.append(div);

  let slider = new Presenter(options);
  const palette = new SliderOptionsPalette(example, slider);

  const anchors = div.getElementsByClassName('slider__scale-points');
  const leftThumb = div.getElementsByClassName('slider__thumb-left')[0];
  const rightThumb = div.getElementsByClassName('slider__thumb-right')[0];
  const leftHint = leftThumb.getElementsByClassName('slider__hint')[0];
  const rightHint = rightThumb.getElementsByClassName('slider__hint')[0];

  it(`Поменяем значение min`, () => {
    palette.min.el.value = '4';
    palette.min.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().min).toEqual(4);
    expect(anchors[0].textContent).toEqual('4');
  });

  it(`Поменяем значение max`, () => {
    palette.max.el.value = '500';
    palette.max.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().max).toEqual(500);
    expect(anchors[anchors.length - 1].textContent).toEqual('500');
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

    palette.angle.el.value = '0';
    palette.angle.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().angle).toEqual(0);
  });

  it(`Поменяем значение thumbLeftPos`, () => {
    palette.thumbLeftPos.el.value = '50';
    palette.thumbLeftPos.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().thumbLeftPos).toEqual(50);
    leftThumb.dispatchEvent(fakeMouseDown);
    expect(leftHint.textContent).toEqual('50');
    leftThumb.dispatchEvent(fakeMouseUp);
  });

  it(`Поменяем значение "range"`, () => {
    palette.range.el.checked = true;
    palette.range.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().range).toBeTrue();
    expect(document.contains(rightThumb)).toBeTrue();

    palette.range.el.checked = false;
    palette.range.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().range).toBeFalse();
    expect(document.contains(rightThumb)).toBeFalse();
  });

  it(`Поменяем значение thumbRightPos`, () => {
    palette.range.el.checked = true;
    palette.range.el.dispatchEvent(fakeChange);
    palette.thumbRightPos.el.value = '400';
    palette.thumbRightPos.el.dispatchEvent(fakeChange);

    expect(slider.getOptions().thumbRightPos).toEqual(400);
    rightThumb.dispatchEvent(fakeMouseDown);
    expect(rightHint.textContent).toEqual('400');
    rightThumb.dispatchEvent(fakeMouseUp);
  });

  it(`Поменяем значение showScale`, () => {
    palette.showScale.el.checked = false;
    palette.showScale.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().showScale).toBeFalse();
    expect(Array.from(anchors).every(item => item.clientWidth == 0)).toBeTrue();;
    
    palette.showScale.el.checked = true;
    palette.showScale.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().showScale).toBeTrue();
    expect(Array.from(anchors).every(item => item.clientWidth != 0)).toBeTrue();;
  });

  it(`Поменяем значение hintAlwaysShow`, () => {
    palette.hintAlwaysShow.el.checked = false;
    palette.hintAlwaysShow.el.dispatchEvent(fakeChange);
    expect(leftHint.clientWidth).toBeFalsy();
    expect(slider.getOptions().hintAlwaysShow).toBeFalse();

    leftThumb.dispatchEvent(fakeMouseDown);
    expect(leftHint.clientHeight).toBeTruthy();
    leftThumb.dispatchEvent(fakeMouseUp);

    palette.hintAlwaysShow.el.checked = true;
    palette.hintAlwaysShow.el.dispatchEvent(fakeChange);
    expect(leftHint.clientWidth).toBeTruthy();
    expect(slider.getOptions().hintAlwaysShow).toBeTrue();
  });

  it(`Поменяем значение "partsNum`, () => {
    palette.partsNum.el.value = '3';
    palette.partsNum.el.dispatchEvent(fakeChange);
    expect(anchors.length).toEqual(4);

    palette.partsNum.el.value = '6';
    palette.partsNum.el.dispatchEvent(fakeChange);
    expect(anchors.length).toEqual(7);
  });

  it(`Поменяем значение hintAboveThumb`, () => {
    palette.hintAboveThumb.el.checked = false;
    palette.hintAboveThumb.el.dispatchEvent(fakeChange);
    expect(leftHint.clientWidth).toBeFalsy();
    expect(slider.getOptions().hintAboveThumb).toBeFalse();

    leftThumb.dispatchEvent(fakeMouseDown);
    expect(leftHint.clientHeight).toBeFalsy();
    leftThumb.dispatchEvent(fakeMouseUp);

    palette.hintAboveThumb.el.checked = true;
    palette.hintAboveThumb.el.dispatchEvent(fakeChange);

    expect(leftHint.clientWidth).toBeFalsy();
    leftThumb.dispatchEvent(fakeMouseDown);
    expect(leftHint.clientHeight).toBeTruthy();
    leftThumb.dispatchEvent(fakeMouseUp);
    expect(slider.getOptions().hintAboveThumb).toBeTrue();
  });
});
