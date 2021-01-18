/* eslint-disable prefer-destructuring */
/* eslint-disable no-new */
import { Presenter } from '../src/assets/blocks/slider/components/presenter/presenter';
import '../src/assets/blocks/slider/slider.scss';

const div = document.createElement('div');
// Должен быть уникальный класс для каждого спека.
div.classList.add('divPresenterSpec');
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

describe('Первоначальная минимальная реализация', () => {
  const selector = '.divPresenterSpec';

  afterEach(() => {
    div.innerHTML = '';
  });

  it(`Если аргументов для инициализации не достаточно,
    выкидывает ошибку`, () => {
    expect(() => {
      new Presenter({ min: 0, max: 100 });
    }).toThrowError();
    expect(() => {
      new Presenter({ min: 0, max: 100, selector });
    }).not.toThrowError();
    expect(() => {
      new Presenter({ selector });
    }).not.toThrowError();
    expect(() => {
      new Presenter({ boo: 0, foo: 100 });
    }).toThrowError();
  });

  it(`Если аргументы не тех типов (кроме типа number),
      которые принимают модель или вью, при инициализации вывалит ошибку`, () => {
    expect(() => { new Presenter('3'); }).toThrowError();
    expect(() => {
      new Presenter({
        className: 1, selector, min: 0, max: 100,
      });
    }).toThrowError();
    expect(() => {
      new Presenter({
        range: 1, selector, min: 0, max: 100,
      });
    }).toThrowError();
    expect(() => {
      new Presenter({
        hintAboveThumb: 1, selector, min: 0, max: 100,
      });
    }).toThrowError();
    expect(() => {
      new Presenter({
        hintAlwaysShow: 1, selector, min: 0, max: 100,
      });
    }).toThrowError();
    expect(() => {
      new Presenter({
        showScale: 1, selector, min: 0, max: 100,
      });
    }).toThrowError();
    expect(() => {
      new Presenter({
        alternativeRange: 1, selector, min: 0, max: 100,
      });
    }).toThrowError();
  });

  it(`Если аргументы не тех типов (кроме типа number),
      которые принимают модель или вью, при присваивании вывалит ошибку`, () => {
    const presenter = new Presenter({
      min: 0,
      max: 100,
      step: 1,
      thumbLeftValue: 10,
      selector,
      thumbRightValue: 80,
      angle: 90,
      range: true,
      precision: 0,
    });

    expect(() => {
      presenter.setOptions({ className: 1 });
    }).toThrowError();
    expect(() => {
      presenter.setOptions({ range: 1 });
    }).toThrowError();
    expect(() => {
      presenter.setOptions({ hintAboveThumb: 1 });
    }).toThrowError();
    expect(() => {
      presenter.setOptions({ hintAlwaysShow: 1 });
    }).toThrowError();
    expect(() => {
      presenter.setOptions({ showScale: 1 });
    }).toThrowError();
    expect(() => {
      presenter.setOptions({ alternativeRange: [1, 2, 3] });
    }).toThrowError();
    expect(() => {
      presenter.setOptions({ aternativeRange: ['1', '2', '3'] });
    }).toThrowError();
  });

  it('Допустимо задавать свойства в виде строки, которая правильно преобразуется в число', () => {
    const presenter = new Presenter({
      min: '0',
      max: '100',
      step: 1,
      thumbLeftValue: 10,
      selector,
      thumbRightValue: 80,
      angle: '89',
      range: true,
      precision: 0,
    });

    expect(presenter.getOptions().max).toEqual(100);
    expect(presenter.getOptions().min).toEqual(0);

    expect(() => presenter.setOptions({ min: '' })).not.toThrowError();

    expect(() => presenter.setOptions({ max: '110' })).not.toThrowError();
    expect(() => presenter.setOptions({ max: '110a' })).toThrowError();

    expect(() => presenter.setOptions({ min: '1' })).not.toThrowError();
    expect(() => presenter.setOptions({ min: '1a' })).toThrowError();

    expect(() => presenter.setOptions({ step: '11' })).not.toThrowError();
    expect(() => presenter.setOptions({ step: '11a' })).toThrowError();

    expect(() => presenter.setOptions({ thumbLeftValue: '11' })).not.toThrowError();
    expect(() => presenter.setOptions({ thumbLeftValue: '11a' })).toThrowError();

    expect(() => presenter.setOptions({ thumbRightValue: '90' })).not.toThrowError();
    expect(() => presenter.setOptions({ thumbRightValue: '90a' })).toThrowError();

    expect(() => presenter.setOptions({ precision: '1' })).not.toThrowError();
    expect(() => presenter.setOptions({ precision: '1a' })).toThrowError();

    expect(() => presenter.setOptions({ partsAmount: '1' })).not.toThrowError();
    expect(() => presenter.setOptions({ partsAmount: '1a' })).toThrowError();

    expect(() => presenter.setOptions({ angle: '90deg' })).toThrowError();
  });
});

describe('Меняет значения подсказки над бегунком, берет данные из модели\n', () => {
  const options = {
    range: true,
    selector: '.divPresenterSpec',
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
    new Presenter(options);
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
    new Presenter({ ...options, thumbRightValue: 70 });
    const thumbRight = thumbs[1];
    if (!(thumbRight instanceof HTMLDivElement)) throw new Error();

    thumbRight.dispatchEvent(fakeMouseDown);

    const hint = hints[1] ? hints[1] : hints[0];
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.textContent).toEqual('70');
    thumbRight.dispatchEvent(fakeMouseUp);
  });

  it('При движении значение подсказки меняется', () => {
    new Presenter(options);
    const thumbLeft = thumbs[0];
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();

    const thumbRight = document.querySelector('[class*=right]');
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
    selector: '.divPresenterSpec',
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
    new Presenter(options);
    const thumbLeft = thumbs[0];
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();
    thumbLeft.dispatchEvent(fakeMouseDown);

    const hint = hints[0];
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.textContent).toEqual('Jan');
    thumbLeft.dispatchEvent(fakeMouseUp);
  });

  it('При нажатии на правом кругляше отображается подсказка', () => {
    new Presenter({ ...options, thumbRightValue: 10 });

    const thumbRight = thumbs[1];
    if (!(thumbRight instanceof HTMLDivElement)) throw new Error();
    thumbRight.dispatchEvent(fakeMouseDown);

    const hint = hints[1] ? hints[1] : hints[0];
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.textContent).toEqual('Nov');
    thumbRight.dispatchEvent(fakeMouseUp);
  });

  it('При движении значение подсказки меняется', () => {
    new Presenter(options);
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
    selector: '.divPresenterSpec',
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
    new Presenter(options);

    expect(anchors[0].textContent).toEqual('20');
    expect(anchors[1].textContent).toEqual('110');
    expect(anchors[2].textContent).toEqual('200');
  });

  it('Реагирует на изменение свойства "min" модели', () => {
    const presenter = new Presenter(options);

    presenter.setOptions({ min: 0 });
    expect(anchors[0].textContent).toEqual('0');
    expect(anchors[1].textContent).toEqual('100');
    expect(anchors[2].textContent).toEqual('200');

    presenter.setOptions({ min: 0.5 });
    expect(anchors[0].textContent).toEqual('0.5');
  });

  it(`При изменении свойства "min" или "max" модели, бегунок
      бежит к своему старому местоположению`, () => {
    const presenter = new Presenter(options);

    presenter.setOptions({
      min: 0,
      max: 100,
      range: true,
      hintAlwaysShow: true,
      thumbLeftValue: 50,
      thumbRightValue: 80,
    });

    presenter.setOptions({ min: 50 });
    const thumbLeft = thumbs[0];
    expect(getComputedStyle(thumbLeft).left).toEqual('0px');

    const thumbRight = thumbs[1];
    presenter.setOptions({ max: 80 });

    const scale = div.getElementsByClassName('slider__scale')[0];

    // Здесь надо быть осторожным, т.к. clientWidth, offsetWidth возвращают
    // целочисленные значения
    const scaleWidth = scale.clientWidth - thumbLeft.getBoundingClientRect().width;
    expect(getComputedStyle(thumbRight).left).toEqual(`${scaleWidth}px`);
  });

  it('Реагирует на изменение свойства "max" модели', () => {
    const presenter = new Presenter({ ...options, ...{ min: 0 } });

    presenter.setOptions({ max: 1000 });
    expect(anchors[0].textContent).toEqual('0');
    expect(anchors[1].textContent).toEqual('500');
    expect(anchors[2].textContent).toEqual('1000');
  });

  it('Реагирует на изменение свойства "step" модели', () => {
    const presenter = new Presenter({ ...options, ...{ min: 0, max: 1000 } });
    presenter.setOptions({ step: 100 });
    expect(presenter.getOptions().step).toEqual(100);
  });

  it('Реагирует на изменение свойства "thumbLeftValue" модели', () => {
    const presenter = new Presenter({ ...options, ...{ min: 0, max: 1000 } });
    const thumbLeft = thumbs[0];

    presenter.setOptions({ thumbLeftValue: 100 });
    expect(presenter.getOptions().thumbLeftValue).toEqual(100);

    thumbLeft.dispatchEvent(fakeMouseDown);

    const hintLeft = hints[0];
    if (!(hintLeft instanceof HTMLDivElement)) throw new Error();

    expect(hintLeft.textContent).toEqual('100');
    thumbLeft.dispatchEvent(fakeMouseUp);
    expect(hintLeft.offsetHeight).toEqual(0);
  });

  it('Реагирует на изменение свойства "thumbRightValue" модели', () => {
    const presenter = new Presenter({ ...options, ...{ min: 0, max: 1000 } });

    const thumbRight = thumbs[1];

    presenter.setOptions({ thumbRightValue: 800 });
    expect(presenter.getOptions().thumbRightValue).toEqual(800);

    thumbRight.dispatchEvent(fakeMouseDown);
    const hintRight = hints[1] ? hints[1] : hints[0];
    if (!(hintRight instanceof HTMLDivElement)) throw new Error();

    expect(thumbRight.textContent).toEqual('800');
    thumbRight.dispatchEvent(fakeMouseUp);
    expect(hintRight.offsetHeight).toEqual(0);
  });

  it('Реагирует на изменение свойства "range" модели', () => {
    const presenter = new Presenter(options);
    const stretcher = div.getElementsByClassName('slider__stretcher')[0];
    const style = getComputedStyle(stretcher);

    const thumbLeft = thumbs[0];
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();

    expect(parseFloat(style.left)).toEqual(thumbLeft.offsetWidth / 2);

    expect(parseFloat(style.right)).toEqual(thumbLeft.offsetWidth);
    presenter.setOptions({ range: false, thumbLeftValue: 1000 });
    expect(style.left).toEqual('0px');
    expect(style.right).toEqual('16px');
  });

  it('Реагирует на изменение свойства "partsAmount" вида', () => {
    const presenter = new Presenter(options);

    presenter.setOptions({ partsAmount: 3 });
    expect(anchors.length).toEqual(4);
    expect(anchors[0].textContent).toEqual('20');
    expect(anchors[1].textContent).toEqual('80');
    expect(anchors[2].textContent).toEqual('140');
    expect(anchors[3].textContent).toEqual('200');

    presenter.setOptions({ partsAmount: 4 });
    expect(anchors[1].textContent).toEqual('66');
    expect(anchors[2].textContent).toEqual('110');
    expect(anchors[3].textContent).toEqual('156');

    presenter.setOptions({ partsAmount: 2 });
    expect(anchors[0].textContent).toEqual('20');
    expect(anchors[1].textContent).toEqual('110');
    expect(anchors[2].textContent).toEqual('200');
  });
});

describe('Меняет состояние модели в соответствии с положением бегунков\n', () => {
  const options = {
    range: true,
    selector: '.divPresenterSpec',
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
    const presenter = new Presenter(options);
    const thumbLeft = thumbs[0];

    anchors[1].dispatchEvent(fakeClick);
    thumbLeft.dispatchEvent(fakeMouseDown);
    expect(hints[0].textContent).toEqual('25');
    expect(presenter.getOptions().thumbLeftValue).toEqual(25);
  });

  it('При движении правого бегунка меняется значение thumbRightValue в модели', () => {
    const presenter = new Presenter(options);
    const thumbRight = thumbs[1];

    anchors[3].dispatchEvent(fakeClick);
    thumbRight.dispatchEvent(fakeMouseDown);
    expect(hints[0].textContent).toEqual('75');
    expect(presenter.getOptions().thumbRightValue).toEqual(75);
  });
});

describe('В любой момент времени можно узнать и задать нужные свойства\n', () => {
  afterEach(() => {
    div.innerHTML = '';
  });

  const options = {
    range: true,
    selector: '.divPresenterSpec',
    className: 'slider',
    showScale: true,
    min: 20,
    max: 200,
  };

  it('Узнаём свойства слайдера', () => {
    const presenter = new Presenter(options);
    const opts = presenter.getOptions();

    expect(opts.angle).toEqual(0);
    expect(opts.hintAboveThumb).toBeTrue();
    expect(opts.min).toEqual(20);
    expect(opts.max).toEqual(200);
    expect(opts.partsAmount).toEqual(2);
    expect(opts.range).toBeTrue();
    expect(opts.showScale).toBeTrue();
    expect(opts.thumbLeftValue).toEqual(20);
    expect(opts.thumbRightValue).toEqual(200);
    expect(opts.step).toEqual(2);
  });

  it('Можем узнать относительные смещения бегунков (метод getOffset)', () => {
    const presenter = new Presenter(options);
    const offsets = presenter.getOffsets();

    expect(offsets.left).toEqual(0);
    expect(offsets.right).toEqual(1);

    presenter.setOptions({ thumbLeftValue: 40, min: 0 });
    expect(presenter.getOffsets().left).toEqual(0.2);

    presenter.setOptions({ thumbRightValue: 160, min: 0 });
    expect(presenter.getOffsets().right).toEqual(0.8);
  });

  it('Задаем свойства слайдера', () => {
    const presenter = new Presenter(options);
    presenter.setOptions({
      range: false,
      showScale: false,
      min: 0,
      max: 100,
      step: 10,
      angle: 45,
      thumbLeftValue: 50,
    });

    const opts = presenter.getOptions();
    expect(opts.range).toEqual(false);
    expect(opts.showScale).toEqual(false);
    expect(opts.min).toEqual(0);
    expect(opts.max).toEqual(100);
    expect(opts.step).toEqual(10);
    expect(opts.thumbLeftValue).toEqual(50);
    expect(opts.angle).toEqual(45);

    div.style.marginTop = '70px';
  });
});

describe('Проверка поведения подсказки над бегунком\n', () => {
  afterEach(() => {
    div.innerHTML = '';
  });

  const options = {
    range: true,
    selector: '.divPresenterSpec',
    className: 'slider',
    showScale: true,
    min: 20,
    max: 200,
    thumbLeftValue: 25,
  };

  it(`При включенной опции "hintAlwaysShow" и при клике на значении шкалы,
  значение подсказки над бегунком меняется`, () => {
    const presenter = new Presenter({ ...options, hintAlwaysShow: true, step: 1 });

    const thumbLeft = thumbs[0];
    expect(hints[0].textContent).toEqual('25');

    thumbLeft.dispatchEvent(fakeMouseDown);
    expect(hints[0].textContent).toEqual('25');
    expect(hints[1].textContent).toEqual('200');
    thumbLeft.dispatchEvent(fakeMouseUp);

    presenter.setOptions({ thumbLeftValue: 50 });
    anchors[1].dispatchEvent(fakeClick);
    expect(hints[0].textContent).toEqual('110');
  });

  it('При нажатии на сам слайдер, значение подсказки над бегунком также меняется', () => {
    const presenter = new Presenter({
      ...options,
      min: 0,
      max: 100,
      hintAlwaysShow: true,
      thumbLeftValue: 0,
    });

    presenter.setOptions({ range: false });

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

describe('Проверка поведения подсказок при включенной опции "hintAlwaysShow"\n', () => {
  let presenter: Presenter;
  let thumbLeft: Element;
  let thumbRight: Element;

  const options = {
    range: true,
    selector: '.divPresenterSpec',
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
    presenter = new Presenter(options);
    thumbLeft = thumbs[0];
    thumbRight = thumbs[1];
  });

  afterEach(() => {
    div.innerHTML = '';
  });

  it(`При движении подсказки правый бегунок исчезает,
    если бегунки находятся слишком близко`, () => {
    presenter.setOptions({ thumbRightValue: 361 });
    let hintRight = hints[1];
    if (hintRight) throw new Error();

    presenter.setOptions({ thumbRightValue: 600 });
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
    presenter.setOptions({ thumbRightValue: 361 });

    const hintRight = hints[1];
    if (hintRight) throw new Error();

    thumbRight.dispatchEvent(fakeMouseDown);
    thumbRight.dispatchEvent(fakeMouseUp);
  });

  it(`При щелчке на якоре, подсказка над правым бегунком должна исчезнуть, если в результате
  получилось наложение текстов подсказок`, () => {
    presenter.setOptions({ thumbRightValue: 302, thumbLeftValue: 299 });
    anchors[1].dispatchEvent(fakeClick);
    const hintRight = hints[1];

    if ((hintRight instanceof HTMLDivElement)) throw new Error();
  });
});

describe('Проверка опции "onChange\n', () => {
  afterEach(() => {
    div.innerHTML = '';
  });

  const options = {
    range: true,
    selector: '.divPresenterSpec',
    className: 'slider',
    showScale: true,
    min: 0,
    max: 200,
  };

  it('Любой элемент можно подписать на изменение нашего слайдера', () => {
    const presenter = new Presenter(options);
    let num = 3;

    const miniObserver = presenter.onChange({});
    miniObserver.update = () => { num = presenter.getOptions().thumbLeftValue; };

    presenter.setOptions({ thumbLeftValue: 10 });
    expect(num).toEqual(10);

    anchors[1].dispatchEvent(fakeClick);
    expect(num).toEqual(100);
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
    selector: '.divPresenterSpec',
    angle: 0,
    range: true,
    hintAboveThumb: true,
    hintAlwaysShow: true,
  };

  let presenter: Presenter;

  beforeEach(() => {
    presenter = new Presenter({ ...options });
    thumbLeft = thumbs[0];

    sliderDiv = sliderCollection[0];

    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();
    scaleWidth = sliderDiv.clientWidth - thumbLeft.offsetWidth;
  });

  afterEach(() => {
    div.innerHTML = '';
  });

  it('При наложении бегунков значение подсказок разное', () => {
    presenter.setOptions({ min: 0, thumbLeftValue: 0 });

    presenter.setOptions({
      max: 6, step: 1, thumbRightValue: 1, min: 1,
    });

    const hintRight = hints[1];
    expect(hintRight).toBeFalsy();
  });

  it('При изменении шага, бегунки остаются в недопустимом положении', () => {
    presenter.setOptions({
      min: 0, max: 11, step: 1, thumbLeftValue: 10, range: false,
    });

    const hintLeft = hints[0];
    expect(hintLeft.textContent).toEqual('10');
    presenter.setOptions({ step: 11 });
    expect(hintLeft.textContent).toEqual('11');
  });

  it('Ошибка при перетаскивании бегунка к границам при слишком малом шаге', () => {
    presenter.setOptions({
      min: 1000000, max: 6000000, step: 1, range: true,
    });
    presenter.setOptions({ thumbRightValue: 5112367 });

    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();
    thumbLeft.dispatchEvent(fakeMouseDown);

    thumbLeft.dispatchEvent(fakeMouseMove(scaleWidth * 2));
    expect(presenter.getOptions().thumbLeftValue).toEqual(5112367);

    const hintLeft = hints[0];
    expect(hintLeft.textContent).toEqual(String(5112367));
  });

  it('При изменении шага, бегунок можно перетащить за границы слайдера', () => {
    presenter.setOptions({
      min: 0, max: 11, step: 4, range: false,
    });
    thumbLeft.dispatchEvent(fakeMouseDown);

    const hintLeft = hints[0];
    thumbLeft.dispatchEvent(fakeMouseMove(scaleWidth * 2));
    expect(hintLeft.textContent).toEqual('8');
    thumbLeft.dispatchEvent(fakeMouseUp);
  });

  it('При некоторой ширине блока, бегунки не могут слиться', () => {
    // div.innerHTML = '';
    div.style.width = '421.33px';

    // presenter = new Presenter({ ...options });
    presenter.setOptions({ min: 0, max: 58, thumbRightValue: 41 });

    // el = div.getElementsByClassName('slider__thumb_side_right')[0];
    // if (!(el instanceof HTMLDivElement)) throw new Error();
    // thumbRight = el;

    thumbLeft.dispatchEvent(fakeMouseDown);
    thumbLeft.dispatchEvent(fakeMouseMove(scaleWidth * 2));
    thumbLeft.dispatchEvent(fakeMouseUp);

    const thumbRight = thumbs[1];
    expect(thumbLeft.getBoundingClientRect().left).toEqual(thumbRight.getBoundingClientRect().left);
    div.style.width = '';
  });

  it(`При выключении и включении опции "range" правый бегунок может достичь
    некратных шагу значений`, () => {
    presenter.setOptions({
      min: 1, max: 6, step: 4, range: false,
    });

    presenter.setOptions({ range: true });
    expect(presenter.getOptions().thumbRightValue).toEqual(5);
  });

  it('Так и не придумал, что написать в названии теста.. ', () => {
    presenter.setOptions({
      min: 0,
      max: 6,
      thumbLeftValue: 0,
      thumbRightValue: 0,
      range: true,
      step: 1,
    });

    presenter.setOptions({ partsAmount: 3 });
    presenter.setOptions({ step: 4 });

    const thumbRight = thumbs[1];
    thumbRight.dispatchEvent(fakeMouseDown);
    thumbRight.dispatchEvent(fakeMouseMove(scaleWidth * 2));

    const hintRight = hints[1] ? hints[1] : hints[0];
    expect(hintRight.textContent).toEqual('4');
  });
});
