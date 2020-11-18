import '../src/assets/blocks/slider/slider';
import '../src/assets/blocks/helpers/types';
import Presenter from '../src/assets/blocks/slider/components/presenter/presenter';
import SliderOptionsPalette from '../src/assets/blocks/main-page/components/slider-options-palette';

import '../src/assets/blocks/main-page/main-page.scss';
import '../src/assets/blocks/slider/slider.scss';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../src/assets/blocks/helpers/debugger-point';


let slider: Presenter;
let palette: SliderOptionsPalette;
let anchors: HTMLCollection; 
let leftThumb: Element;
let rightThumb: Element;
let leftHint: Element;
let rightHint: Element;

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
});

describe('Проверка связи значения инпута со значением привязанного слайдера', () => {
  const div = document.createElement('div');
  div.className = 'sliderPalette';
  div.style.marginTop = "100px";

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
  beforeEach(() => {
    document.body.append(example);
    document.body.append(div);

    slider = new Presenter(options);
    palette = new SliderOptionsPalette(example, slider);

    anchors = div.getElementsByClassName('slider__scale-points');
    leftThumb = div.getElementsByClassName('slider__thumb-left')[0];
    rightThumb = div.getElementsByClassName('slider__thumb-right')[0];
    leftHint = leftThumb.getElementsByClassName('slider__hint')[0];
    rightHint = rightThumb.getElementsByClassName('slider__hint')[0];
  });

  afterEach(() => {
    example.innerHTML = '';
    example.remove();
    div.innerHTML = '';
    div.remove();
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

    palette.hintAlwaysShow.el.checked = false;
    palette.hintAlwaysShow.el.dispatchEvent(fakeChange);
    
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

describe(`При установке значения свойств программно, значения полей меняются автоматически\n`, () => {
  const div = document.createElement('div');
  div.className = 'sliderPalette';
  div.style.marginTop = "100px";

  let options: Obj = {
    min: 0,
    max: 100,
    step: 1,
    selector: ".sliderPalette",
    angle: 0,
    range: true,
    hintAboveThumb: true,
  };

  let example = document.createElement('div');
  example.className = 'example2';

  beforeEach(() => {
    document.body.append(example);
    document.body.append(div);

    slider = new Presenter({...options});
    palette = new SliderOptionsPalette(example, slider);

    anchors = div.getElementsByClassName('slider__scale-points');
    leftThumb = div.getElementsByClassName('slider__thumb-left')[0];
    rightThumb = div.getElementsByClassName('slider__thumb-right')[0];
    leftHint = leftThumb.getElementsByClassName('slider__hint')[0];
    rightHint = rightThumb.getElementsByClassName('slider__hint')[0];
  });

  afterEach(() => {
    example.innerHTML = '';
    example.remove();
    div.innerHTML = '';
    div.remove();
  });

  it(`Поменяем значение min`, () => {
    slider.setOptions({min: 0});
    expect(slider.getOptions().min).toEqual(0);
    expect(anchors[0].textContent).toEqual('0');
    expect(palette.min.el.value).toEqual('0');
  });

  it(`Поменяем значение max`, () => {
    slider.setOptions({max: 200});
    expect(slider.getOptions().max).toEqual(200);
    expect(anchors[anchors.length - 1].textContent).toEqual('200');
    expect(palette.max.el.value).toEqual('200');
  });

  it(`Поменяем значение max`, () => {
    slider.setOptions({max: 100});
    expect(slider.getOptions().max).toEqual(100);
    expect(anchors[anchors.length - 1].textContent).toEqual('100');
    expect(palette.max.el.value).toEqual('100');
    //проверить на возможные ошибки
  });

  it(`Поменяем значение step`, () => {
    slider.setOptions({step: 100});
    expect(slider.getOptions().max).toEqual(100);
    expect(anchors[anchors.length - 1].textContent).toEqual('100');
    expect(palette.max.el.value).toEqual('100');
  });

  it(`Поменяем значение angle`, () => {
    slider.setOptions({angle: 45});
    expect(slider.getOptions().angle).toEqual(45);
  });

  it(`Поменяем значение thumbLeftPos`, () => {
    slider.setOptions({thumbLeftPos: 25, range: false});
    expect(slider.getOptions().thumbLeftPos).toEqual(25);
    expect(palette.thumbLeftPos.el.value).toEqual('25');

    anchors[0].dispatchEvent(fakeClick);
    expect(palette.thumbLeftPos.el.value).toEqual('0');

    anchors[1].dispatchEvent(fakeClick);
    expect(palette.thumbLeftPos.el.value).toEqual('50');

    anchors[2].dispatchEvent(fakeClick);
    expect(palette.thumbLeftPos.el.value).toEqual('100');
  });

  it(`Поменяем значение "range"`, () => {
    slider.setOptions({range: false});
    expect(palette.range.el.checked).toBeFalse();

    slider.setOptions({range: true});
    expect(palette.range.el.checked).toBeTrue();
  });

  it(`Поменяем значение "thumbRightPos"`, () => {
    slider.setOptions({thumbRightPos: 75});
    expect(palette.thumbRightPos.el.value).toEqual('75');

    anchors[1].dispatchEvent(fakeClick);
    expect(palette.thumbRightPos.el.value).toEqual('50');

    anchors[2].dispatchEvent(fakeClick);
    expect(palette.thumbRightPos.el.value).toEqual('100');
  });

  it(`Поменяем значение "showScale"`, () => {
    slider.setOptions({showScale: false});
    expect(palette.showScale.el.checked).toBeFalse();

    slider.setOptions({showScale: true});
    expect(palette.showScale.el.checked).toBeTrue();
  });

  it(`Поменяем значение "hintAlwaysShow"`, () => {
    slider.setOptions({hintAlwaysShow: true});
    expect(palette.hintAlwaysShow.el.checked).toBeTrue();

    slider.setOptions({hintAlwaysShow: false});
    expect(palette.hintAlwaysShow.el.checked).toBeFalse();
  });

  it(`Поменяем значение "partsNum"`, () => {
    slider.setOptions({partsNum: 3});
    expect(palette.partsNum.el.value).toEqual('3');

    slider.setOptions({partsNum: 4});
    expect(palette.partsNum.el.value).toEqual('4');
  });

  it(`Поменяем значение "hintAboveThumb"`, () => {
    slider.setOptions({hintAboveThumb: true});
    expect(palette.hintAboveThumb.el.checked).toBeTrue();

    slider.setOptions({hintAboveThumb: false});
    expect(palette.hintAboveThumb.el.checked).toBeFalse();
  });
});

describe('В поля ввода нельза ввести ошибочные данные\n', () => {
  const div = document.createElement('div');
  div.className = 'sliderPalette';
  div.style.marginTop = "100px";

  let options: Obj = {
    min: 0,
    max: 100,
    step: 1,
    selector: ".sliderPalette",
  };

  let example = document.createElement('div');
  example.className = 'example3';

  beforeEach(() => {
    document.body.append(example);
    document.body.append(div);

    slider = new Presenter({...options});
    palette = new SliderOptionsPalette(example, slider);
  });

  afterEach(() => {
    example.innerHTML = '';
    example.remove();
    div.innerHTML = '';
    div.remove();
  });

  it(`Попробуем поменять значение min`, () => {
    const value = palette.min.el.value;
    palette.min.el.value = 'a';
    palette.min.el.dispatchEvent(fakeChange);

    expect(palette.min.el.value).toEqual(value);

    palette.min.el.value = '101';
    palette.min.el.dispatchEvent(fakeChange);
    expect(palette.min.el.value).toEqual(value);

    palette.min.el.value = 'Infinity';
    palette.min.el.dispatchEvent(fakeChange);
    expect(palette.min.el.value).toEqual(value);

    palette.min.el.value = '101a';
    palette.min.el.dispatchEvent(fakeChange);
    expect(palette.min.el.value).toEqual(value);

    slider.setOptions({max: 10, min: 0, step: 5});
    palette.min.el.value = '6';
    palette.min.el.dispatchEvent(fakeChange);
    expect(palette.min.el.value).toEqual('0');
  });

  it(`Попробуем поменять значение max`, () => {
    const value = palette.max.el.value;
    palette.max.el.value = 'a';
    palette.max.el.dispatchEvent(fakeChange);

    expect(palette.max.el.value).toEqual(value);

    palette.max.el.value = '-10';
    palette.max.el.dispatchEvent(fakeChange);
    expect(palette.max.el.value).toEqual(value);

    palette.max.el.value = 'Infinity';
    palette.max.el.dispatchEvent(fakeChange);
    expect(palette.max.el.value).toEqual(value);

    palette.max.el.value = '101n';
    palette.max.el.dispatchEvent(fakeChange);
    expect(palette.max.el.value).toEqual(value);

    slider.setOptions({max: 10, min: 0, step: 5});
    palette.max.el.value = '4';
    palette.max.el.dispatchEvent(fakeChange);
    expect(palette.max.el.value).toEqual('10');
  });

  it(`Попробуем поменять значение step`, () => {
    const value = palette.step.el.value;
    palette.step.el.value = 'a';
    palette.step.el.dispatchEvent(fakeChange);

    expect(palette.step.el.value).toEqual(value);

    palette.step.el.value = '-1';
    palette.step.el.dispatchEvent(fakeChange);
    expect(palette.step.el.value).toEqual(value);

    palette.step.el.value = 'Infinity';
    palette.step.el.dispatchEvent(fakeChange);
    expect(palette.step.el.value).toEqual(value);

    palette.step.el.value = '1n';
    palette.step.el.dispatchEvent(fakeChange);
    expect(palette.step.el.value).toEqual(value);

    palette.step.el.value = '0';
    palette.step.el.dispatchEvent(fakeChange);
    expect(palette.step.el.value).toEqual(value);
  });

  it(`Поменяем значение angle`, () => {
    debugger;
    const value = palette.angle.el.value;
    palette.angle.el.value = '-10';
    palette.angle.el.dispatchEvent(fakeChange);
    expect(palette.angle.el.value).toEqual(value);

    palette.angle.el.value = '91';
    palette.angle.el.dispatchEvent(fakeChange);
    expect(palette.angle.el.value).toEqual(value);

    palette.angle.el.value = '0a';
    palette.angle.el.dispatchEvent(fakeChange);
    expect(palette.angle.el.value).toEqual(value);
  });

  it(`Поменяем значение thumbLeftPos, оно не может выйти за пределы`, () => {
    palette.range.el.checked = false;
    palette.range.el.dispatchEvent(fakeChange);

    const value = palette.thumbLeftPos.el.value;

    palette.thumbLeftPos.el.value = '-10';
    palette.thumbLeftPos.el.dispatchEvent(fakeChange);
    expect(palette.thumbLeftPos.el.value).toEqual(value);

    palette.thumbLeftPos.el.value = '10a';
    palette.thumbLeftPos.el.dispatchEvent(fakeChange);
    expect(palette.thumbLeftPos.el.value).toEqual(value);

    palette.thumbLeftPos.el.value = '1000';
    palette.thumbLeftPos.el.dispatchEvent(fakeChange);
    expect(palette.thumbLeftPos.el.value).toEqual('100');

    slider.setOptions({thumbLeftPos: value, thumbRightPos: 50, range: true})
    palette.thumbLeftPos.el.value = '51';
    palette.thumbLeftPos.el.dispatchEvent(fakeChange);
    expect(palette.thumbLeftPos.el.value).toEqual(value);
  });

  it(`Поменяем значение thumbRighPos, оно не может выйти за пределы`, () => {
    slider.setOptions({thumbLeftPos: 0, range: true});

    const value = palette.thumbRightPos.el.value;
    palette.thumbRightPos.el.value = '-10';
    palette.thumbRightPos.el.dispatchEvent(fakeChange);
    expect(palette.thumbRightPos.el.value).toEqual(value);

    palette.thumbRightPos.el.value = '1000';
    palette.thumbRightPos.el.dispatchEvent(fakeChange);
    expect(palette.thumbRightPos.el.value).toEqual('100');
  });

  it(`Поменяем значение partsNum`, () => {
    palette.range.el.dispatchEvent(fakeChange);

    const value = palette.partsNum.el.value;
    palette.partsNum.el.value = '-10';
    palette.partsNum.el.dispatchEvent(fakeChange);
    expect(palette.partsNum.el.value).toEqual(value);

    palette.partsNum.el.value = '0';
    palette.partsNum.el.dispatchEvent(fakeChange);
    expect(palette.partsNum.el.value).toEqual(value);

    palette.partsNum.el.value = '101';
    palette.partsNum.el.dispatchEvent(fakeChange);
    expect(palette.partsNum.el.value).toEqual(value);

    palette.partsNum.el.value = '1n';
    palette.partsNum.el.dispatchEvent(fakeChange);
    expect(palette.partsNum.el.value).toEqual(value);

    palette.partsNum.el.value = 'a';
    palette.partsNum.el.dispatchEvent(fakeChange);
    expect(palette.partsNum.el.value).toEqual(value);

    palette.partsNum.el.value = '2.5';
    palette.partsNum.el.dispatchEvent(fakeChange);
    expect(palette.partsNum.el.value).toEqual(value);
  });
});

describe(`Реагирует на ручное изменение положения бегунков\n`, () => {
  const div = document.createElement('div');
  div.className = 'sliderPalette';
  div.style.marginTop = "100px";

  let options: Obj = {
    min: 0,
    max: 100,
    step: 1,
    selector: ".sliderPalette",
    angle: 0,
    range: true,
    hintAboveThumb: true,
  };

  let example = document.createElement('div');
  example.className = 'example3';

  beforeEach(() => {
    document.body.append(example);
    document.body.append(div);

    slider = new Presenter({...options});
    palette = new SliderOptionsPalette(example, slider);

    anchors = div.getElementsByClassName('slider__scale-points');
    leftThumb = div.getElementsByClassName('slider__thumb-left')[0];
    rightThumb = div.getElementsByClassName('slider__thumb-right')[0];
    leftHint = leftThumb.getElementsByClassName('slider__hint')[0];
    rightHint = rightThumb.getElementsByClassName('slider__hint')[0];
  });

  afterEach(() => {
    example.innerHTML = '';
    example.remove();
    div.innerHTML = '';
    div.remove();
  });

  it(`При перетаскивании бегунков мышкой значение соответствующего поля меняется`, () => {
    const scaleWidth = slider.view.scale.width;

    for (let i = 0; i < 5; i++) {
      let fakeMouseMove = new MouseEvent('mousemove',
        {
          bubbles: true, cancelable: true,
          clientX: scaleWidth / 5, clientY: 0,
        });

      leftThumb.dispatchEvent(fakeMouseDown);
      expect(leftHint.textContent).toEqual(palette.thumbLeftPos.el.value);
      leftThumb.dispatchEvent(fakeMouseMove);
      expect(slider.getOptions().thumbLeftPos).toEqual(Number(palette.thumbLeftPos.el.value));
      leftThumb.dispatchEvent(fakeMouseUp);
    }

    for (let i = 0; i < 5; i++) {
      let fakeMouseMove = new MouseEvent('mousemove', {
        bubbles: true, cancelable: true,
        clientX: -scaleWidth / 10, clientY: 0,
      })

      rightThumb.dispatchEvent(fakeMouseDown);
      expect(rightHint.textContent).toEqual(palette.thumbRightPos.el.value);
      rightThumb.dispatchEvent(fakeMouseMove);
      expect(slider.getOptions().thumbRightPos).toEqual(Number(palette.thumbRightPos.el.value));
      rightThumb.dispatchEvent(fakeMouseUp);
    }
  });

  it(`При щелчке на якоре шкалы, бегунок двигается и значение соответствующего поля меняется`, () => {
    slider.setOptions({partsNum: 4})
    anchors[1].dispatchEvent(fakeClick);
    expect(palette.thumbLeftPos.el.value).toEqual('25');
    anchors[3].dispatchEvent(fakeClick);
    expect(palette.thumbRightPos.el.value).toEqual('75');
  });
});

describe(`Данные баги более не возникают`, () => {
  const div = document.createElement('div');
  div.className = 'sliderPalette';
  div.style.marginTop = "100px";

  let options: Obj = {
    min: 0.5,
    max: 200,
    step: 2,
    selector: ".sliderPalette",
    angle: 0,
    range: true,
    hintAboveThumb: true,
  };

  let example = document.createElement('div');
  example.className = 'example4';

  beforeEach(() => {
    document.body.append(example);
    document.body.append(div);

    slider = new Presenter({...options});
    palette = new SliderOptionsPalette(example, slider);

    anchors = div.getElementsByClassName('slider__scale-points');
    leftThumb = div.getElementsByClassName('slider__thumb-left')[0];
    rightThumb = div.getElementsByClassName('slider__thumb-right')[0];
    leftHint = leftThumb.getElementsByClassName('slider__hint')[0];
    rightHint = rightThumb.getElementsByClassName('slider__hint')[0];
  });

  afterEach(() => {
    example.innerHTML = '';
    example.remove();
    div.innerHTML = '';
    div.remove();
  });

  it('При смене значения "min" c "0.5" на "0" и обратно значения якорей высчитываются правильно', () => {
    expect(anchors[1].textContent).toEqual('100.5')
    palette.min.el.value = '0';
    palette.min.el.dispatchEvent(fakeChange);

    expect(anchors[1].textContent).toEqual('100');
  });

  it('При смене точности до 3 знаков, значения якорей шкалы совпадают со значениями модели', () => {
    slider.setOptions({min: 0.555, max: 200, precision: 3});
    expect(anchors[0].textContent).toEqual('0.555');
    expect(anchors[1].textContent).toEqual('100.555');
    expect(anchors[2].textContent).toEqual('200');
    expect(palette.min.el.value).toEqual('0.555');

    anchors[1].dispatchEvent(fakeClick);
    expect(palette.thumbRightPos.el.value).toEqual('100.555');
  });

})