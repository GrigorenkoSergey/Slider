/* eslint-disable prefer-destructuring */
/* eslint-disable no-new */
/* eslint-disable no-use-before-define */
import View from '../src/assets/blocks/slider/components/view/view';
import '../src/assets/blocks/slider/slider.scss';

function moveThumb(thumb: HTMLDivElement,
  deltaXPx: number, deltaYPx: number = 0): void {
  const startX = Math.abs(deltaXPx);
  const startY = Math.abs(deltaYPx);

  const fakeMouseDown = new MouseEvent('mousedown',
    {
      bubbles: true, cancelable: true, clientX: startX, clientY: startY,
    });

  const fakeMouseMove = new MouseEvent('mousemove',
    {
      bubbles: true,
      cancelable: true,
      clientX: startX + deltaXPx,
      clientY: startY + deltaYPx,
    });

  const fakeMouseUp = new MouseEvent('mouseup',
    { bubbles: true, cancelable: true });

  thumb.dispatchEvent(fakeMouseDown);
  thumb.dispatchEvent(fakeMouseMove);
  thumb.dispatchEvent(fakeMouseUp);
}

const body = document.getElementsByTagName('body')[0];
body.style.width = `${document.documentElement.clientWidth * 0.9}px`;

const div = document.createElement('div');
// Должен быть уникальный класс для каждого спека.
div.classList.add('divViewSpec');
div.style.marginTop = '70px';
document.body.append(div);

const fakeMouseUp = new MouseEvent('mouseup',
  { bubbles: true, cancelable: true });

const thumbs = div.getElementsByClassName('slider__thumb');
const sliderCollection = div.getElementsByClassName('slider');
const anchors = div.getElementsByClassName('slider__scale-points');
const hints = div.getElementsByClassName('slider__hint');

describe('Первоначальная минимальная инициализация\n', () => {
  let view: View;

  afterEach(() => {
    div.innerHTML = '';
  });

  it(`Можно инициализировать с минимальным количеством аргументов
    (selector), иначе будет ошибка`, () => {
    expect(() => {
      new View({});
    }).toThrowError();
  });

  it(`В любой момент времени можно получить значения 
  всех публичных свойств`, () => {
    view = new View({ selector: '.divViewSpec' });
    const options = view.getOptions();
    expect(options.selector).toEqual('.divViewSpec');
    expect(options.angle).toEqual(0);
    expect(options.showScale).toBeTrue();
  });

  it(`Если неправильно заданы некоторые опции,
      вывалит ошибку`, () => {
    view = new View({
      selector: '.divViewSpec',
    });

    expect(() => {
      view.setOptions({ angle: -10 });
    }).toThrowError();
    expect(() => {
      view.setOptions({ angle: 180 });
    }).toThrowError();
  });
});

describe('Позволяет пользователю взаимодействовать с бегунком\n', () => {
  let view: View;

  let sliderDiv: Element;
  let thumbLeft: Element;

  beforeEach(() => {
    view = new View({ selector: '.divViewSpec' });
    thumbLeft = thumbs[0];
    sliderDiv = sliderCollection[0];
  });

  afterEach(() => {
    div.innerHTML = '';
  });

  it('Можно двигать левый бегунок мышкой', () => {
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();
    const scaleWidth = sliderDiv.clientWidth - thumbLeft.offsetWidth;

    const { step } = view.getOptions();
    const deltaPx = scaleWidth / 8;
    const pixelStep = step * scaleWidth;

    // Бежим к концу, но не до самого конца,
    // т.к. из-зa погрешности округления
    // мы можем достичь его раньше, чем надеялись

    for (let i = 1; i < 8; i += 1) {
      const startLeft = thumbLeft.getBoundingClientRect().left;
      moveThumb(thumbLeft, deltaPx);
      const deltaInFact = thumbLeft.getBoundingClientRect().left - startLeft;
      expect(Math.abs(deltaInFact - deltaPx)).toBeLessThanOrEqual(pixelStep);
    }
  });

  it('Можно двигать правый бегунок мышкой', () => {
    view.setOptions({ range: true });

    const thumbRight = thumbs[1];
    if (!(thumbRight instanceof HTMLDivElement)) throw new Error();

    const scaleWidth = sliderDiv.clientWidth - thumbRight.offsetWidth;

    const { step } = view.getOptions();

    // бежим к началу
    const deltaPx = -scaleWidth / 8;
    const pixelStep = step * scaleWidth;

    for (let i = 7; i > 1; i -= 1) {
      // определим начальное положение бегунка
      const startLeft = thumbRight.getBoundingClientRect().left;
      moveThumb(thumbRight, deltaPx);
      const deltaInFact = thumbRight.getBoundingClientRect().left - startLeft;
      expect(Math.abs(deltaInFact - deltaPx)).toBeLessThanOrEqual(pixelStep);
    }
  });

  it('Бегунки не могут выходить за пределы блока', () => {
    view.setOptions({ range: true });
    const thumbRight = thumbs[1];

    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();
    if (!(thumbRight instanceof HTMLDivElement)) throw new Error();

    const scaleWidth = sliderDiv.clientWidth - thumbRight.offsetWidth;

    let startTop: number;

    startTop = thumbRight.getBoundingClientRect().top;
    moveThumb(thumbRight, -scaleWidth * 100, 1000);
    expect(parseFloat(getComputedStyle(thumbRight).left))
      .toBeGreaterThanOrEqual(0);
    expect(thumbRight.getBoundingClientRect().top).toEqual(startTop);

    startTop = thumbRight.getBoundingClientRect().top;
    moveThumb(thumbRight, scaleWidth * 100, -50000);
    expect(parseFloat(getComputedStyle(thumbRight).left))
      .toBeLessThanOrEqual(scaleWidth);
    expect(thumbRight.getBoundingClientRect().top).toEqual(startTop);

    startTop = thumbLeft.getBoundingClientRect().top;
    moveThumb(thumbLeft, -scaleWidth * 100, 1000);
    expect(parseFloat(getComputedStyle(thumbLeft).left))
      .toBeGreaterThanOrEqual(0);
    expect(thumbLeft.getBoundingClientRect().top).toEqual(startTop);

    startTop = thumbLeft.getBoundingClientRect().top;
    moveThumb(thumbLeft, scaleWidth * 100, -50000);
    expect(parseFloat(getComputedStyle(thumbLeft).left))
      .toBeLessThanOrEqual(scaleWidth);
    expect(thumbLeft.getBoundingClientRect().top).toEqual(startTop);
  });

  it('Слайдер может работать в вертикальном положении', () => {
    view.setOptions({ range: true, angle: 90 });
    const thumbRight = thumbs[1];

    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();
    if (!(thumbRight instanceof HTMLDivElement)) throw new Error();

    const scaleWidth = sliderDiv.clientWidth - thumbRight.offsetWidth;

    const highLimit = thumbLeft.getBoundingClientRect().top;
    const lowLimit = thumbRight.getBoundingClientRect().top;
    const leftLimit = thumbLeft.getBoundingClientRect().left;
    const rightLimit = thumbLeft.getBoundingClientRect().right;

    // проверим поведение верхнего бегунка (левого)
    let startTop = highLimit;
    moveThumb(thumbLeft, 1000, scaleWidth / 4);
    let pos = thumbLeft.getBoundingClientRect();
    expect(pos.left).toEqual(leftLimit);
    expect(pos.right).toEqual(rightLimit);
    expect(Math.round(pos.top - startTop))
      .toEqual(Math.round(parseFloat(getComputedStyle(thumbLeft).left)));

    // проверим поведение верхнего бегунка (левого)
    startTop = lowLimit;
    moveThumb(thumbRight, 1000, -scaleWidth / 4);
    pos = thumbRight.getBoundingClientRect();
    expect(pos.left).toEqual(leftLimit);
    expect(pos.right).toEqual(rightLimit);

    expect(Math.round(startTop - pos.top))
      .toEqual(Math.round(parseFloat(getComputedStyle(thumbLeft).left)));
  });

  it('Бегунки располагаются согласно шагу и могут совпадать', () => {
    view.setOptions({ angle: 0, step: 0.5, range: true });
    const thumbRight = thumbs[1];

    const { scale } = view;
    if (scale === null) throw new Error();

    const scaleWidth = scale.width;

    const fakeMouseDown = new MouseEvent('mousedown',
      {
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0,
      });

    const fakeMouseMove = new MouseEvent('mousemove',
      {
        bubbles: true,
        cancelable: true,
        clientX: (-scaleWidth * 7) / 8,
        clientY: 0,
      });

    thumbRight.dispatchEvent(fakeMouseDown);
    thumbRight.dispatchEvent(fakeMouseMove);
    const posthumbLeft = thumbLeft.getBoundingClientRect();
    const posthumbRight = thumbRight.getBoundingClientRect();
    thumbRight.dispatchEvent(fakeMouseUp);

    expect(posthumbLeft.left).toEqual(posthumbRight.left);
  });

  it('При клике на слайдере, бегунок бежит к точке клика', () => {
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();

    const slider = view.el;
    const thumbStartX = thumbLeft.getBoundingClientRect().left;

    let fakeMouseClick = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: thumbStartX + slider.clientWidth,
      clientY: 0,
    });

    slider.dispatchEvent(fakeMouseClick);

    expect(parseFloat(thumbLeft.style.left))
      .toEqual(slider.clientWidth - thumbLeft.offsetWidth);

    fakeMouseClick = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: -thumbStartX - slider.clientWidth,
      clientY: 0,
    });

    slider.dispatchEvent(fakeMouseClick);
    expect(parseFloat(thumbLeft.style.left))
      .toEqual(0);
  });
});

describe('Также присутствует интерактивная шкала\n', () => {
  let view: View;

  let thumbLeft: Element;
  let thumbRight: Element;

  afterEach(() => {
    div.innerHTML = '';
  });

  it('По умолчанию шкала отображает значения, кратные шагу и зависящие от свойства "partsAmount"', () => {
    const options = {
      range: true,
      selector: '.divViewSpec',
      className: 'slider',
      showScale: true,
      step: 0.75,
      partsAmount: 2,
    };

    view = new View(options);
    const { scale } = view;
    if (scale === null) {
      throw new Error();
    }

    expect(anchors[0].textContent).toEqual('0');
    expect(anchors[1].textContent).toEqual('0.75');
    expect(anchors[2].textContent).toEqual('1');

    view.setOptions({ step: 0.4, partsAmount: 2 });
    expect(anchors[1].textContent).toEqual('0.4');

    view.setOptions({ step: 0.32, partsAmount: 2 });
    expect(anchors[1].textContent).toEqual('0.64');

    view.setOptions({ step: 0.36, partsAmount: 2 });
    expect(anchors[1].textContent).toEqual('0.36');

    view.setOptions({ step: 0.36, partsAmount: 3 });
    expect(anchors[1].textContent).toEqual('0.36');
    expect(anchors[2].textContent).toEqual('0.72');

    view.setOptions({ step: 0.4, partsAmount: 3 });
    expect(anchors[1].textContent).toEqual('0.4');
    expect(anchors[2].textContent).toEqual('0.8');
  });

  it(`При щелчке на значении диапазона ближайший бегунок
      бежит к этому значению`, () => {
    const options = {
      range: true,
      selector: '.divViewSpec',
      className: 'slider',
      showScale: true,
      step: 1 / 10,
      partsAmount: 3,
    };

    view = new View(options);
    const { scale } = view;
    if (scale === null) throw new Error();

    const fakeMouseClick = new MouseEvent('click', {
      bubbles: true, cancelable: true,
    });

    thumbLeft = thumbs[0];
    if (!(thumbLeft instanceof HTMLDivElement)) throw new Error();

    thumbRight = thumbs[1];
    if (!(thumbRight instanceof HTMLDivElement)) throw new Error();

    for (let i = 3; i < 8; i += 1) {
      moveThumb(thumbRight, -scale.width / i);
      moveThumb(thumbLeft, scale.width / i);

      anchors[0].dispatchEvent(fakeMouseClick);
      expect(parseFloat(getComputedStyle(thumbLeft).left)).toEqual(0);

      anchors[3].dispatchEvent(fakeMouseClick);
      expect(parseFloat(getComputedStyle(thumbRight).left))
        .toEqual(scale.width);

      anchors[1].dispatchEvent(fakeMouseClick);
      let expectingLeft = Math.round(scale.parts[1] * scale.width);
      let currentLeft = Math.round(parseFloat(getComputedStyle(thumbLeft).left));
      expect(currentLeft).toEqual(expectingLeft);

      anchors[0].dispatchEvent(fakeMouseClick);

      anchors[2].dispatchEvent(fakeMouseClick);
      expectingLeft = Math.round(scale.parts[2] * scale.width);
      currentLeft = Math.round(parseFloat(getComputedStyle(thumbRight).left));
      expect(currentLeft).toEqual(expectingLeft);

      anchors[3].dispatchEvent(fakeMouseClick);
    }

    view.setOptions({ range: false });
    for (let i = 1; i < 8; i += 1) {
      moveThumb(thumbLeft, scale.width / i);
      anchors[0].dispatchEvent(fakeMouseClick);
      expect(parseFloat(getComputedStyle(thumbLeft).left)).toEqual(0);

      anchors[3].dispatchEvent(fakeMouseClick);
      expect(parseFloat(getComputedStyle(thumbLeft).left))
        .toEqual(scale.width);
      anchors[0].dispatchEvent(fakeMouseClick);
    }
  });

  it('Шкалу можно прятать', () => {
    const options = {
      range: true,
      selector: '.divViewSpec',
      className: 'slider',
      showScale: true,
      partsAmount: 1,
    };

    view = new View(options);
    const { scale } = view;
    if (scale === null) throw new Error();

    const labelLeft = anchors[0];
    if (!(labelLeft instanceof HTMLDivElement)) throw new Error();

    const labelRight = anchors[1];
    if (!(labelRight instanceof HTMLDivElement)) throw new Error();

    expect(labelLeft.offsetHeight).toBeTruthy();
    expect(labelRight.offsetHeight).toBeTruthy();

    view.setOptions({ showScale: false });
    expect(labelLeft.offsetHeight).toBeFalsy();
    expect(labelRight.offsetHeight).toBeFalsy();
  });

  it('Можно менять значения, отображаемые шкалой', () => {
    const options = {
      range: true,
      selector: '.divViewSpec',
      className: 'slider',
      showScale: true,
      partsAmount: 4,
    };

    view = new View(options);
    const { scale } = view;
    if (scale === null) throw new Error();

    let values: number[] | string[] = [50, 75, 100, 125, 150];

    scale.setAnchorValues(values);

    for (let i = 0; i < anchors.length; i += 1) {
      expect(anchors[i].textContent).toEqual(String(values[i]));
    }

    view.setOptions({ partsAmount: 1 });
    values = ['Jan', 'Dec'];
    scale.setAnchorValues(values);

    expect(anchors[0].textContent).toEqual('Jan');
    expect(anchors[1].textContent).toEqual('Dec');
  });

  it('Можно задавать значения, не зависящие от свойства partsAmount', () => {
    const options = {
      range: true,
      selector: '.divViewSpec',
      className: 'slider',
      showScale: true,
      partsAmount: 4,
    };

    view = new View(options);
    const { scale } = view;
    if (scale === null) throw new Error();

    expect(() => scale.setMilestones([1, 2, 3])).toThrowError();
    expect(() => scale.setMilestones([0, 2, 1])).toThrowError();
    expect(() => scale.setMilestones([0, 0.5, 2])).toThrowError();

    scale.setMilestones([0, 0.25, 0.7, 1]);

    expect(anchors[0].textContent).toEqual('0');
    expect(anchors[1].textContent).toEqual('0.25');
    expect(anchors[2].textContent).toEqual('0.7');
    expect(anchors[3].textContent).toEqual('1');
  });
});

describe('Может отображать подсказку\n', () => {
  let view: View;

  let sliderDiv: Element;
  let thumbLeft: Element;

  const options = {
    range: true,
    selector: '.divViewSpec',
    className: 'slider',
    showScale: true,
    partsAmount: 4,
  };

  const fakeMouseDown = new MouseEvent('mousedown',
    {
      bubbles: true, cancelable: true, clientX: 0, clientY: 0,
    });

  beforeEach(() => {
    view = new View(options);
  });

  afterEach(() => {
    div.innerHTML = '';
  });

  it('При нажатии на левом кругляше отображается подсказка', () => {
    thumbLeft = thumbs[0];
    thumbLeft.dispatchEvent(fakeMouseDown);

    const hint = hints[0];
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.textContent).toEqual('hint');
  });

  it('При нажатии на правом кругляше отображается подсказка', () => {
    const thumbRight = thumbs[1];
    thumbRight.dispatchEvent(fakeMouseDown);

    const hint = hints[0];
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.textContent).toEqual('hint');
  });

  it('Подсказку можно прятать', () => {
    view.setOptions({ hintAboveThumb: false });
    const thumb = view.thumbs.thumbLeft;

    thumb.dispatchEvent(fakeMouseDown);

    expect(hints.length).toEqual(0);

    sliderDiv = sliderCollection[0];
    const scaleWidth = sliderDiv.clientWidth - thumb.offsetWidth;
    const deltaPx = scaleWidth / 8;

    moveThumb(thumb, deltaPx);
    expect(hints.length).toEqual(0);
    thumb.dispatchEvent(fakeMouseUp);
  });

  it('Существует опция, при которой подсказка отображается всегда', () => {
    view = new View(options);
    view.setOptions({ hintAlwaysShow: true });

    const hintLeft = hints[0];
    if (!(hintLeft instanceof HTMLDivElement)) throw new Error();

    const hintRight = hints[1];
    if (!(hintRight instanceof HTMLDivElement)) throw new Error();

    expect(hintLeft.textContent).toEqual('hint');
    expect(hintRight.textContent).toEqual('hint');

    view.setOptions({ hintAlwaysShow: false });

    expect(hints[0]).toBeFalsy();
    expect(hints[1]).toBeFalsy();
  });
});
