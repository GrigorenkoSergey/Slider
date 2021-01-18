/* eslint-disable prefer-destructuring */
import { Presenter } from '../src/assets/blocks/slider/components/presenter/presenter';
import { SliderOptionsPalette, Inputs }
  from '../src/assets/blocks/demo-page/components/slider-options-palette/slider-options-palette';

import '../src/assets/blocks/slider/slider';
import '../src/assets/blocks/demo-page/demo-page.scss';
import '../src/assets/blocks/slider/slider.scss';

const div = document.createElement('div');
div.classList.add('sliderPalette');
div.style.marginTop = '100px';

const example = document.createElement('div');

document.body.append(example, div);

const thumbs = div.getElementsByClassName('slider__thumb');
const anchors = div.getElementsByClassName('slider__scale-points');
const hints = div.getElementsByClassName('slider__hint');

let slider: Presenter;
let palette: SliderOptionsPalette;
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

const body = document.getElementsByTagName('body')[0];
// Иногда в некоторых тестах неожиданно появляется полоса прокрутки,
// что может сломать логику уже созданного слайдера.
// Поэтому ограничим максимальную ширину body.
body.style.width = `${document.documentElement.clientWidth * 0.9}px`;

describe('Проверка связи значения инпута со значением привязанного слайдера\n', () => {
  let thumbLeft: Element;

  const options = {
    min: 2,
    max: 600,
    step: 4,
    selector: '.sliderPalette',
    angle: 0,
    range: true,
    hintAboveThumb: true,
  };

  beforeEach(() => {
    slider = new Presenter(options);
    palette = new SliderOptionsPalette(example, slider);
    inputs = palette.inputs;
    thumbLeft = thumbs[0];
  });

  afterEach(() => {
    example.innerHTML = '';
    div.innerHTML = '';
  });

  it('Отображается смена значения max', () => {
    if (inputs.max === null) throw new Error();

    inputs.max.el.value = '500';
    inputs.max.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().max).toEqual(500);
    expect(anchors[anchors.length - 1].textContent).toEqual('500');
  });

  it('Отображается смена значения step', () => {
    if (inputs.step === null) throw new Error();

    inputs.step.el.value = '5';
    inputs.step.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().step).toEqual(5);
  });

  it('Отображается смена значения angle', () => {
    if (inputs.angle === null) throw new Error();

    inputs.angle.el.value = '45';
    inputs.angle.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().angle).toEqual(45);

    inputs.angle.el.value = '0';
    inputs.angle.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().angle).toEqual(0);
  });

  it('Отображается смена значения thumbLeftValue', () => {
    if (inputs.thumbLeftValue === null) throw new Error();

    inputs.thumbLeftValue.el.value = '50';
    inputs.thumbLeftValue.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().thumbLeftValue).toEqual(50);
    thumbLeft.dispatchEvent(fakeMouseDown);

    const hintLeft = hints[0];
    expect(hintLeft.textContent).toEqual('50');
    thumbLeft.dispatchEvent(fakeMouseUp);
  });

  it('Отображается смена значения "range"', () => {
    if (inputs.range === null) throw new Error();

    inputs.range.el.checked = true;
    inputs.range.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().range).toBeTrue();
    expect(thumbs[1]).toBeTruthy();

    inputs.range.el.checked = false;
    inputs.range.el.dispatchEvent(fakeChange);
    expect(slider.getOptions().range).toBeFalse();
    expect(thumbs[1]).toBeFalsy();
  });

  it('Отображается смена значения thumbRightValue', () => {
    if (inputs.range === null) throw new Error();
    inputs.range.el.checked = true;
    inputs.range.el.dispatchEvent(fakeChange);

    if (inputs.thumbRightValue === null) throw new Error();
    inputs.thumbRightValue.el.value = '400';
    inputs.thumbRightValue.el.dispatchEvent(fakeChange);

    const thumbRight = thumbs[1];

    expect(slider.getOptions().thumbRightValue).toEqual(402);
    thumbRight.dispatchEvent(fakeMouseDown);
    const hintRight = hints[0];
    expect(hintRight.textContent).toEqual('402');
    thumbRight.dispatchEvent(fakeMouseUp);
  });

  it('Отображается смена значения showScale', () => {
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

  it('Отображается смена значения hintAlwaysShow', () => {
    if (inputs.hintAlwaysShow === null) throw new Error();

    inputs.hintAlwaysShow.el.checked = false;
    inputs.hintAlwaysShow.el.dispatchEvent(fakeChange);

    expect(hints.length).toEqual(0);
    expect(slider.getOptions().hintAlwaysShow).toBeFalse();

    thumbLeft.dispatchEvent(fakeMouseDown);
    const hintLeft = hints[0];
    expect(hintLeft.clientHeight).toBeTruthy();
    thumbLeft.dispatchEvent(fakeMouseUp);

    inputs.hintAlwaysShow.el.checked = true;
    inputs.hintAlwaysShow.el.dispatchEvent(fakeChange);
    expect(hintLeft.clientWidth).toBeTruthy();
    expect(slider.getOptions().hintAlwaysShow).toBeTrue();
  });

  it('Отображается смена значения "partsAmount', () => {
    if (inputs.partsAmount === null) throw new Error();

    inputs.partsAmount.el.value = '3';
    inputs.partsAmount.el.dispatchEvent(fakeChange);
    expect(anchors.length).toEqual(4);

    inputs.partsAmount.el.value = '6';
    inputs.partsAmount.el.dispatchEvent(fakeChange);
    expect(anchors.length).toEqual(7);
  });

  it('Отображается смена значения hintAboveThumb', () => {
    if (inputs.hintAboveThumb === null) throw new Error();
    inputs.hintAboveThumb.el.checked = false;
    inputs.hintAboveThumb.el.dispatchEvent(fakeChange);

    if (inputs.hintAlwaysShow === null) throw new Error();

    inputs.hintAlwaysShow.el.checked = false;
    inputs.hintAlwaysShow.el.dispatchEvent(fakeChange);

    expect(hints.length).toEqual(0);
    expect(slider.getOptions().hintAboveThumb).toBeFalse();

    thumbLeft.dispatchEvent(fakeMouseDown);
    expect(hints.length).toEqual(0);
    thumbLeft.dispatchEvent(fakeMouseUp);

    inputs.hintAboveThumb.el.checked = true;
    inputs.hintAboveThumb.el.dispatchEvent(fakeChange);

    expect(hints.length).toBeFalsy();
    thumbLeft.dispatchEvent(fakeMouseDown);
    expect(hints.length).toBeTruthy();
    thumbLeft.dispatchEvent(fakeMouseUp);
    expect(slider.getOptions().hintAboveThumb).toBeTrue();
  });
});

describe('При установке значения свойств программно, значения полей меняются автоматически\n', () => {
  const options = {
    min: 0,
    max: 100,
    step: 1,
    selector: '.sliderPalette',
    angle: 0,
    range: true,
    hintAboveThumb: true,
  };

  beforeEach(() => {
    slider = new Presenter({ ...options });
    palette = new SliderOptionsPalette(example, slider);
    inputs = palette.inputs;
  });

  afterEach(() => {
    example.innerHTML = '';
    div.innerHTML = '';
  });

  it('Отображается смена значения min', () => {
    slider.setOptions({ min: 0 });
    expect(slider.getOptions().min).toEqual(0);
    expect(anchors[0].textContent).toEqual('0');

    if (inputs.min === null) throw new Error();

    expect(inputs.min.el.value).toEqual('0');
  });

  it('Отображается смена значения max', () => {
    slider.setOptions({ max: 200 });
    expect(slider.getOptions().max).toEqual(200);
    expect(anchors[anchors.length - 1].textContent).toEqual('200');

    if (inputs.max === null) throw new Error();

    expect(inputs.max.el.value).toEqual('200');
  });

  it('Отображается смена значения max', () => {
    slider.setOptions({ max: 100 });
    expect(slider.getOptions().max).toEqual(100);
    expect(anchors[anchors.length - 1].textContent).toEqual('100');

    if (inputs.max === null) throw new Error();

    expect(inputs.max.el.value).toEqual('100');
  });

  it('Отображается смена значения step', () => {
    slider.setOptions({ step: 100 });
    expect(slider.getOptions().max).toEqual(100);
    expect(anchors[anchors.length - 1].textContent).toEqual('100');

    if (inputs.max === null) throw new Error();

    expect(inputs.max.el.value).toEqual('100');
  });

  it('Отображается смена значения angle', () => {
    slider.setOptions({ angle: 45 });
    expect(slider.getOptions().angle).toEqual(45);
  });

  it('Отображается смена значения thumbLeftValue', () => {
    slider.setOptions({ thumbLeftValue: 25, range: false });
    expect(slider.getOptions().thumbLeftValue).toEqual(25);

    if (inputs.max === null) throw new Error();

    expect(inputs.max.el.value).toEqual('100');

    if (inputs.thumbLeftValue === null) throw new Error();

    expect(inputs.thumbLeftValue.el.value).toEqual('25');

    anchors[0].dispatchEvent(fakeClick);
    expect(inputs.thumbLeftValue.el.value).toEqual('0');

    anchors[1].dispatchEvent(fakeClick);
    expect(inputs.thumbLeftValue.el.value).toEqual('50');

    anchors[2].dispatchEvent(fakeClick);
    expect(inputs.thumbLeftValue.el.value).toEqual('100');
  });

  it('Отображается смена значения "range"', () => {
    slider.setOptions({ range: false });
    if (inputs.range === null) throw new Error();

    expect(inputs.range.el.checked).toBeFalse();

    slider.setOptions({ range: true });
    expect(inputs.range.el.checked).toBeTrue();
  });

  it('Отображается смена значения "thumbRightValue"', () => {
    slider.setOptions({ thumbRightValue: 75 });
    if (inputs.thumbRightValue === null) throw new Error();

    expect(inputs.thumbRightValue.el.value).toEqual('75');

    anchors[1].dispatchEvent(fakeClick);
    expect(inputs.thumbRightValue.el.value).toEqual('50');

    anchors[2].dispatchEvent(fakeClick);
    expect(inputs.thumbRightValue.el.value).toEqual('100');
  });

  it('Отображается смена значения "showScale"', () => {
    slider.setOptions({ showScale: false });
    if (inputs.showScale === null) throw new Error();

    expect(inputs.showScale.el.checked).toBeFalse();

    slider.setOptions({ showScale: true });
    expect(inputs.showScale.el.checked).toBeTrue();
  });

  it('Отображается смена значения "hintAlwaysShow"', () => {
    slider.setOptions({ hintAlwaysShow: true });
    if (inputs.hintAlwaysShow === null) throw new Error();

    expect(inputs.hintAlwaysShow.el.checked).toBeTrue();

    slider.setOptions({ hintAlwaysShow: false });
    expect(inputs.hintAlwaysShow.el.checked).toBeFalse();
  });

  it('Отображается смена значения "partsAmount"', () => {
    slider.setOptions({ partsAmount: 3 });
    if (inputs.partsAmount === null) throw new Error();

    expect(inputs.partsAmount.el.value).toEqual('3');

    slider.setOptions({ partsAmount: 4 });
    expect(inputs.partsAmount.el.value).toEqual('4');
  });

  it('Отображается смена значения "hintAboveThumb"', () => {
    slider.setOptions({ hintAboveThumb: true });
    if (inputs.hintAboveThumb === null) throw new Error();

    expect(inputs.hintAboveThumb.el.checked).toBeTrue();

    slider.setOptions({ hintAboveThumb: false });
    expect(inputs.hintAboveThumb.el.checked).toBeFalse();
  });
});

describe('В поля ввода нельзя ввести ошибочные данные\n', () => {
  const options = {
    min: 0,
    max: 100,
    step: 1,
    selector: '.sliderPalette',
  };

  beforeEach(() => {
    slider = new Presenter({ ...options });
    palette = new SliderOptionsPalette(example, slider);
    inputs = palette.inputs;
  });

  afterEach(() => {
    example.innerHTML = '';
    div.innerHTML = '';
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

  it('Отображается смена значения angle', () => {
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

  it('Отображается смена значения thumbLeftValue, оно не может выйти за пределы', () => {
    if (inputs.range === null) throw new Error();

    inputs.range.el.checked = false;
    inputs.range.el.dispatchEvent(fakeChange);

    if (inputs.thumbLeftValue === null) throw new Error();

    const { value } = inputs.thumbLeftValue.el;

    inputs.thumbLeftValue.el.value = '-10';
    inputs.thumbLeftValue.el.dispatchEvent(fakeChange);
    expect(inputs.thumbLeftValue.el.value).toEqual(value);

    inputs.thumbLeftValue.el.value = '10a';
    inputs.thumbLeftValue.el.dispatchEvent(fakeChange);
    expect(inputs.thumbLeftValue.el.value).toEqual(value);

    inputs.thumbLeftValue.el.value = '1000';
    inputs.thumbLeftValue.el.dispatchEvent(fakeChange);
    expect(inputs.thumbLeftValue.el.value).toEqual('100');

    slider.setOptions({ thumbLeftValue: value, thumbRightValue: 50, range: true });
    inputs.thumbLeftValue.el.value = '51';
    inputs.thumbLeftValue.el.dispatchEvent(fakeChange);
    expect(inputs.thumbLeftValue.el.value).toEqual(value);
  });

  it('Отображается смена значения thumbRightValue, оно не может выйти за пределы', () => {
    slider.setOptions({ thumbLeftValue: 0, range: true });
    if (inputs.thumbRightValue === null) throw new Error();

    const { value } = inputs.thumbRightValue.el;
    inputs.thumbRightValue.el.value = '-10';
    inputs.thumbRightValue.el.dispatchEvent(fakeChange);
    expect(inputs.thumbRightValue.el.value).toEqual(value);

    inputs.thumbRightValue.el.value = '1000';
    inputs.thumbRightValue.el.dispatchEvent(fakeChange);
    expect(inputs.thumbRightValue.el.value).toEqual('100');
  });

  it('Отображается смена значения partsAmount', () => {
    if (inputs.range === null) throw new Error();

    inputs.range.el.dispatchEvent(fakeChange);

    if (inputs.partsAmount === null) throw new Error();

    const { value } = inputs.partsAmount.el;
    inputs.partsAmount.el.value = '-10';
    inputs.partsAmount.el.dispatchEvent(fakeChange);
    expect(inputs.partsAmount.el.value).toEqual(value);

    inputs.partsAmount.el.value = '0';
    inputs.partsAmount.el.dispatchEvent(fakeChange);
    expect(inputs.partsAmount.el.value).toEqual(value);

    inputs.partsAmount.el.value = '101';
    inputs.partsAmount.el.dispatchEvent(fakeChange);
    expect(inputs.partsAmount.el.value).toEqual(value);

    inputs.partsAmount.el.value = '1n';
    inputs.partsAmount.el.dispatchEvent(fakeChange);
    expect(inputs.partsAmount.el.value).toEqual(value);

    inputs.partsAmount.el.value = 'a';
    inputs.partsAmount.el.dispatchEvent(fakeChange);
    expect(inputs.partsAmount.el.value).toEqual(value);

    inputs.partsAmount.el.value = '2.5';
    inputs.partsAmount.el.dispatchEvent(fakeChange);
    expect(inputs.partsAmount.el.value).toEqual(value);
  });
});

describe('Реагирует на ручное изменение положения бегунков\n', () => {
  const options = {
    min: 0,
    max: 100,
    step: 1,
    selector: '.sliderPalette',
    angle: 0,
    range: true,
    hintAboveThumb: true,
  };

  beforeEach(() => {
    slider = new Presenter({ ...options });
    palette = new SliderOptionsPalette(example, slider);
    inputs = palette.inputs;
  });

  afterEach(() => {
    example.innerHTML = '';
    div.innerHTML = '';
  });

  it('При перетаскивании бегунков мышкой значение соответствующего поля меняется', () => {
    const scale = div.querySelector('.slider__scale');
    if (!(scale instanceof HTMLDivElement)) throw new Error();

    const thumbLeft = thumbs[0];
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();
    const scaleWidth = scale.clientWidth - thumbLeft.offsetWidth;

    for (let i = 0; i < 5; i += 1) {
      const fakeMouseMove = new MouseEvent('mousemove',
        {
          bubbles: true,
          cancelable: true,
          clientX: scaleWidth / 5,
          clientY: 0,
        });

      if (inputs.thumbLeftValue === null) throw new Error();

      thumbLeft.dispatchEvent(fakeMouseDown);
      const hintLeft = hints[0];

      expect(hintLeft.textContent).toEqual(inputs.thumbLeftValue.el.value);
      thumbLeft.dispatchEvent(fakeMouseMove);
      expect(slider.getOptions().thumbLeftValue)
        .toEqual(Number(inputs.thumbLeftValue.el.value));
      thumbLeft.dispatchEvent(fakeMouseUp);
    }

    for (let i = 0; i < 5; i += 1) {
      const fakeMouseMove = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: -scaleWidth / 10,
        clientY: 0,
      });

      if (inputs.thumbRightValue === null) throw new Error();

      const thumbRight = thumbs[1];
      thumbRight.dispatchEvent(fakeMouseDown);
      const hintRight = hints.length > 1 ? hints[1] : hints[0];
      expect(hintRight.textContent).toEqual(inputs.thumbRightValue.el.value);

      thumbRight.dispatchEvent(fakeMouseMove);
      expect(slider.getOptions().thumbRightValue).toEqual(Number(inputs.thumbRightValue.el.value));
      thumbRight.dispatchEvent(fakeMouseUp);
    }
  });

  it('При щелчке на якоре шкалы, бегунок двигается и значение соответствующего поля меняется', () => {
    slider.setOptions({ partsAmount: 4 });
    anchors[1].dispatchEvent(fakeClick);

    if (inputs.thumbLeftValue === null) throw new Error();

    expect(inputs.thumbLeftValue.el.value).toEqual('25');

    if (inputs.thumbRightValue === null) throw new Error();

    anchors[3].dispatchEvent(fakeClick);
    expect(inputs.thumbRightValue.el.value).toEqual('75');
  });
});

describe('Данные баги более не возникают\n', () => {
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

  beforeEach(() => {
    slider = new Presenter({ ...options });
    palette = new SliderOptionsPalette(example, slider);
    inputs = palette.inputs;
  });

  afterEach(() => {
    example.innerHTML = '';
    div.innerHTML = '';
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
    if (inputs.thumbRightValue === null) throw new Error();
    expect(inputs.thumbRightValue.el.value).toEqual('100.555');
  });

  it(`При установке опции "range=false" значение поля "thumbRightValue" становится недоступным
    для редактирования`, () => {
    slider.setOptions({ range: false });
    if (inputs.thumbRightValue === null) throw new Error();
    expect(inputs.thumbRightValue.el.disabled).toBeTrue();
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

  it('При наложении бегунков одна из подсказок пропадает', () => {
    slider.setOptions({ min: 0, thumbLeftValue: 0 });

    if (inputs.max === null) throw new Error();

    inputs.max.el.value = '6';
    inputs.max.el.dispatchEvent(fakeChange);

    if (inputs.step === null) throw new Error();

    inputs.step.el.value = '1';
    inputs.step.el.dispatchEvent(fakeChange);

    if (inputs.thumbRightValue === null) throw new Error();

    inputs.thumbRightValue.el.value = '1';
    inputs.thumbRightValue.el.dispatchEvent(fakeChange);

    if (inputs.min === null) throw new Error();

    inputs.min.el.value = '1';
    inputs.min.el.dispatchEvent(fakeChange);

    const hintLeft = hints[0];
    expect(inputs.min.el.value).toEqual('1');
    expect(hints.length).toEqual(1);
    expect(hintLeft.textContent).toEqual('1');
  });
});
