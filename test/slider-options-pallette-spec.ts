import { Presenter } from '../src/assets/blocks/slider/components/presenter/presenter';
import { SliderOptionsPalette, Inputs }
  from '../src/assets/blocks/demo-page/components/slider-options-palette/slider-options-palette';

import '../src/assets/blocks/slider/slider';
import '../src/assets/blocks/demo-page/demo-page.scss';
import '../src/assets/blocks/slider/slider.scss';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../src/assets/blocks/helpers/debugger-point';

let slider: Presenter;
let palette: SliderOptionsPalette;
let anchors: HTMLCollection;
let leftThumb: HTMLDivElement;
let rightThumb: HTMLDivElement;
let leftHint: HTMLDivElement;
let rightHint: HTMLDivElement;
let inputs: Inputs;

const fakeChange = new Event('change', {
  bubbles: true, cancelable: true,
});

const fakeMouseDown = new MouseEvent('mousedown',
  {
    bubbles: true, cancelable: true, clientX: 0, clientY: 0,
  });

const fakeMouseUp = new MouseEvent('mouseup', {
  bubbles: true, cancelable: true,
});

const fakeClick = new MouseEvent('click', {
  bubbles: true, cancelable: true,
});

describe('Проверка связи значения инпута со значением привязанного слайдера', () => {
  const div = document.createElement('div');
  div.className = 'sliderPalette';
  div.style.marginTop = '100px';

  const options = {
    min: 2,
    max: 600,
    step: 4,
    selector: '.sliderPalette',
    angle: 0,
    range: true,
    hintAboveThumb: true,
  };

  const example = document.createElement('div');
  example.className = 'example1';
  beforeEach(() => {
    document.body.append(example);
    document.body.append(div);

    slider = new Presenter(options);
    palette = new SliderOptionsPalette(example, slider);
    inputs = palette.inputs;

    anchors = div.getElementsByClassName('slider__scale-points');
    leftThumb = <HTMLDivElement>div.getElementsByClassName('slider__thumb-left')[0];
    rightThumb = <HTMLDivElement>div.getElementsByClassName('slider__thumb-right')[0];
    leftHint = <HTMLDivElement>leftThumb.getElementsByClassName('slider__hint')[0];
    rightHint = <HTMLDivElement>rightThumb.getElementsByClassName('slider__hint')[0];
  });

  afterEach(() => {
    example.innerHTML = '';
    example.remove();
    div.innerHTML = '';
    div.remove();
  });

  it('Поменяем значение max', () => {
    if (inputs.max === null) throw new Error();
    inputs.max.el.value = '500';
    inputs.max.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().max).toEqual(500);
    expect(anchors[anchors.length - 1].textContent).toEqual('500');
  });

  it('Поменяем значение step', () => {
    if (inputs.step === null) throw new Error();
    inputs.step.el.value = '5';
    inputs.step.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().step).toEqual(5);
  });

  it('Поменяем значение angle', () => {
    if (inputs.angle === null) throw new Error();
    inputs.angle.el.value = '45';
    inputs.angle.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().angle).toEqual(45);

    inputs.angle.el.value = '0';
    inputs.angle.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().angle).toEqual(0);
  });

  it('Поменяем значение thumbLeftPos', () => {
    if (inputs.thumbLeftPos === null) throw new Error();
    inputs.thumbLeftPos.el.value = '50';
    inputs.thumbLeftPos.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().thumbLeftPos).toEqual(50);
    leftThumb.dispatchEvent(fakeMouseDown);
    expect(leftHint.textContent).toEqual('50');
    leftThumb.dispatchEvent(fakeMouseUp);
  });

  it('Поменяем значение "range"', () => {
    if (inputs.range === null) throw new Error();
    inputs.range.el.checked = true;
    inputs.range.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().range).toBeTrue();
    expect(document.contains(rightThumb)).toBeTrue();

    inputs.range.el.checked = false;
    inputs.range.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().range).toBeFalse();
    expect(document.contains(rightThumb)).toBeFalse();
  });

  it('Поменяем значение thumbRightPos', () => {
    if (inputs.range === null) throw new Error();
    inputs.range.el.checked = true;
    inputs.range.el.dispatchEvent(fakeChange);

    if (inputs.thumbRightPos === null) throw new Error();
    inputs.thumbRightPos.el.value = '400';
    inputs.thumbRightPos.el.dispatchEvent(fakeChange);

    expect(slider.getOptions().thumbRightPos).toEqual(402);
    rightThumb.dispatchEvent(fakeMouseDown);
    expect(rightHint.textContent).toEqual('402');
    rightThumb.dispatchEvent(fakeMouseUp);
  });

  it('Поменяем значение showScale', () => {
    if (inputs.showScale === null) throw new Error();
    inputs.showScale.el.checked = false;
    inputs.showScale.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().showScale).toBeFalse();
    expect(Array.from(anchors).every((item) => item.clientWidth === 0)).toBeTrue();

    inputs.showScale.el.checked = true;
    inputs.showScale.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().showScale).toBeTrue();
    expect(Array.from(anchors).every((item) => item.clientWidth !== 0)).toBeTrue();
  });

  it('Поменяем значение hintAlwaysShow', () => {
    if (inputs.hintAlwaysShow === null) throw new Error();

    inputs.hintAlwaysShow.el.checked = false;
    inputs.hintAlwaysShow.el.dispatchEvent(fakeChange);
    expect(leftHint.clientWidth).toBeFalsy();
    expect(slider.getOptions().hintAlwaysShow).toBeFalse();

    leftThumb.dispatchEvent(fakeMouseDown);
    expect(leftHint.clientHeight).toBeTruthy();
    leftThumb.dispatchEvent(fakeMouseUp);

    inputs.hintAlwaysShow.el.checked = true;
    inputs.hintAlwaysShow.el.dispatchEvent(fakeChange);
    expect(leftHint.clientWidth).toBeTruthy();
    expect(slider.getOptions().hintAlwaysShow).toBeTrue();
  });

  it('Поменяем значение "partsNum', () => {
    if (inputs.partsNum === null) throw new Error();

    inputs.partsNum.el.value = '3';
    inputs.partsNum.el.dispatchEvent(fakeChange);
    expect(anchors.length).toEqual(4);

    inputs.partsNum.el.value = '6';
    inputs.partsNum.el.dispatchEvent(fakeChange);
    expect(anchors.length).toEqual(7);
  });

  it('Поменяем значение hintAboveThumb', () => {
    if (inputs.hintAboveThumb === null) throw new Error();
    inputs.hintAboveThumb.el.checked = false;
    inputs.hintAboveThumb.el.dispatchEvent(fakeChange);

    if (inputs.hintAlwaysShow === null) throw new Error();

    inputs.hintAlwaysShow.el.checked = false;
    inputs.hintAlwaysShow.el.dispatchEvent(fakeChange);

    expect(leftHint.clientWidth).toBeFalsy();
    expect(slider.getOptions().hintAboveThumb).toBeFalse();

    leftThumb.dispatchEvent(fakeMouseDown);
    expect(leftHint.clientHeight).toBeFalsy();
    leftThumb.dispatchEvent(fakeMouseUp);

    inputs.hintAboveThumb.el.checked = true;
    inputs.hintAboveThumb.el.dispatchEvent(fakeChange);

    expect(leftHint.clientWidth).toBeFalsy();
    leftThumb.dispatchEvent(fakeMouseDown);
    expect(leftHint.clientHeight).toBeTruthy();
    leftThumb.dispatchEvent(fakeMouseUp);
    expect(slider.getOptions().hintAboveThumb).toBeTrue();
  });
});

describe('При установке значения свойств программно, значения полей меняются автоматически\n', () => {
  const div = document.createElement('div');
  div.className = 'sliderPalette';
  div.style.marginTop = '100px';

  const options = {
    min: 0,
    max: 100,
    step: 1,
    selector: '.sliderPalette',
    angle: 0,
    range: true,
    hintAboveThumb: true,
  };

  const example = document.createElement('div');
  example.className = 'example2';

  beforeEach(() => {
    document.body.append(example);
    document.body.append(div);

    slider = new Presenter({ ...options });
    palette = new SliderOptionsPalette(example, slider);
    inputs = palette.inputs;

    anchors = div.getElementsByClassName('slider__scale-points');
    leftThumb = <HTMLDivElement>div.getElementsByClassName('slider__thumb-left')[0];
    rightThumb = <HTMLDivElement>div.getElementsByClassName('slider__thumb-right')[0];
    leftHint = <HTMLDivElement>leftThumb.getElementsByClassName('slider__hint')[0];
    rightHint = <HTMLDivElement>rightThumb.getElementsByClassName('slider__hint')[0];
  });

  afterEach(() => {
    example.innerHTML = '';
    example.remove();
    div.innerHTML = '';
    div.remove();
  });

  it('Поменяем значение min', () => {
    slider.setOptions({ min: 0 });
    expect(slider.getOptions().min).toEqual(0);
    expect(anchors[0].textContent).toEqual('0');

    if (inputs.min === null) throw new Error();
    expect(inputs.min.el.value).toEqual('0');
  });

  it('Поменяем значение max', () => {
    slider.setOptions({ max: 200 });
    expect(slider.getOptions().max).toEqual(200);
    expect(anchors[anchors.length - 1].textContent).toEqual('200');

    if (inputs.max === null) throw new Error();
    expect(inputs.max.el.value).toEqual('200');
  });

  it('Поменяем значение max', () => {
    slider.setOptions({ max: 100 });
    expect(slider.getOptions().max).toEqual(100);
    expect(anchors[anchors.length - 1].textContent).toEqual('100');

    if (inputs.max === null) throw new Error();
    expect(inputs.max.el.value).toEqual('100');
  });

  it('Поменяем значение step', () => {
    slider.setOptions({ step: 100 });
    expect(slider.getOptions().max).toEqual(100);
    expect(anchors[anchors.length - 1].textContent).toEqual('100');

    if (inputs.max === null) throw new Error();
    expect(inputs.max.el.value).toEqual('100');
  });

  it('Поменяем значение angle', () => {
    slider.setOptions({ angle: 45 });
    expect(slider.getOptions().angle).toEqual(45);
  });

  it('Поменяем значение thumbLeftPos', () => {
    slider.setOptions({ thumbLeftPos: 25, range: false });
    expect(slider.getOptions().thumbLeftPos).toEqual(25);

    if (inputs.max === null) throw new Error();
    expect(inputs.max.el.value).toEqual('100');

    if (inputs.thumbLeftPos === null) throw new Error();
    expect(inputs.thumbLeftPos.el.value).toEqual('25');

    anchors[0].dispatchEvent(fakeClick);
    expect(inputs.thumbLeftPos.el.value).toEqual('0');

    anchors[1].dispatchEvent(fakeClick);
    expect(inputs.thumbLeftPos.el.value).toEqual('50');

    anchors[2].dispatchEvent(fakeClick);
    expect(inputs.thumbLeftPos.el.value).toEqual('100');
  });

  it('Поменяем значение "range"', () => {
    slider.setOptions({ range: false });
    if (inputs.range === null) throw new Error();
    expect(inputs.range.el.checked).toBeFalse();

    slider.setOptions({ range: true });
    expect(inputs.range.el.checked).toBeTrue();
  });

  it('Поменяем значение "thumbRightPos"', () => {
    slider.setOptions({ thumbRightPos: 75 });
    if (inputs.thumbRightPos === null) throw new Error();
    expect(inputs.thumbRightPos.el.value).toEqual('75');

    anchors[1].dispatchEvent(fakeClick);
    expect(inputs.thumbRightPos.el.value).toEqual('50');

    anchors[2].dispatchEvent(fakeClick);
    expect(inputs.thumbRightPos.el.value).toEqual('100');
  });

  it('Поменяем значение "showScale"', () => {
    slider.setOptions({ showScale: false });
    if (inputs.showScale === null) throw new Error();
    expect(inputs.showScale.el.checked).toBeFalse();

    slider.setOptions({ showScale: true });
    expect(inputs.showScale.el.checked).toBeTrue();
  });

  it('Поменяем значение "hintAlwaysShow"', () => {
    slider.setOptions({ hintAlwaysShow: true });
    if (inputs.hintAlwaysShow === null) throw new Error();
    expect(inputs.hintAlwaysShow.el.checked).toBeTrue();

    slider.setOptions({ hintAlwaysShow: false });
    expect(inputs.hintAlwaysShow.el.checked).toBeFalse();
  });

  it('Поменяем значение "partsNum"', () => {
    slider.setOptions({ partsNum: 3 });
    if (inputs.partsNum === null) throw new Error();
    expect(inputs.partsNum.el.value).toEqual('3');

    slider.setOptions({ partsNum: 4 });
    expect(inputs.partsNum.el.value).toEqual('4');
  });

  it('Поменяем значение "hintAboveThumb"', () => {
    slider.setOptions({ hintAboveThumb: true });
    if (inputs.hintAboveThumb === null) throw new Error();
    expect(inputs.hintAboveThumb.el.checked).toBeTrue();

    slider.setOptions({ hintAboveThumb: false });
    expect(inputs.hintAboveThumb.el.checked).toBeFalse();
  });
});

describe('В поля ввода нельза ввести ошибочные данные\n', () => {
  const div = document.createElement('div');
  div.className = 'sliderPalette';
  div.style.marginTop = '100px';

  const options = {
    min: 0,
    max: 100,
    step: 1,
    selector: '.sliderPalette',
  };

  const example = document.createElement('div');
  example.className = 'example3';

  beforeEach(() => {
    document.body.append(example);
    document.body.append(div);

    slider = new Presenter({ ...options });
    palette = new SliderOptionsPalette(example, slider);
    inputs = palette.inputs;
  });

  afterEach(() => {
    example.innerHTML = '';
    example.remove();
    div.innerHTML = '';
    div.remove();
  });

  it('Попробуем поменять значение min', () => {
    if (inputs.min === null) throw new Error();
    const { value } = inputs.min.el;
    inputs.min.el.value = 'a';
    inputs.min.el.dispatchEvent(fakeChange);

    expect(inputs.min.el.value).toEqual(value);

    inputs.min.el.value = '101';
    inputs.min.el.dispatchEvent(fakeChange);
    expect(inputs.min.el.value).toEqual(value);

    inputs.min.el.value = 'Infinity';
    inputs.min.el.dispatchEvent(fakeChange);
    expect(inputs.min.el.value).toEqual(value);

    inputs.min.el.value = '101a';
    inputs.min.el.dispatchEvent(fakeChange);
    expect(inputs.min.el.value).toEqual(value);

    slider.setOptions({ max: 10, min: 0, step: 5 });
    inputs.min.el.value = '6';
    inputs.min.el.dispatchEvent(fakeChange);
    expect(inputs.min.el.value).toEqual('0');
  });

  it('Попробуем поменять значение max', () => {
    if (inputs.max === null) throw new Error();
    const { value } = inputs.max.el;
    inputs.max.el.value = 'a';
    inputs.max.el.dispatchEvent(fakeChange);

    expect(inputs.max.el.value).toEqual(value);

    inputs.max.el.value = '-10';
    inputs.max.el.dispatchEvent(fakeChange);
    expect(inputs.max.el.value).toEqual(value);

    inputs.max.el.value = 'Infinity';
    inputs.max.el.dispatchEvent(fakeChange);
    expect(inputs.max.el.value).toEqual(value);

    inputs.max.el.value = '101n';
    inputs.max.el.dispatchEvent(fakeChange);
    expect(inputs.max.el.value).toEqual(value);

    slider.setOptions({ max: 10, min: 0, step: 5 });
    inputs.max.el.value = '4';
    inputs.max.el.dispatchEvent(fakeChange);
    expect(inputs.max.el.value).toEqual('10');
  });

  it('Попробуем поменять значение step', () => {
    if (inputs.step === null) throw new Error();
    const { value } = inputs.step.el;
    inputs.step.el.value = 'a';
    inputs.step.el.dispatchEvent(fakeChange);

    expect(inputs.step.el.value).toEqual(value);

    inputs.step.el.value = '-1';
    inputs.step.el.dispatchEvent(fakeChange);
    expect(inputs.step.el.value).toEqual(value);

    inputs.step.el.value = 'Infinity';
    inputs.step.el.dispatchEvent(fakeChange);
    expect(inputs.step.el.value).toEqual(value);

    inputs.step.el.value = '1n';
    inputs.step.el.dispatchEvent(fakeChange);
    expect(inputs.step.el.value).toEqual(value);

    inputs.step.el.value = '0';
    inputs.step.el.dispatchEvent(fakeChange);
    expect(inputs.step.el.value).toEqual(value);
  });

  it('Поменяем значение angle', () => {
    if (inputs.angle === null) throw new Error();

    const { value } = inputs.angle.el;
    inputs.angle.el.value = '-10';
    inputs.angle.el.dispatchEvent(fakeChange);
    expect(inputs.angle.el.value).toEqual(value);

    inputs.angle.el.value = '91';
    inputs.angle.el.dispatchEvent(fakeChange);
    expect(inputs.angle.el.value).toEqual(value);

    inputs.angle.el.value = '0a';
    inputs.angle.el.dispatchEvent(fakeChange);
    expect(inputs.angle.el.value).toEqual(value);
  });

  it('Поменяем значение thumbLeftPos, оно не может выйти за пределы', () => {
    if (inputs.range === null) throw new Error();

    inputs.range.el.checked = false;
    inputs.range.el.dispatchEvent(fakeChange);

    if (inputs.thumbLeftPos === null) throw new Error();
    const { value } = inputs.thumbLeftPos.el;

    inputs.thumbLeftPos.el.value = '-10';
    inputs.thumbLeftPos.el.dispatchEvent(fakeChange);
    expect(inputs.thumbLeftPos.el.value).toEqual(value);

    inputs.thumbLeftPos.el.value = '10a';
    inputs.thumbLeftPos.el.dispatchEvent(fakeChange);
    expect(inputs.thumbLeftPos.el.value).toEqual(value);

    inputs.thumbLeftPos.el.value = '1000';
    inputs.thumbLeftPos.el.dispatchEvent(fakeChange);
    expect(inputs.thumbLeftPos.el.value).toEqual('100');

    slider.setOptions({ thumbLeftPos: value, thumbRightPos: 50, range: true });
    inputs.thumbLeftPos.el.value = '51';
    inputs.thumbLeftPos.el.dispatchEvent(fakeChange);
    expect(inputs.thumbLeftPos.el.value).toEqual(value);
  });

  it('Поменяем значение thumbRightPos, оно не может выйти за пределы', () => {
    slider.setOptions({ thumbLeftPos: 0, range: true });
    if (inputs.thumbRightPos === null) throw new Error();

    const { value } = inputs.thumbRightPos.el;
    inputs.thumbRightPos.el.value = '-10';
    inputs.thumbRightPos.el.dispatchEvent(fakeChange);
    expect(inputs.thumbRightPos.el.value).toEqual(value);

    inputs.thumbRightPos.el.value = '1000';
    inputs.thumbRightPos.el.dispatchEvent(fakeChange);
    expect(inputs.thumbRightPos.el.value).toEqual('100');
  });

  it('Поменяем значение partsNum', () => {
    if (inputs.range === null) throw new Error();
    inputs.range.el.dispatchEvent(fakeChange);

    if (inputs.partsNum === null) throw new Error();
    const { value } = inputs.partsNum.el;
    inputs.partsNum.el.value = '-10';
    inputs.partsNum.el.dispatchEvent(fakeChange);
    expect(inputs.partsNum.el.value).toEqual(value);

    inputs.partsNum.el.value = '0';
    inputs.partsNum.el.dispatchEvent(fakeChange);
    expect(inputs.partsNum.el.value).toEqual(value);

    inputs.partsNum.el.value = '101';
    inputs.partsNum.el.dispatchEvent(fakeChange);
    expect(inputs.partsNum.el.value).toEqual(value);

    inputs.partsNum.el.value = '1n';
    inputs.partsNum.el.dispatchEvent(fakeChange);
    expect(inputs.partsNum.el.value).toEqual(value);

    inputs.partsNum.el.value = 'a';
    inputs.partsNum.el.dispatchEvent(fakeChange);
    expect(inputs.partsNum.el.value).toEqual(value);

    inputs.partsNum.el.value = '2.5';
    inputs.partsNum.el.dispatchEvent(fakeChange);
    expect(inputs.partsNum.el.value).toEqual(value);
  });
});

describe('Реагирует на ручное изменение положения бегунков\n', () => {
  const div = document.createElement('div');
  div.className = 'sliderPalette';
  div.style.marginTop = '100px';

  const options = {
    min: 0,
    max: 100,
    step: 1,
    selector: '.sliderPalette',
    angle: 0,
    range: true,
    hintAboveThumb: true,
  };

  const example = document.createElement('div');
  example.className = 'example3';

  beforeEach(() => {
    document.body.append(example);
    document.body.append(div);

    slider = new Presenter({ ...options });
    palette = new SliderOptionsPalette(example, slider);
    inputs = palette.inputs;

    anchors = div.getElementsByClassName('slider__scale-points');
    leftThumb = <HTMLDivElement>div.getElementsByClassName('slider__thumb-left')[0];
    rightThumb = <HTMLDivElement>div.getElementsByClassName('slider__thumb-right')[0];
    leftHint = <HTMLDivElement>leftThumb.getElementsByClassName('slider__hint')[0];
    rightHint = <HTMLDivElement>rightThumb.getElementsByClassName('slider__hint')[0];
  });

  afterEach(() => {
    example.innerHTML = '';
    example.remove();
    div.innerHTML = '';
    div.remove();
  });

  it('При перетаскивании бегунков мышкой значение соответствующего поля меняется', () => {
    const { scale } = slider.view;
    if (scale === null) throw new Error();
    const scaleWidth = scale.width;

    for (let i = 0; i < 5; i += 1) {
      const fakeMouseMove = new MouseEvent('mousemove',
        {
          bubbles: true,
          cancelable: true,
          clientX: scaleWidth / 5,
          clientY: 0,
        });

      if (inputs.thumbLeftPos === null) throw new Error();

      leftThumb.dispatchEvent(fakeMouseDown);
      expect(leftHint.textContent).toEqual(inputs.thumbLeftPos.el.value);
      leftThumb.dispatchEvent(fakeMouseMove);
      expect(slider.getOptions().thumbLeftPos).toEqual(Number(inputs.thumbLeftPos.el.value));
      leftThumb.dispatchEvent(fakeMouseUp);
    }

    for (let i = 0; i < 5; i += 1) {
      const fakeMouseMove = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: -scaleWidth / 10,
        clientY: 0,
      });

      if (inputs.thumbRightPos === null) throw new Error();

      rightThumb.dispatchEvent(fakeMouseDown);
      expect(rightHint.textContent).toEqual(inputs.thumbRightPos.el.value);
      rightThumb.dispatchEvent(fakeMouseMove);
      expect(slider.getOptions().thumbRightPos).toEqual(Number(inputs.thumbRightPos.el.value));
      rightThumb.dispatchEvent(fakeMouseUp);
    }
  });

  it('При щелчке на якоре шкалы, бегунок двигается и значение соответствующего поля меняется', () => {
    slider.setOptions({ partsNum: 4 });
    anchors[1].dispatchEvent(fakeClick);

    if (inputs.thumbLeftPos === null) throw new Error();
    expect(inputs.thumbLeftPos.el.value).toEqual('25');

    if (inputs.thumbRightPos === null) throw new Error();
    anchors[3].dispatchEvent(fakeClick);
    expect(inputs.thumbRightPos.el.value).toEqual('75');
  });
});

describe('Данные баги более не возникают\n', () => {
  const div = document.createElement('div');
  div.className = 'sliderPalette';
  div.style.marginTop = '100px';

  const options = {
    min: 0.5,
    max: 200,
    step: 2,
    selector: '.sliderPalette',
    angle: 0,
    range: true,
    hintAboveThumb: true,
    hintAlwaysShow: true,
    precision: 1,
  };

  const example = document.createElement('div');
  example.className = 'example4';

  beforeEach(() => {
    document.body.append(example);
    document.body.append(div);

    slider = new Presenter({ ...options });
    palette = new SliderOptionsPalette(example, slider);
    inputs = palette.inputs;

    anchors = div.getElementsByClassName('slider__scale-points');
    leftThumb = <HTMLDivElement>div.getElementsByClassName('slider__thumb-left')[0];
    rightThumb = <HTMLDivElement>div.getElementsByClassName('slider__thumb-right')[0];
    leftHint = <HTMLDivElement>leftThumb.getElementsByClassName('slider__hint')[0];
    rightHint = <HTMLDivElement>rightThumb.getElementsByClassName('slider__hint')[0];
  });

  afterEach(() => {
    example.innerHTML = '';
    example.remove();
    div.innerHTML = '';
    div.remove();
  });

  it('При смене значения "min" c "0.5" на "0" и обратно значения якорей высчитываются правильно', () => {
    expect(anchors[1].textContent).toEqual('100.5');
    if (inputs.min === null) throw new Error();
    inputs.min.el.value = '0';
    inputs.min.el.dispatchEvent(fakeChange);

    expect(anchors[1].textContent).toEqual('100');
  });

  it('При смене точности до 3 знаков, значения якорей шкалы совпадают со значениями модели', () => {
    slider.setOptions({ min: 0.555, max: 200, precision: 3 });
    if (inputs.min === null) throw new Error();

    expect(anchors[0].textContent).toEqual('0.555');
    expect(anchors[1].textContent).toEqual('100.555');
    expect(anchors[2].textContent).toEqual('200');
    expect(inputs.min.el.value).toEqual('0.555');

    anchors[1].dispatchEvent(fakeClick);
    if (inputs.thumbRightPos === null) throw new Error();
    expect(inputs.thumbRightPos.el.value).toEqual('100.555');
  });

  it(`При установке опции "range=false" значение поля "thumbRightPos" становится недоступным
    для редактирования`, () => {
    slider.setOptions({ range: false });
    if (inputs.thumbRightPos === null) throw new Error();
    expect(inputs.thumbRightPos.el.disabled).toBeTrue();
  });

  it(`При выборе опции "hintAlwaysShow" опция "hintAboveThumb" должна быть недоступна для
    редактирования`, () => {
    if (inputs.hintAboveThumb === null) throw new Error();
    expect(inputs.hintAboveThumb.el.disabled).toBeTrue();
    slider.setOptions({ hintAlwaysShow: true });
    expect(inputs.hintAboveThumb.el.disabled).toBeTrue();
    slider.setOptions({ hintAlwaysShow: false });
    expect(inputs.hintAboveThumb.el.disabled).toBeFalse();
  });

  it('При наложении бегунков значение подсказок должно быть одинаковым', () => {
    slider.setOptions({ min: 0, thumbLeftPos: 0 });

    if (inputs.max === null) throw new Error();
    inputs.max.el.value = '6';
    inputs.max.el.dispatchEvent(fakeChange);

    if (inputs.step === null) throw new Error();
    inputs.step.el.value = '1';
    inputs.step.el.dispatchEvent(fakeChange);

    if (inputs.thumbRightPos === null) throw new Error();
    inputs.thumbRightPos.el.value = '1';
    inputs.thumbRightPos.el.dispatchEvent(fakeChange);

    if (inputs.min === null) throw new Error();
    inputs.min.el.value = '1';
    inputs.min.el.dispatchEvent(fakeChange);

    expect(inputs.min.el.value).toEqual('1');
    expect(leftHint.textContent).toEqual('1');
    expect(rightHint.textContent).toEqual('1');
  });
});
