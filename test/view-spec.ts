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
  let leftThumb: Element;

  beforeEach(() => {
    view = new View({ selector: '.divViewSpec' });
    leftThumb = thumbs[0];
    sliderDiv = sliderCollection[0];
  });

  afterEach(() => {
    div.innerHTML = '';
  });

  it('Можно двигать левый бегунок мышкой', () => {
    if (!(leftThumb instanceof HTMLDivElement)) throw new Error();
    const scaleWidth = sliderDiv.clientWidth - leftThumb.offsetWidth;

    const { step } = view.getOptions();
    const deltaPx = scaleWidth / 8;
    const pixelStep = step * scaleWidth;

    // Бежим к концу, но не до самого конца,
    // т.к. из-зa погрешности округления
    // мы можем достичь его раньше, чем надеялись

    for (let i = 1; i < 8; i += 1) {
      const startLeft = leftThumb.getBoundingClientRect().left;
      moveThumb(leftThumb, deltaPx);
      const deltaInFact = leftThumb.getBoundingClientRect().left - startLeft;
      expect(Math.abs(deltaInFact - deltaPx)).toBeLessThanOrEqual(pixelStep);
    }
  });

  it('Можно двигать правый бегунок мышкой', () => {
    view.setOptions({ range: true });

    const rightThumb = thumbs[1];
    if (!(rightThumb instanceof HTMLDivElement)) throw new Error();

    const scaleWidth = sliderDiv.clientWidth - rightThumb.offsetWidth;

    const { step } = view.getOptions();

    // бежим к началу
    const deltaPx = -scaleWidth / 8;
    const pixelStep = step * scaleWidth;

    for (let i = 7; i > 1; i -= 1) {
      // определим начальное положение бегунка
      const startLeft = rightThumb.getBoundingClientRect().left;
      moveThumb(rightThumb, deltaPx);
      const deltaInFact = rightThumb.getBoundingClientRect().left - startLeft;
      expect(Math.abs(deltaInFact - deltaPx)).toBeLessThanOrEqual(pixelStep);
    }
  });

  it('Бегунки не могут выходить за пределы блока', () => {
    view.setOptions({ range: true });
    const rightThumb = thumbs[1];

    if (!(leftThumb instanceof HTMLDivElement)) throw new Error();
    if (!(rightThumb instanceof HTMLDivElement)) throw new Error();

    const scaleWidth = sliderDiv.clientWidth - rightThumb.offsetWidth;

    let startTop: number;

    startTop = rightThumb.getBoundingClientRect().top;
    moveThumb(rightThumb, -scaleWidth * 100, 1000);
    expect(parseFloat(getComputedStyle(rightThumb).left))
      .toBeGreaterThanOrEqual(0);
    expect(rightThumb.getBoundingClientRect().top).toEqual(startTop);

    startTop = rightThumb.getBoundingClientRect().top;
    moveThumb(rightThumb, scaleWidth * 100, -50000);
    expect(parseFloat(getComputedStyle(rightThumb).left))
      .toBeLessThanOrEqual(scaleWidth);
    expect(rightThumb.getBoundingClientRect().top).toEqual(startTop);

    startTop = leftThumb.getBoundingClientRect().top;
    moveThumb(leftThumb, -scaleWidth * 100, 1000);
    expect(parseFloat(getComputedStyle(leftThumb).left))
      .toBeGreaterThanOrEqual(0);
    expect(leftThumb.getBoundingClientRect().top).toEqual(startTop);

    startTop = leftThumb.getBoundingClientRect().top;
    moveThumb(leftThumb, scaleWidth * 100, -50000);
    expect(parseFloat(getComputedStyle(leftThumb).left))
      .toBeLessThanOrEqual(scaleWidth);
    expect(leftThumb.getBoundingClientRect().top).toEqual(startTop);
  });

  it('Слайдер может работать в вертикальном положении', () => {
    view.setOptions({ range: true, angle: 90 });
    const rightThumb = thumbs[1];

    if (!(leftThumb instanceof HTMLDivElement)) throw new Error();
    if (!(rightThumb instanceof HTMLDivElement)) throw new Error();

    const scaleWidth = sliderDiv.clientWidth - rightThumb.offsetWidth;

    const highLimit = leftThumb.getBoundingClientRect().top;
    const lowLimit = rightThumb.getBoundingClientRect().top;
    const leftLimit = leftThumb.getBoundingClientRect().left;
    const rightLimit = leftThumb.getBoundingClientRect().right;

    // проверим поведение верхнего бегунка (левого)
    let startTop = highLimit;
    moveThumb(leftThumb, 1000, scaleWidth / 4);
    let pos = leftThumb.getBoundingClientRect();
    expect(pos.left).toEqual(leftLimit);
    expect(pos.right).toEqual(rightLimit);
    expect(Math.round(pos.top - startTop))
      .toEqual(Math.round(parseFloat(getComputedStyle(leftThumb).left)));

    // проверим поведение верхнего бегунка (левого)
    startTop = lowLimit;
    moveThumb(rightThumb, 1000, -scaleWidth / 4);
    pos = rightThumb.getBoundingClientRect();
    expect(pos.left).toEqual(leftLimit);
    expect(pos.right).toEqual(rightLimit);

    expect(Math.round(startTop - pos.top))
      .toEqual(Math.round(parseFloat(getComputedStyle(leftThumb).left)));
  });

  it('Бегунки располагаются согласно шагу и могут совпадать', () => {
    view.setOptions({ angle: 0, step: 0.5, range: true });
    const rightThumb = thumbs[1];

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

    rightThumb.dispatchEvent(fakeMouseDown);
    rightThumb.dispatchEvent(fakeMouseMove);
    const posLeftThumb = leftThumb.getBoundingClientRect();
    const posRightThumb = rightThumb.getBoundingClientRect();
    rightThumb.dispatchEvent(fakeMouseUp);

    expect(posLeftThumb.left).toEqual(posRightThumb.left);
  });

  it('При клике на слайдере, бегунок бежит к точке клика', () => {
    if (!(leftThumb instanceof HTMLDivElement)) throw new Error();

    const slider = view.el;
    const thumbStartX = leftThumb.getBoundingClientRect().left;

    let fakeMouseClick = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: thumbStartX + slider.clientWidth,
      clientY: 0,
    });

    slider.dispatchEvent(fakeMouseClick);

    expect(parseFloat(leftThumb.style.left))
      .toEqual(slider.clientWidth - leftThumb.offsetWidth);

    fakeMouseClick = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: -thumbStartX - slider.clientWidth,
      clientY: 0,
    });

    slider.dispatchEvent(fakeMouseClick);
    expect(parseFloat(leftThumb.style.left))
      .toEqual(0);
  });
});

describe('Также присутствует интерактивная шкала\n', () => {
  let view: View;

  let leftThumb: Element;
  let rightThumb: Element;

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

    leftThumb = thumbs[0];
    if (!(leftThumb instanceof HTMLDivElement)) throw new Error();

    rightThumb = thumbs[1];
    if (!(rightThumb instanceof HTMLDivElement)) throw new Error();

    for (let i = 3; i < 8; i += 1) {
      moveThumb(rightThumb, -scale.width / i);
      moveThumb(leftThumb, scale.width / i);

      anchors[0].dispatchEvent(fakeMouseClick);
      expect(parseFloat(getComputedStyle(leftThumb).left)).toEqual(0);

      anchors[3].dispatchEvent(fakeMouseClick);
      expect(parseFloat(getComputedStyle(rightThumb).left))
        .toEqual(scale.width);

      anchors[1].dispatchEvent(fakeMouseClick);
      let expectingLeft = Math.round(scale.parts[1] * scale.width);
      let currentLeft = Math.round(parseFloat(getComputedStyle(leftThumb).left));
      expect(currentLeft).toEqual(expectingLeft);

      anchors[0].dispatchEvent(fakeMouseClick);

      anchors[2].dispatchEvent(fakeMouseClick);
      expectingLeft = Math.round(scale.parts[2] * scale.width);
      currentLeft = Math.round(parseFloat(getComputedStyle(rightThumb).left));
      expect(currentLeft).toEqual(expectingLeft);

      anchors[3].dispatchEvent(fakeMouseClick);
    }

    view.setOptions({ range: false });
    for (let i = 1; i < 8; i += 1) {
      moveThumb(leftThumb, scale.width / i);
      anchors[0].dispatchEvent(fakeMouseClick);
      expect(parseFloat(getComputedStyle(leftThumb).left)).toEqual(0);

      anchors[3].dispatchEvent(fakeMouseClick);
      expect(parseFloat(getComputedStyle(leftThumb).left))
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
  let leftThumb: Element;

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
    leftThumb = thumbs[0];
    leftThumb.dispatchEvent(fakeMouseDown);

    const hint = hints[0];
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.hidden).toBeFalse();
    expect(hint.textContent).toEqual('hint');
  });

  it('При нажатии на правом кругляше отображается подсказка', () => {
    const rightThumb = thumbs[1];
    rightThumb.dispatchEvent(fakeMouseDown);

    const hint = hints[0];
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.hidden).toBeFalse();
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

    const leftHint = hints[0];
    if (!(leftHint instanceof HTMLDivElement)) throw new Error();

    const rightHint = hints[1];
    if (!(rightHint instanceof HTMLDivElement)) throw new Error();

    expect(leftHint.textContent).toEqual('hint');
    expect(rightHint.textContent).toEqual('hint');

    view.setOptions({ hintAlwaysShow: false });

    expect(hints[0]).toBeFalsy();
    expect(hints[1]).toBeFalsy();
  });
});
