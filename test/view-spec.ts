import View from '../src/assets/blocks/slider/components/view/view';

const style = document.createElement('style');
style.type = 'text/css';

style.textContent = `
    .div {
        margin-top: 50px;
    }
    .slider {
      width: 100%;
      height: 6px;
      border: 1px solid grey;
      box-sizing: border-box;
      border-radius: 3px;
      position: relative;
    }
    .slider__thumb-left, .slider__thumb-right {
      width: 12px;
      height: 12px;
      box-sizing: content-box;
      background: linear-gradient(180deg, #6fcf97 0%, #66d2ea 100%);
      border: 2px solid white;
      border-radius: 10px;
      position: absolute;
      top: -6px;
      cursor: pointer;
    }
    .slider__hint {
      position: absolute;
      top: -20px;
      left: -3px;
      font-size: 8px;
    }
    .slider__thumb_moving {
      transform: scale(2);
    }
    .slider__thumb-left {
      left: 0;
    }
    .slider__thumb-right {
      right: 0;
    }
    .slider__scale {
      position: relative;
      top: 10px;
    }
    .slider__scale-points {
      position: absolute;
      cursor: pointer;
    }
`;

document.head.append(style);

const div = document.createElement('div');
// Должен быть уникальный класс для каждого спека.
div.className = 'divViewSpec';
document.body.append(div);

describe(`Первоначальная минимальная инициализация\n`, () => {
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it(`Можно инициализировать с минимальным количеством аргументов
    (min, max, selector), иначе будет ошибка`, () => {
    const view = new View({min: 0, max: 100, selector: '.divViewSpec'});
    view.getOptions();

    expect(() => {
      new View({min: 0, max: 100});
    }).toThrowError();
  });

  it(`В любой момент времени можно получить значения 
  всех публичных свойств`, () => {
    const view = new View({min: 0, max: 100, selector: '.divViewSpec'});
    const options = view.getOptions();
    expect(options.min).toEqual(0);
    expect(options.max).toEqual(100);
    expect(options.selector).toEqual('.divViewSpec');
    expect(options.step).toEqual(1);
  });

  it(`По умолчанию шаг равен 1/100 от длины шкалы`, () => {
    const view = new View({min: 200, max: 1200, selector: '.divViewSpec'});
    expect(view.getOptions().step).toEqual(10);
  });

  it(`Если задан нулевой шаг, он автоматически 
  становится 1/100 длины шкалы`, () => {
    const view = new View({
      min: 200, max: 1200, selector: '.divViewSpec', step: 0,
    });
    expect(view.getOptions().step).toEqual(10);
  });

  it(`Если неправильно заданы некоторые опции,
   вывалит ошибку`, () => {
    const view = new View({
      min: 200, max: 1200, selector: '.divViewSpec', step: 0,
    });

    expect(() => {
      view.setOptions({min: '200a'});
    }).toThrowError('min should be a number!');
    expect(() => {
      view.setOptions({max: '1200a'});
    }).toThrowError('max should be a number!');
    expect(() => {
      view.setOptions({step: '1200a'});
    }).toThrowError('step should be a number!');
    expect(() => {
      view.setOptions({angle: '90deg'});
    }).toThrowError('angle should be a number!');
    expect(() => {
      view.setOptions({min: 1000, max: 0});
    }).toThrowError('max should be greater then min!');
    expect(() => {
      view.setOptions({angle: -10});
    }).toThrowError('angle should be >= 0 and <= 90');
  });
});

describe(`Позволяет пользователю взаимодействовать с бегунком\n`, () => {
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });


  it(`Можно двигать левый бегунок мышкой`, () => {
    const option = {
      min: 0, max: 1000, range: false,
      selector: '.divViewSpec', className: 'slider',
    };
    const view = new View(option);

    const leftThumb = <HTMLDivElement>div.querySelector('[class*=left]');
    const scaleWidth = div.clientWidth - leftThumb.offsetWidth;

    const {min, max, step} = view.getOptions();

    // бежим к концу
    const deltaPx: number = scaleWidth / 8;
    const pixelStep: number = step * (scaleWidth) / (max - min);

    for (let i = 1; i < 8; i++) {
      // не стоит бежать до самого конца, т.к. из-зи погрешности округления
      // мы можем достичь конца раньше, чем надеялись
      // определим начальное положение бегунка
      const startLeft = leftThumb.getBoundingClientRect().left;
      moveThumb(leftThumb, deltaPx);
      const deltaInFact = leftThumb.getBoundingClientRect().left - startLeft;
      expect(Math.abs(deltaInFact - deltaPx)).toBeLessThanOrEqual(pixelStep);
    }
  });

  it(`Можно двигать правый бегунок мышкой`, () => {
    const option = {
      min: -300, max: 1300, range: false,
      selector: '.divViewSpec', className: 'slider',
    };
    const view = new View(option);
    view.setOptions({range: true}).render();

    const rightThumb = <HTMLDivElement>div.querySelector('[class*=right]');
    const scaleWidth = div.clientWidth - rightThumb.offsetWidth;
    const {min, max, step} = view.getOptions();

    // бежим к началу
    const deltaPx = scaleWidth / 8;
    const pixelStep: number = step * (scaleWidth) / (max - min);

    for (let i = 7; i < 1; i++) {
      // определим начальное положение бегунка
      const startLeft = rightThumb.getBoundingClientRect().left;
      moveThumb(rightThumb, deltaPx);
      const deltaInFact = rightThumb.getBoundingClientRect().left - startLeft;
      expect(Math.abs(deltaInFact - deltaPx)).toBeLessThanOrEqual(pixelStep);
    }
  });

  it(`Если левый и правый бегунок меняются местами, также меняются и их классы:
      thumb-left и thumb-right соответственно`, () => {
    const option = {
      min: -300, max: 1300, range: false,
      selector: '.divViewSpec', className: 'slider',
    };

    const view = new View(option);
    view.setOptions({range: true, min: -1000, max: 2000}).render();

    const leftThumb = <HTMLDivElement>div.querySelector('[class*=left]');
    const rightThumb = <HTMLDivElement>div.querySelector('[class*=right]');
    const scaleWidth = div.clientWidth - rightThumb.offsetWidth;

    moveThumb(leftThumb, scaleWidth * 7 / 8);
    moveThumb(rightThumb, -scaleWidth);

    expect(leftThumb.className.includes('right')).toBeTruthy();
    expect(leftThumb.className.includes('left')).toBeFalsy();

    expect(rightThumb.className.includes('left')).toBeTruthy();
    expect(rightThumb.className.includes('right')).toBeFalsy();
  });

  it(`Движение бегунков ограничено шкалой`, () => {
    const option = {
      min: -300, max: 1300, range: false,
      selector: '.divViewSpec', className: 'slider',
    };

    const view = new View(option);
    view.setOptions({range: true, min: -2777, max: 5341, step: 5}).render();

    const leftThumb = <HTMLDivElement>div.querySelector('[class*=left]');
    const rightThumb = <HTMLDivElement>div.querySelector('[class*=right]');
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

  it(`Слайдер может работать в вертикальном положении`, () => {
    const option = {
      min: 0, max: 100, range: true, selector: '.divViewSpec',
      className: 'slider', angle: 90,
    };
    new View(option);

    const leftThumb = <HTMLDivElement>div.querySelector('[class*=left]');
    const rightThumb = <HTMLDivElement>div.querySelector('[class*=right]');
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

  it(`Проверки на углы более 0 и менее 90 градусов слишком сложны, 
  поэтому их нужно проводить вручную`, () => {
    expect(true).toBeTrue();
  });
});

describe(`Также присутствует интерактивная шкала\n`, () => {
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });
  it(`Шкала отображает минимальные и максимальные
   значения диапазона слайдера`, () => {
    const option = {
      min: 0, max: 100, range: true, selector: '.divViewSpec',
      className: 'slider', showScale: true,
    };
    const view = new View(option);
    expect(view.el.querySelector('[data-side=L]')
      .textContent).toEqual(view.min + '');

    expect(view.el.querySelector('[data-side=R]')
      .textContent).toEqual(view.max + '');
    const min = 25;
    const max = 50;

    for (let i = 0; i < 10; i++) {
      view.setOptions({min: -min * i});
      expect(view.el.querySelector('[data-side=L]').textContent)
        .toEqual(view.min + '');
      view.setOptions({max: max * i});
      expect(view.el.querySelector('[data-side=R]').textContent)
        .toEqual(view.max + '');

      view.setOptions({min: -min * 2 * i, max: max * 2 * i});
      expect(view.el.querySelector('[data-side=L]').textContent)
        .toEqual(view.min + '');
      expect(view.el.querySelector('[data-side=R]').textContent)
        .toEqual(view.max + '');
    }
  });

  it(`При щелчке на значении диапазона ближайший бегунок
   бежит к этому значению (начало и конец)`, () => {
    const option = {
      min: -100, max: 1000, step: 3, range: true, selector: '.divViewSpec',
      className: 'slider', showScale: true,
    };
    const view = new View(option);

    const rightRangeValue = view.el.querySelector('[data-side=R]');
    const leftRangeValue = view.el.querySelector('[data-side=L]');
    const fakeMouseClick = new MouseEvent('click', {
      bubbles: true, cancelable: true,
    });

    for (let i = 3; i < 8; i++) {
      const rightThumb: HTMLDivElement =
        view.el.querySelector('[class*=right]');
      const leftThumb: HTMLDivElement =
        view.el.querySelector('[class*=left]');

      moveThumb(rightThumb, -view.scale.width / i);
      moveThumb(leftThumb, view.scale.width / i);

      leftRangeValue.dispatchEvent(fakeMouseClick);
      rightRangeValue.dispatchEvent(fakeMouseClick);

      expect(parseFloat(getComputedStyle(leftThumb).left)).toEqual(0);
      expect(parseFloat(getComputedStyle(rightThumb).left))
        .toEqual(view.scale.width);
    }

    view.setOptions({range: false});
    view.render();
    for (let i = 1; i < 8; i++) {
      const leftThumb: HTMLDivElement = view.el.querySelector('[class*=left]');

      moveThumb(leftThumb, view.scale.width / i);
      leftRangeValue.dispatchEvent(fakeMouseClick);
      expect(parseFloat(getComputedStyle(leftThumb).left)).toEqual(0);

      rightRangeValue.dispatchEvent(fakeMouseClick);
      expect(parseFloat(getComputedStyle(leftThumb).left))
        .toEqual(view.scale.width);
    }
  });

  it(`Шкалу можно прятать`, () => {
    const option = {
      min: -333, max: 555, step: 3, range: true, selector: '.divViewSpec',
      className: 'slider', showScale: true,
    };

    const view = new View(option);
    const labelLeft: HTMLDivElement = view.el.querySelector('[data-side=L]');
    const labelRight: HTMLDivElement = view.el.querySelector('[data-side=R]');

    expect(labelLeft.offsetHeight).toBeTruthy();
    expect(labelRight.offsetHeight).toBeTruthy();

    view.setOptions({showScale: false});
    expect(labelLeft.offsetHeight).toBeFalsy();
    expect(labelRight.offsetHeight).toBeFalsy();
  });

  it(`Шкалу можно отвязывать от максимума и минимума и менять
   значения на произвольные заданием свойства "rangeValue"`, () => {
    const option = {
      min: -100, max: 1000, step: 3, range: true, selector: '.divViewSpec',
      className: 'slider', showScale: true, rangeValue: ['Jan', 'Dec'],
    };

    const view = new View(option);
    const rightRangeValue = view.el.querySelector('[data-side=R]');
    const leftRangeValue = view.el.querySelector('[data-side=L]');

    expect(leftRangeValue.textContent).toEqual('Jan');
    expect(rightRangeValue.textContent).toEqual('Dec');
  });
});

function moveThumb(thumb: HTMLDivElement,
  deltaXPx: number, deltaYPx: number = 0): void {
  const startX = Math.abs(deltaXPx);
  const startY = Math.abs(deltaYPx);

  const fakeMouseDown = new MouseEvent('mousedown',
    {bubbles: true, cancelable: true, clientX: startX, clientY: startY});

  const fakeMouseMove = new MouseEvent('mousemove',
    {
      bubbles: true, cancelable: true,
      clientX: startX + deltaXPx, clientY: startY + deltaYPx,
    });

  const fakeMouseUp = new MouseEvent('mouseup',
    {bubbles: true, cancelable: true});

  thumb.dispatchEvent(fakeMouseDown);
  thumb.dispatchEvent(fakeMouseMove);
  thumb.dispatchEvent(fakeMouseUp);
}
