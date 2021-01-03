/* eslint-disable no-use-before-define */
import View from '../src/assets/blocks/slider/components/view/view';
import '../src/assets/blocks/slider/slider.scss';

const div = document.createElement('div');
// Должен быть уникальный класс для каждого спека.
div.className = 'divViewSpec';
div.style.marginTop = '70px';

const fakeMouseUp = new MouseEvent('mouseup',
  { bubbles: true, cancelable: true });

describe('Первоначальная минимальная инициализация\n', () => {
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it(`Можно инициализировать с минимальным количеством аргументов
    (selector), иначе будет ошибка`, () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new View({});
    }).toThrowError();
  });

  it(`В любой момент времени можно получить значения 
  всех публичных свойств`, () => {
    const view = new View({ selector: '.divViewSpec' });
    const options = view.getOptions();
    expect(options.selector).toEqual('.divViewSpec');
    expect(options.angle).toEqual(0);
    expect(options.showScale).toBeTrue();
  });

  it(`Если неправильно заданы некоторые опции,
      вывалит ошибку`, () => {
    const view = new View({
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
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it('Можно двигать левый бегунок мышкой', () => {
    const option = {
      range: false,
      selector: '.divViewSpec',
      className: 'slider',
    };

    const view = new View(option);

    const leftThumb = div.querySelector('[class*=left]');
    if (!(leftThumb instanceof HTMLDivElement)) throw new Error();

    const scaleWidth = div.clientWidth - leftThumb.offsetWidth;

    const { step } = view.getOptions();

    // бежим к концу
    const deltaPx = scaleWidth / 8;
    const pixelStep = step * scaleWidth;
    for (let i = 1; i < 8; i += 1) {
      // не стоит бежать до самого конца, т.к. из-зa погрешности округления
      // мы можем достичь конца раньше, чем надеялись
      // определим начальное положение бегунка
      const startLeft = leftThumb.getBoundingClientRect().left;
      moveThumb(leftThumb, deltaPx);
      const deltaInFact = leftThumb.getBoundingClientRect().left - startLeft;
      expect(Math.abs(deltaInFact - deltaPx)).toBeLessThanOrEqual(pixelStep);
    }
  });

  it('Можно двигать правый бегунок мышкой', () => {
    const option = {
      range: false,
      selector: '.divViewSpec',
      className: 'slider',
    };
    const view = new View(option);
    view.setOptions({ range: true });

    const rightThumb = div.querySelector('[class*=right]');
    if (!(rightThumb instanceof HTMLDivElement)) throw new Error();

    const scaleWidth = div.clientWidth - rightThumb.offsetWidth;

    const { step } = view.getOptions();

    // бежим к началу
    const deltaPx = scaleWidth / 8;
    const pixelStep = step * scaleWidth;

    for (let i = 7; i < 1; i += 1) {
      // определим начальное положение бегунка
      const startLeft = rightThumb.getBoundingClientRect().left;
      moveThumb(rightThumb, deltaPx);
      const deltaInFact = rightThumb.getBoundingClientRect().left - startLeft;
      expect(Math.abs(deltaInFact - deltaPx)).toBeLessThanOrEqual(pixelStep);
    }
  });

  it('Бегунки не могут выходить за пределы блока', () => {
    const option = {
      range: false,
      selector: '.divViewSpec',
      className: 'slider',
    };

    const view = new View(option);
    view.setOptions({ range: true });

    const leftThumb = div.querySelector('[class*=left]');
    if (!(leftThumb instanceof HTMLDivElement)) throw new Error();

    const rightThumb = div.querySelector('[class*=right]');
    if (!(rightThumb instanceof HTMLDivElement)) throw new Error();

    const scaleWidth = div.clientWidth - rightThumb.offsetWidth;

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
    const option = {
      range: true,
      selector: '.divViewSpec',
      className: 'slider',
      angle: 90,
    };

    // eslint-disable-next-line no-new
    new View(option);

    const leftThumb = div.querySelector('[class*=left]');
    if (!(leftThumb instanceof HTMLDivElement)) throw new Error();

    const rightThumb = div.querySelector('[class*=right]');
    if (!(rightThumb instanceof HTMLDivElement)) throw new Error();

    const scaleWidth = div.clientWidth - rightThumb.offsetWidth;

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
    expect(pos.top - startTop)
      .toEqual(parseFloat(getComputedStyle(leftThumb).left));

    // проверим поведение верхнего бегунка (левого)
    startTop = lowLimit;
    moveThumb(rightThumb, 1000, -scaleWidth / 4);
    pos = rightThumb.getBoundingClientRect();
    expect(pos.left).toEqual(leftLimit);
    expect(pos.right).toEqual(rightLimit);
    expect(startTop - pos.top)
      .toEqual(parseFloat(getComputedStyle(leftThumb).left));
  });

  it('Бегунки располагаются согласно шагу и могут совпадать', () => {
    const option = {
      range: true,
      selector: '.divViewSpec',
      className: 'slider',
      angle: 0,
      step: 0.5,
    };
    const view = new View(option);
    const { scale } = view;
    if (scale === null) throw new Error();

    const scaleWidth = scale.width;
    const rightThumb = view.thumbs.thumbRight;
    const leftThumb = view.thumbs.thumbLeft;

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
    const option = {
      range: false,
      selector: '.divViewSpec',
      className: 'slider',
      angle: 0,
    };

    const view = new View(option);

    const leftThumb = div.getElementsByClassName('slider__thumb_left')[0];
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
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it('По умолчанию шкала отображает значения, кратные шагу и зависящие от свойства "partsNum"', () => {
    const option = {
      range: true,
      selector: '.divViewSpec',
      className: 'slider',
      showScale: true,
      step: 0.75,
      partsNum: 2,
    };

    const view = new View(option);
    const { scale } = view;
    if (scale === null) {
      throw new Error();
    }
    let anchors = scale.el.querySelectorAll('[class*=scale-points]');

    expect(anchors[0].textContent).toEqual('0');
    expect(anchors[1].textContent).toEqual('0.75');
    expect(anchors[2].textContent).toEqual('1');

    view.setOptions({ step: 0.4, partsNum: 2 });
    anchors = scale.el.querySelectorAll('[class*=scale-points]');
    expect(anchors[1].textContent).toEqual('0.4');

    view.setOptions({ step: 0.32, partsNum: 2 });
    anchors = scale.el.querySelectorAll('[class*=scale-points]');
    expect(anchors[1].textContent).toEqual('0.64');

    view.setOptions({ step: 0.36, partsNum: 2 });
    anchors = scale.el.querySelectorAll('[class*=scale-points]');
    expect(anchors[1].textContent).toEqual('0.36');

    view.setOptions({ step: 0.36, partsNum: 3 });
    anchors = scale.el.querySelectorAll('[class*=scale-points]');
    expect(anchors[1].textContent).toEqual('0.36');
    expect(anchors[2].textContent).toEqual('0.72');

    view.setOptions({ step: 0.4, partsNum: 3 });
    anchors = scale.el.querySelectorAll('[class*=scale-points]');
    expect(anchors[1].textContent).toEqual('0.4');
    expect(anchors[2].textContent).toEqual('0.8');
  });

  it(`При щелчке на значении диапазона ближайший бегунок
      бежит к этому значению`, () => {
    const option = {
      range: true,
      selector: '.divViewSpec',
      className: 'slider',
      showScale: true,
      step: 1 / 10,
      partsNum: 3,
    };

    const view = new View(option);
    const { scale } = view;
    if (scale === null) throw new Error();

    const anchors = scale.el.querySelectorAll('[class*=scale-points]');

    const fakeMouseClick = new MouseEvent('click', {
      bubbles: true, cancelable: true,
    });

    const rightThumb = view.el.getElementsByClassName('slider__thumb_right')[0];
    if (!(rightThumb instanceof HTMLDivElement)) throw new Error();

    const leftThumb = view.el.getElementsByClassName('slider__thumb_left')[0];
    if (!(leftThumb instanceof HTMLDivElement)) throw new Error();

    for (let i = 3; i < 8; i += 1) {
      moveThumb(rightThumb, -scale.width / i);
      moveThumb(leftThumb, scale.width / i);

      anchors[0].dispatchEvent(fakeMouseClick);
      expect(parseFloat(getComputedStyle(leftThumb).left)).toEqual(0);

      anchors[3].dispatchEvent(fakeMouseClick);
      expect(parseFloat(getComputedStyle(rightThumb).left))
        .toEqual(scale.width);

      anchors[1].dispatchEvent(fakeMouseClick);
      let thumbRect = leftThumb.getBoundingClientRect();
      let thumbCenter = (thumbRect.right - thumbRect.left) / 2 + thumbRect.left;
      let anchorRect = anchors[1].getBoundingClientRect();
      let anchorCenter = (anchorRect.right - anchorRect.left) / 2 + anchorRect.left;
      expect(Math.round(thumbCenter)).toEqual(Math.round(anchorCenter));
      anchors[0].dispatchEvent(fakeMouseClick);

      anchors[2].dispatchEvent(fakeMouseClick);
      thumbRect = rightThumb.getBoundingClientRect();
      thumbCenter = (thumbRect.right - thumbRect.left) / 2 + thumbRect.left;
      anchorRect = anchors[2].getBoundingClientRect();
      anchorCenter = (anchorRect.right - anchorRect.left) / 2 + anchorRect.left;
      expect(Math.round(thumbCenter)).toEqual(Math.round(anchorCenter));
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
    const option = {
      range: true,
      selector: '.divViewSpec',
      className: 'slider',
      showScale: true,
      partsNum: 1,
    };

    const view = new View(option);
    const { scale } = view;
    if (scale === null) throw new Error();

    const anchors = scale.el.querySelectorAll('[class*=scale-points]');

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
    const option = {
      range: true,
      selector: '.divViewSpec',
      className: 'slider',
      showScale: true,
      partsNum: 4,
    };

    const view = new View(option);
    const { scale } = view;
    if (scale === null) throw new Error();

    let anchors = scale.el.querySelectorAll('[class*=scale-points]');
    let values: number[] | string[] = [50, 75, 100, 125, 150];

    scale.setAnchorValues(values);

    anchors.forEach((anchor, i) => {
      expect(anchor.textContent).toEqual(String(values[i]));
    });

    view.setOptions({ partsNum: 1 });
    values = ['Jan', 'Dec'];
    scale.setAnchorValues(values);

    anchors = scale.el.querySelectorAll('[class*=scale-points]');
    expect(anchors[0].textContent).toEqual('Jan');
    expect(anchors[1].textContent).toEqual('Dec');
  });

  it('Можно задавать значения, не зависящие от свойства partsNum', () => {
    const option = {
      range: true,
      selector: '.divViewSpec',
      className: 'slider',
      showScale: true,
      partsNum: 4,
    };

    const view = new View(option);
    const { scale } = view;
    if (scale === null) throw new Error();
    const anchors = scale.el.getElementsByClassName('slider__scale-points');

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
  const option = {
    range: true,
    selector: '.divViewSpec',
    className: 'slider',
    showScale: true,
    partsNum: 4,
  };

  const fakeMouseDown = new MouseEvent('mousedown',
    {
      bubbles: true, cancelable: true, clientX: 0, clientY: 0,
    });

  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it('При нажатии на левом кругляше отображается подсказка', () => {
    const view = new View(option);
    const thumb = view.thumbs.thumbLeft;
    thumb.dispatchEvent(fakeMouseDown);

    const hint = thumb.querySelector('[class*=__hint]');
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.hidden).toBeFalse();
    expect(hint.textContent).toEqual('hint');
  });

  it('При нажатии на правом кругляше отображается подсказка', () => {
    const view = new View(option);
    const thumb = view.thumbs.thumbRight;
    thumb.dispatchEvent(fakeMouseDown);

    const hint = thumb.querySelector('[class*=__hint]');
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.hidden).toBeFalse();
    expect(hint.textContent).toEqual('hint');
  });

  it('Подсказку можно прятать', () => {
    const view = new View(option);
    view.setOptions({ hintAboveThumb: false });
    const thumb = view.thumbs.thumbLeft;

    thumb.dispatchEvent(fakeMouseDown);
    const hints = thumb.getElementsByClassName('slider__hint');

    expect(hints.length).toEqual(0);

    const scaleWidth = div.clientWidth - thumb.offsetWidth;
    const deltaPx = scaleWidth / 8;

    moveThumb(thumb, deltaPx);
    expect(hints.length).toEqual(0);
    thumb.dispatchEvent(fakeMouseUp);
  });

  it('Существует опция, при которой подсказка отображается всегда', () => {
    const view = new View(option);
    view.setOptions({ hintAlwaysShow: true });

    const thumb = view.thumbs.thumbLeft;

    let hint = thumb.querySelector('[class*=__hint]');
    if (!(hint instanceof HTMLDivElement)) throw new Error();

    expect(hint.offsetWidth).toBeGreaterThan(0);
    expect(hint.textContent).toEqual('hint');
    expect(hint.offsetWidth).toBeGreaterThan(0);

    view.setOptions({ hintAlwaysShow: false });

    hint = thumb.querySelector('[class*=__hint]');
    expect(hint).toEqual(null);
  });
});

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

  thumb.dispatchEvent(fakeMouseDown);
  thumb.dispatchEvent(fakeMouseMove);
  thumb.dispatchEvent(fakeMouseUp);
}
