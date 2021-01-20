/* eslint-disable prefer-destructuring */
/* eslint-disable no-new */
import { Slider } from '../src/assets/blocks/slider/slider';
import '../src/assets/blocks/slider/slider.scss';

const div = document.createElement('div');
// Должен быть уникальный класс для каждого спека.
div.classList.add('divIntergationSpec');
div.style.marginTop = '70px';
document.body.append(div);

const thumbs = div.getElementsByClassName('slider__thumb');
const sliderCollection = div.getElementsByClassName('slider');
const anchors = div.getElementsByClassName('slider__scale-points');
const hints = div.getElementsByClassName('slider__hint');

const fakeMouseMove = (x: number = 0, y: number = 0) => new MouseEvent('mousemove', {
  bubbles: true,
  cancelable: true,
  clientX: x,
  clientY: y,
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

describe('Проверка поведения подсказки над бегунком\n', () => {
  afterEach(() => {
    div.innerHTML = '';
  });

  const options = {
    range: true,
    selector: '.divIntergationSpec',
    className: 'slider',
    showScale: true,
    min: 20,
    max: 200,
    thumbLeftValue: 25,
  };

  it(`При включенной опции "hintAlwaysShow" и при клике на значении шкалы,
  значение подсказки над бегунком меняется`, () => {
    const slider = new Slider({ ...options, hintAlwaysShow: true, step: 1 });

    const thumbLeft = thumbs[0];
    expect(hints[0].textContent).toEqual('25');

    thumbLeft.dispatchEvent(fakeMouseDown);
    expect(hints[0].textContent).toEqual('25');
    expect(hints[1].textContent).toEqual('200');
    thumbLeft.dispatchEvent(fakeMouseUp);

    slider.setOptions({ thumbLeftValue: 50 });
    anchors[1].dispatchEvent(fakeClick);
    expect(hints[0].textContent).toEqual('110');
  });

  it('При нажатии на сам слайдер, значение подсказки над бегунком также меняется', () => {
    const slider = new Slider({
      ...options,
      min: 0,
      max: 100,
      hintAlwaysShow: true,
      thumbLeftValue: 0,
    });

    slider.setOptions({ range: false });

    const thumbLeft = thumbs[0];
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();

    const sliderDiv = sliderCollection[0];
    if (!(sliderDiv instanceof HTMLDivElement)) throw new Error();

    const thumbStartX = thumbLeft.getBoundingClientRect().left;

    const hint = hints[0];
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    let fakeMouseClick = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: thumbStartX + sliderDiv.clientWidth,
      clientY: 0,
    });

    sliderDiv.dispatchEvent(fakeMouseClick);
    expect(hint.textContent).toEqual('100');

    fakeMouseClick = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: -thumbStartX - sliderDiv.clientWidth,
      clientY: 0,
    });

    sliderDiv.dispatchEvent(fakeMouseClick);
    expect(hint.textContent).toEqual('0');
  });
});

describe('Меняет значения подсказки над бегунком, берет данные из модели\n', () => {
  const options = {
    range: true,
    selector: '.divIntergationSpec',
    className: 'slider',
    showScale: true,
    partsAmount: 4,
    min: 10,
    max: 100,
  };

  afterEach(() => {
    div.innerHTML = '';
  });

  it('При нажатии на левом кругляше отображается подсказка', () => {
    new Slider(options);
    const thumbLeft = thumbs[0];
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();

    thumbLeft.dispatchEvent(fakeMouseDown);

    const hint = hints[0];
    if (!(hint instanceof HTMLDivElement)) {
      throw new Error();
    }

    expect(hint.textContent).toEqual('10');
    thumbLeft.dispatchEvent(fakeMouseUp);
  });

  it('При нажатии на правом кругляше отображается подсказка', () => {
    new Slider({ ...options, thumbRightValue: 70 });
    const thumbRight = thumbs[1];
    if (!(thumbRight instanceof HTMLDivElement)) throw new Error();

    thumbRight.dispatchEvent(fakeMouseDown);

    const hint = hints[1] ? hints[1] : hints[0];
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.textContent).toEqual('70');
    thumbRight.dispatchEvent(fakeMouseUp);
  });

  it('При движении значение подсказки меняется', () => {
    new Slider(options);
    const thumbLeft = thumbs[0];
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();

    const thumbRight = thumbs[1];
    if (!(thumbRight instanceof HTMLDivElement)) throw new Error();

    thumbLeft.dispatchEvent(fakeMouseDown);
    const hintLeft = hints[0];
    if (!(hintLeft instanceof HTMLDivElement)) throw new Error();

    const sliderDiv = sliderCollection[0];
    const scaleWidth = sliderDiv.clientWidth - thumbLeft.offsetWidth;

    thumbLeft.dispatchEvent(fakeMouseMove(scaleWidth / 2));
    expect(hintLeft.textContent).toEqual('55');
    thumbLeft.dispatchEvent(fakeMouseUp);

    thumbRight.dispatchEvent(fakeMouseDown);

    const hintRight = hints[1] ? hints[1] : hints[0];
    if (!(hintRight instanceof HTMLDivElement)) throw new Error();

    thumbRight.dispatchEvent(fakeMouseMove(-scaleWidth / 4));
    expect(hintRight.textContent).toEqual('78');
    thumbRight.dispatchEvent(fakeMouseUp);
  });
});

describe('Проверка работы "alternativeRange"\n', () => {
  const options = {
    range: true,
    selector: '.divIntergationSpec',
    className: 'slider',
    showScale: true,
    partsAmount: 2,
    alternativeRange: ['Jan', 'Feb', 'March', 'Apr', 'May',
      'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  };

  afterEach(() => {
    div.innerHTML = '';
  });

  it('При нажатии на левом кругляше отображается подсказка', () => {
    new Slider(options);
    const thumbLeft = thumbs[0];
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();
    thumbLeft.dispatchEvent(fakeMouseDown);

    const hint = hints[0];
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.textContent).toEqual('Jan');
    thumbLeft.dispatchEvent(fakeMouseUp);
  });

  it('При нажатии на правом кругляше отображается подсказка', () => {
    new Slider({ ...options, thumbRightValue: 10 });

    const thumbRight = thumbs[1];
    if (!(thumbRight instanceof HTMLDivElement)) throw new Error();
    thumbRight.dispatchEvent(fakeMouseDown);

    const hint = hints[1] ? hints[1] : hints[0];
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.textContent).toEqual('Nov');
    thumbRight.dispatchEvent(fakeMouseUp);
  });

  it('При движении значение подсказки меняется', () => {
    new Slider(options);
    const thumbLeft = thumbs[0];
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();

    const thumbRight = thumbs[1];
    if (!(thumbRight instanceof HTMLDivElement)) throw new Error();

    thumbLeft.dispatchEvent(fakeMouseDown);

    const hintLeft = hints[0];
    if (!(hintLeft instanceof HTMLDivElement)) throw new Error();

    const sliderDiv = sliderCollection[0];
    const scaleWidth = sliderDiv.clientWidth - thumbLeft.offsetWidth;

    thumbLeft.dispatchEvent(fakeMouseMove(scaleWidth / 2.01));
    expect(hintLeft.textContent).toEqual('Jun');
    thumbLeft.dispatchEvent(fakeMouseUp);

    thumbRight.dispatchEvent(fakeMouseDown);

    const hintRight = hints[1] ? hints[1] : hints[0];
    if (!(hintRight instanceof HTMLDivElement)) throw new Error();

    thumbLeft.dispatchEvent(fakeMouseMove(-scaleWidth / 4));
    expect(hintRight.textContent).toEqual('Sep');
    thumbLeft.dispatchEvent(fakeMouseUp);
  });
});

describe('Меняет значения шкалы в соответствии с моделью и видом\n', () => {
  const options = {
    range: true,
    selector: '.divIntergationSpec',
    className: 'slider',
    showScale: true,
    min: 20,
    max: 200,
    precision: 1,
  };

  afterEach(() => {
    div.innerHTML = '';
  });

  it('Масштабирует значения шкалы при первоначальной инициализации\n', () => {
    new Slider(options);

    expect(anchors[0].textContent).toEqual('20');
    expect(anchors[1].textContent).toEqual('110');
    expect(anchors[2].textContent).toEqual('200');
  });

  it('Реагирует на изменение свойства "min" модели', () => {
    const slider = new Slider(options);

    slider.setOptions({ min: 0 });
    expect(anchors[0].textContent).toEqual('0');
    expect(anchors[1].textContent).toEqual('100');
    expect(anchors[2].textContent).toEqual('200');

    slider.setOptions({ min: 0.5 });
    expect(anchors[0].textContent).toEqual('0.5');
  });

  it(`При изменении свойства "min" или "max" модели, бегунок
      бежит к своему старому местоположению`, () => {
    const slider = new Slider(options);

    slider.setOptions({
      min: 0,
      max: 100,
      range: true,
      hintAlwaysShow: true,
      thumbLeftValue: 50,
      thumbRightValue: 80,
    });

    slider.setOptions({ min: 50 });
    const thumbLeft = thumbs[0];
    expect(getComputedStyle(thumbLeft).left).toEqual('0px');

    const thumbRight = thumbs[1];
    slider.setOptions({ max: 80 });

    const scale = div.getElementsByClassName('slider__scale')[0];

    // Здесь надо быть осторожным, т.к. clientWidth, offsetWidth возвращают
    // целочисленные значения
    const scaleWidth = scale.clientWidth - thumbLeft.getBoundingClientRect().width;
    expect(getComputedStyle(thumbRight).left).toEqual(`${scaleWidth}px`);
  });

  it('Реагирует на изменение свойства "max" модели', () => {
    const slider = new Slider({ ...options, ...{ min: 0 } });

    slider.setOptions({ max: 1000 });
    expect(anchors[0].textContent).toEqual('0');
    expect(anchors[1].textContent).toEqual('500');
    expect(anchors[2].textContent).toEqual('1000');
  });

  it('Реагирует на изменение свойства "step" модели', () => {
    const slider = new Slider({ ...options, ...{ min: 0, max: 1000 } });
    slider.setOptions({ step: 100 });
    expect(slider.getOptions().step).toEqual(100);
  });

  it('Реагирует на изменение свойства "thumbLeftValue" модели', () => {
    const slider = new Slider({ ...options, ...{ min: 0, max: 1000 } });
    const thumbLeft = thumbs[0];

    slider.setOptions({ thumbLeftValue: 100 });
    expect(slider.getOptions().thumbLeftValue).toEqual(100);

    thumbLeft.dispatchEvent(fakeMouseDown);

    const hintLeft = hints[0];
    if (!(hintLeft instanceof HTMLDivElement)) throw new Error();

    expect(hintLeft.textContent).toEqual('100');
    thumbLeft.dispatchEvent(fakeMouseUp);
    expect(hintLeft.offsetHeight).toEqual(0);
  });

  it('Реагирует на изменение свойства "thumbRightValue" модели', () => {
    const slider = new Slider({ ...options, ...{ min: 0, max: 1000 } });

    const thumbRight = thumbs[1];

    slider.setOptions({ thumbRightValue: 800 });
    expect(slider.getOptions().thumbRightValue).toEqual(800);

    thumbRight.dispatchEvent(fakeMouseDown);
    const hintRight = hints[1] ? hints[1] : hints[0];
    if (!(hintRight instanceof HTMLDivElement)) throw new Error();

    expect(thumbRight.textContent).toEqual('800');
    thumbRight.dispatchEvent(fakeMouseUp);
    expect(hintRight.offsetHeight).toEqual(0);
  });

  it('Реагирует на изменение свойства "range" модели', () => {
    const slider = new Slider(options);
    const stretcher = div.getElementsByClassName('slider__stretcher')[0];
    const style = getComputedStyle(stretcher);

    const thumbLeft = thumbs[0];
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();

    expect(parseFloat(style.left)).toEqual(thumbLeft.offsetWidth / 2);

    expect(parseFloat(style.right)).toEqual(thumbLeft.offsetWidth);
    slider.setOptions({ range: false, thumbLeftValue: 1000 });
    expect(style.left).toEqual('0px');
    expect(style.right).toEqual('16px');
  });

  it('Реагирует на изменение свойства "partsAmount" вида', () => {
    const slider = new Slider(options);

    slider.setOptions({ partsAmount: 3 });
    expect(anchors.length).toEqual(4);
    expect(anchors[0].textContent).toEqual('20');
    expect(anchors[1].textContent).toEqual('80');
    expect(anchors[2].textContent).toEqual('140');
    expect(anchors[3].textContent).toEqual('200');

    slider.setOptions({ partsAmount: 4 });
    expect(anchors[1].textContent).toEqual('66');
    expect(anchors[2].textContent).toEqual('110');
    expect(anchors[3].textContent).toEqual('156');

    slider.setOptions({ partsAmount: 2 });
    expect(anchors[0].textContent).toEqual('20');
    expect(anchors[1].textContent).toEqual('110');
    expect(anchors[2].textContent).toEqual('200');
  });
});

describe('Меняет состояние модели в соответствии с положением бегунков\n', () => {
  const options = {
    range: true,
    selector: '.divIntergationSpec',
    className: 'slider',
    showScale: true,
    partsAmount: 4,
    min: 0,
    max: 100,
  };

  afterEach(() => {
    div.innerHTML = '';
  });

  it('При движении левого бегунка меняется значение thumbLeftValue в модели', () => {
    const slider = new Slider(options);
    const thumbLeft = thumbs[0];

    anchors[1].dispatchEvent(fakeClick);
    thumbLeft.dispatchEvent(fakeMouseDown);
    expect(hints[0].textContent).toEqual('25');
    expect(slider.getOptions().thumbLeftValue).toEqual(25);
  });

  it('При движении правого бегунка меняется значение thumbRightValue в модели', () => {
    const slider = new Slider(options);
    const thumbRight = thumbs[1];

    anchors[3].dispatchEvent(fakeClick);
    thumbRight.dispatchEvent(fakeMouseDown);
    expect(hints[0].textContent).toEqual('75');
    expect(slider.getOptions().thumbRightValue).toEqual(75);
  });
});

describe('Проверка поведения подсказок при включенной опции "hintAlwaysShow"\n', () => {
  let slider: Slider;
  let thumbLeft: Element;
  let thumbRight: Element;

  const options = {
    range: true,
    selector: '.divIntergationSpec',
    className: 'slider',
    showScale: true,
    min: 0,
    max: 600,
    step: 1,
    hintAlwaysShow: true,
    thumbLeftValue: 360,
    thumbRightValue: 434,
  };

  beforeEach(() => {
    slider = new Slider(options);
    thumbLeft = thumbs[0];
    thumbRight = thumbs[1];
  });

  afterEach(() => {
    div.innerHTML = '';
  });

  it(`При движении подсказки правый бегунок исчезает,
    если бегунки находятся слишком близко`, () => {
    slider.setOptions({ thumbRightValue: 361 });
    let hintRight = hints[1];
    if (hintRight) throw new Error();

    slider.setOptions({ thumbRightValue: 600 });
    hintRight = hints[1];
    if (!(hintRight instanceof HTMLDivElement)) throw new Error();

    expect(hintRight.offsetWidth).toBeTruthy();

    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();

    const sliderDiv = sliderCollection[0];
    const scaleWidth = sliderDiv.clientWidth - thumbLeft.offsetWidth;

    thumbRight.dispatchEvent(fakeMouseDown);
    thumbRight.dispatchEvent(fakeMouseMove(-scaleWidth * 2));

    expect(hintRight.offsetWidth).toEqual(0);
    thumbRight.dispatchEvent(fakeMouseUp);
  });

  it(`При нажатии на правый бегунок, если подсказки накладываются друг на друга,
    он не должен появляться`, () => {
    slider.setOptions({ thumbRightValue: 361 });

    const hintRight = hints[1];
    if (hintRight) throw new Error();

    thumbRight.dispatchEvent(fakeMouseDown);
    thumbRight.dispatchEvent(fakeMouseUp);
  });

  it(`При щелчке на якоре, подсказка над правым бегунком должна исчезнуть, если в результате
  получилось наложение текстов подсказок`, () => {
    slider.setOptions({ thumbRightValue: 302, thumbLeftValue: 299 });
    anchors[1].dispatchEvent(fakeClick);
    const hintRight = hints[1];

    if ((hintRight instanceof HTMLDivElement)) throw new Error();
  });
});

describe('Данные баги более не возникают\n', () => {
  let thumbLeft: Element;
  let sliderDiv: Element;
  let scaleWidth: number;

  const options = {
    min: 0,
    max: 100,
    step: 1,
    selector: '.divIntergationSpec',
    angle: 0,
    range: true,
    hintAboveThumb: true,
    hintAlwaysShow: true,
  };

  let slider: Slider;

  beforeEach(() => {
    slider = new Slider({ ...options });
    thumbLeft = thumbs[0];

    sliderDiv = sliderCollection[0];

    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();
    scaleWidth = sliderDiv.clientWidth - thumbLeft.offsetWidth;
  });

  afterEach(() => {
    div.innerHTML = '';
  });

  it('При наложении бегунков значение подсказок разное', () => {
    slider.setOptions({ min: 0, thumbLeftValue: 0 });

    slider.setOptions({
      max: 6, step: 1, thumbRightValue: 1, min: 1,
    });

    const hintRight = hints[1];
    expect(hintRight).toBeFalsy();
  });

  it('При изменении шага, бегунки остаются в недопустимом положении', () => {
    slider.setOptions({
      min: 0, max: 11, step: 1, thumbLeftValue: 10, range: false,
    });

    const hintLeft = hints[0];
    expect(hintLeft.textContent).toEqual('10');
    slider.setOptions({ step: 11 });
    expect(hintLeft.textContent).toEqual('11');
  });

  it('Ошибка при перетаскивании бегунка к границам при слишком малом шаге', () => {
    slider.setOptions({
      min: 1000000, max: 6000000, step: 1, range: true,
    });
    slider.setOptions({ thumbRightValue: 5112367 });

    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();
    thumbLeft.dispatchEvent(fakeMouseDown);

    thumbLeft.dispatchEvent(fakeMouseMove(scaleWidth * 2));
    expect(slider.getOptions().thumbLeftValue).toEqual(5112367);

    const hintLeft = hints[0];
    expect(hintLeft.textContent).toEqual(String(5112367));
  });

  it('При изменении шага, бегунок можно перетащить за границы слайдера', () => {
    slider.setOptions({
      min: 0, max: 11, step: 4, range: false,
    });
    thumbLeft.dispatchEvent(fakeMouseDown);

    const hintLeft = hints[0];
    thumbLeft.dispatchEvent(fakeMouseMove(scaleWidth * 2));
    expect(hintLeft.textContent).toEqual('8');
    thumbLeft.dispatchEvent(fakeMouseUp);
  });

  it('При некоторой ширине блока, бегунки не могут слиться', () => {
    div.style.width = '421.33px';

    slider.setOptions({ min: 0, max: 58, thumbRightValue: 41 });

    thumbLeft.dispatchEvent(fakeMouseDown);
    thumbLeft.dispatchEvent(fakeMouseMove(scaleWidth * 2));
    thumbLeft.dispatchEvent(fakeMouseUp);

    const thumbRight = thumbs[1];
    expect(thumbLeft.getBoundingClientRect().left).toEqual(thumbRight.getBoundingClientRect().left);
    div.style.width = '';
  });

  it(`При выключении и включении опции "range" правый бегунок может достичь
    некратных шагу значений`, () => {
    slider.setOptions({
      min: 1, max: 6, step: 4, range: false,
    });

    slider.setOptions({ range: true });
    expect(slider.getOptions().thumbRightValue).toEqual(5);
  });

  it('Так и не придумал, что написать в названии теста.. ', () => {
    slider.setOptions({
      min: 0,
      max: 6,
      thumbLeftValue: 0,
      thumbRightValue: 0,
      range: true,
      step: 1,
    });

    slider.setOptions({ partsAmount: 3 });
    slider.setOptions({ step: 4 });

    const thumbRight = thumbs[1];
    thumbRight.dispatchEvent(fakeMouseDown);
    thumbRight.dispatchEvent(fakeMouseMove(scaleWidth * 2));

    const hintRight = hints[1] ? hints[1] : hints[0];
    expect(hintRight.textContent).toEqual('4');
  });
});
