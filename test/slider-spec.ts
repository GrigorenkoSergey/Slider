import {Slider}from '../src/assets/blocks/slider/slider';

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
`;

document.head.append(style);

const div = document.createElement('div');
div.className = 'div';
// Обратить внимание, что лучше создать для каждого спека свой
// блок со своим отдельным классом.
// В этом спеке класс == "div". Иначе начинается путаница с тестами.
// Мои попытки использовать beforeAll anc afterAll ни к чему не привели

document.body.append(div);


describe(`Работает в принципе...\n`, () => {
  const option = {
    min: 0,
    max: 100,
    selector: '.div',
  };

  // На будущее, не стоит убирать beforeEach, afterEach, т.к.
  // из-за асинхронной работы библиотеки
  // могут ломаться заведомо правильные тесты.

  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it(`Инициализируется с минимальным количеством опций`, () => {
    expect(() => {
      new Slider(option);
    }).not.toThrowError();
    const slider = new Slider(option);

    expect(slider.update).toBeDefined();
    expect(slider.getOptions).toBeDefined();
    expect(slider.setOptions).toBeDefined();
    expect(slider.bindWith).toBeDefined();
    expect(slider.setThumbsPos).toBeDefined();
    expect(slider.unbindFrom).toBeDefined();
  });

  it(`Правильно инициализируется с любым количеством опций `, () => {
    const option = {
      min: 0,
      max: 100,
      selector: '.div',
      bar: 12,
      foo: 'asdf',
      thumbLeftPos: 30,
      thumbRightPos: 90,
      range: true,
      angle: 45,
      hintAboveThumb: true,
    };

    const slider = new Slider(option);
    expect(slider.getOptions().min).toEqual(0);
    expect(slider.getOptions().max).toEqual(100);
    expect(slider.getOptions().step).toEqual(1);
    expect(slider.getOptions().thumbLeftPos).toEqual(30);

    // Проверим положение крайних бегунков относительно оси
    const left = parseFloat(getComputedStyle(slider._view.thumbLeft).left);
    const right = parseFloat(getComputedStyle(slider._view.thumbRight).left);
    const scaleWidth = div.clientWidth - slider._view.thumbLeft.offsetWidth;

    // ниже относительное смещения левого и правого бегунков от начала
    const offsetLeft = left / scaleWidth;
    const offsetRight = right / scaleWidth;

    expect(offsetLeft > 0.29 && offsetLeft < 0.31).toBeTruthy();
    expect(offsetRight > 0.89 && offsetRight < 0.91).toBeTruthy();

    expect(slider.getOptions().thumbRightPos).toEqual(90);
    expect(slider.getOptions().ticks).toEqual({100: 100});
    expect(slider.getOptions().angle).toEqual(45);
    expect(slider.getOptions().range).toBeTruthy();

    expect(slider.getOptions().className).toEqual('slider');
    expect(slider.getOptions().selector).toEqual('.div');
    expect(slider.getOptions().hintAboveThumb).toBeTruthy();
  });

  it(`Позволяет двигать бегунки с помощью setThumbsPos`, () => {
    const option = {min: 0, max: 100, range: true, selector: '.div'};
    const slider = new Slider(option);

    slider.setThumbsPos(20, 80);
    expect(slider.getOptions().thumbLeftPos).toEqual(20);
    expect(slider.getOptions().thumbRightPos).toEqual(80);

    slider.setThumbsPos(70, 30);
    expect(slider.getOptions().thumbLeftPos).toEqual(30);
    expect(slider.getOptions().thumbRightPos).toEqual(70);

    slider.setThumbsPos(20);
    expect(slider.getOptions().thumbLeftPos).toEqual(20);
    expect(slider.getOptions().thumbRightPos).toEqual(70);
  });

  it(`Однако, если задан в функцию "setThumbsPos" передан один аргумент, 
  проверки на корректность задания положения бегунка не делается`, () => {
    const option = {
      min: 0, max: 100, range: true, selector: '.div', thumbRightPos: 50,
    };
    const slider = new Slider(option);

    slider.setThumbsPos(90);
    expect(slider.getOptions().thumbLeftPos).toEqual(90);
    expect(slider.getOptions().thumbRightPos).toEqual(50);
  });

  it(`Можно задавать вообще любые свойства, лишние свойства будут
   проигнорированы`, () => {
    const option = {
      min: 0,
      max: 100,
      selector: '.div',
      bar: 12,
      foo: 'asdf',
      thumbLeftPos: 10,
      thumbRightPos: 90,
      range: true,
      angle: 45,
      hintAboveThumb: true,
    };

    const slider = new Slider(option);
    slider.setOptions({min: '20', max: 80, range: false, angle: '0'});
    expect(slider.getOptions().min).toEqual(20);
    expect(slider.getOptions().max).toEqual(80);
    expect(slider.getOptions().range).toEqual(false);
    expect(slider.getOptions().angle).toEqual(0);

    slider.setOptions({hintAboveThumb: true});
    expect(slider.getOptions().hintAboveThumb).toBeTruthy();
  });
});

describe(`Любые изменения View затрагивают  Model и наоборот\n`, () => {
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it(`Можно двигать мышкой левый бегунок`, () => {
    const option = {
      min: -10000, max: 1000, range: false,
      selector: '.div', className: 'slider',
    };
    const slider = new Slider(option);

    const leftThumb = <HTMLDivElement>div.querySelector('[class*=left]');
    const scaleWidth = div.clientWidth - leftThumb.offsetWidth;

    let fakeMouseDown = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true,
    });
    leftThumb.dispatchEvent(fakeMouseDown);

    const {max, min, step} = slider.getOptions();

    // бежим к концу
    for (let i = 1; i < 9; i++) {
      const fakeMouseMove = new MouseEvent('mousemove',
        {bubbles: true, cancelable: true, clientX: i * scaleWidth / 8});
      document.dispatchEvent(fakeMouseMove);
      // Да, мой юный друг, это связано с погрешностью округления ))
      expect(
        Math.abs(slider.getOptions().thumbLeftPos -
          ((max - min) / 8 * i + min)))
        .toBeLessThanOrEqual(step);
    }

    const fakeMouseUp = new MouseEvent('mouseup', {
      bubbles: true, cancelable: true,
    });
    document.dispatchEvent(fakeMouseUp);

    // При fakeMouseDown обязательно генерировать clientX,
    // если хочешь, к примеру, двигаться назад
    // По умолчанию clientX всегда равно 0, поэтому бегунок
    // при fakeMouseMove будет двигаться только вперед

    fakeMouseDown = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true, clientX: scaleWidth,
    });
    leftThumb.dispatchEvent(fakeMouseDown);
    document.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true, cancelable: true, clientX: scaleWidth / 2,
    }));
    expect(
      Math.abs(slider.getOptions().thumbLeftPos - ((max - min) / 2 + min)))
      .toBeLessThanOrEqual(step);
  });

  it(`Можно двигать мышкой правый бегунок`, () => {
    const option = {
      min: -200, max: 100, range: true, selector: '.div', className: 'slider',
    };
    const slider = new Slider(option);
    const rightThumb = <HTMLDivElement>div.querySelector('[class*=right]');
    const scaleWidth = div.clientWidth - rightThumb.offsetWidth;

    let fakeMouseDown = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true, clientX: scaleWidth,
    });
    rightThumb.dispatchEvent(fakeMouseDown);

    const {max, min, step} = slider.getOptions();

    // бежим к началу
    for (let i = 7; i > 1; i--) {
      const fakeMouseMove = new MouseEvent('mousemove', {
        bubbles: true, cancelable: true, clientX: i * scaleWidth / 8,
      });

      document.dispatchEvent(fakeMouseMove);
      expect(
        Math.abs(slider.getOptions().thumbRightPos -
          ((max - min) / 8 * i + min)))
        .toBeLessThanOrEqual(2 * step);
    }

    const fakeMouseUp = new MouseEvent('mouseup', {
      bubbles: true, cancelable: true,
    });
    document.dispatchEvent(fakeMouseUp);

    // Опять переместим правый бегунок в конец
    fakeMouseDown = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true,
    });
    rightThumb.dispatchEvent(fakeMouseDown);

    document.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true, cancelable: true, clientX: scaleWidth,
    }));
    expect(
      Math.abs(slider.getOptions().thumbRightPos - max))
      .toBeLessThanOrEqual(2 * step);
  });

  it(`Ближний к началу бегунок ВСЕГДА меняет свойство "thumbLeftPos",
   а ближний к концу - "thumbRightPos"`, () => {
    const option = {
      min: -500, max: 500, step: 7, range: true,
      thumbLeftPos: -100, thumbRightPos: 200,
      selector: '.div', className: 'slider',
    };
    const slider = new Slider(option);

    const leftThumb = <HTMLDivElement>div.querySelector('[class*=left]');
    const rightThumb = <HTMLDivElement>div.querySelector('[class*=right]');
    const scaleWidth = div.clientWidth - rightThumb.offsetWidth;

    // уведем левый бегунок далеко вправо к концу шкалы
    let fakeMouseDown = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true, clientX: 0, clientY: 0,
    });
    let fakeMouseMove = new MouseEvent('mousemove', {
      bubbles: true, cancelable: true, clientX: scaleWidth * 2, clientY: 500,
    });
    let fakeMouseUp = new MouseEvent('mouseup', {
      bubbles: true, cancelable: true,
    });

    leftThumb.dispatchEvent(fakeMouseDown);
    document.dispatchEvent(fakeMouseMove);
    document.dispatchEvent(fakeMouseUp);

    // уведем правый бегунок далеко вправо к концу шкалы
    fakeMouseDown = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true, clientX: scaleWidth, clientY: 0,
    });

    fakeMouseMove = new MouseEvent('mousemove', {
      bubbles: true, cancelable: true, clientX: 0, clientY: 500,
    });
    fakeMouseUp = new MouseEvent('mouseup', {bubbles: true, cancelable: true});

    rightThumb.dispatchEvent(fakeMouseDown);
    document.dispatchEvent(fakeMouseMove);
    document.dispatchEvent(fakeMouseUp);

    const {min, max, step} = option;
    expect(Math.abs(slider.getOptions().thumbLeftPos - min))
      .toBeLessThanOrEqual(step);
    expect(slider.getOptions().thumbRightPos - max).toBeLessThanOrEqual(step);
  });

  it(`Подсказка над бегунками всегда отображает корректное 
  значение положения бегунка`, () => {
    const option = {
      min: -1000, max: 1000, step: 10, range: true,
      selector: '.div', className: 'slider',
      hintAboveThumb: true,
    };

    const slider = new Slider(option);

    const leftThumb = <HTMLDivElement>div.querySelector('[class*=left]');
    const rightThumb = <HTMLDivElement>div.querySelector('[class*=right]');
    const scaleWidth = div.clientWidth - rightThumb.offsetWidth;

    // Подвигаем левый бегунок
    let fakeMouseDown = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true, clientX: 0, clientY: 0,
    });

    let fakeMouseMove = new MouseEvent('mousemove', {
      bubbles: true, cancelable: true, clientX: scaleWidth / 4, clientY: 500,
    });
    const fakeMouseUp = new MouseEvent('mouseup', {
      bubbles: true, cancelable: true,
    });

    leftThumb.dispatchEvent(fakeMouseDown);
    // Подсказка появляется только после нажатия на кругляше, поэтому должно
    // произойти mousedown для правильного выделения
    const hint = <HTMLDivElement>div.querySelector('[class*=hint]');

    expect(slider.getOptions().thumbLeftPos).toEqual(+hint.textContent);
    document.dispatchEvent(fakeMouseMove);

    expect(slider.getOptions().thumbLeftPos).toEqual(+hint.textContent);
    document.dispatchEvent(fakeMouseUp);

    expect(slider.getOptions().thumbLeftPos).toEqual(+hint.textContent);

    fakeMouseDown = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true, clientX: scaleWidth, clientY: 0,
    });
    fakeMouseMove = new MouseEvent('mousemove', {
      bubbles: true, cancelable: true, clientX: scaleWidth * 0.75, clientY: 500,
    });

    rightThumb.dispatchEvent(fakeMouseDown);
    expect(slider.getOptions().thumbRightPos).toEqual(+hint.textContent);

    document.dispatchEvent(fakeMouseMove);
    expect(slider.getOptions().thumbRightPos).toEqual(+hint.textContent);

    document.dispatchEvent(fakeMouseUp);
    expect(slider.getOptions().thumbRightPos).toEqual(+hint.textContent);
  });

  it(`В любое время подсказку над бегунком можно 
  отключить можно отключить`, () => {
    const option = {
      min: -1000, max: 1000, step: 10, range: true,
      selector: '.div', className: 'slider',
      hintAboveThumb: true,
    };

    const slider = new Slider(option);

    const leftThumb = <HTMLDivElement>div.querySelector('[class*=left]');
    const rightThumb = <HTMLDivElement>div.querySelector('[class*=right]');

    const fakeMouseDown = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true,
    });
    const fakeMouseUp = new MouseEvent('mouseup', {
      bubbles: true, cancelable: true,
    });

    leftThumb.dispatchEvent(fakeMouseDown);
    const hint = <HTMLDivElement>div.querySelector('[class*=hint]');
    expect(leftThumb.contains(hint)).toBeTrue();
    document.dispatchEvent(fakeMouseUp);

    rightThumb.dispatchEvent(fakeMouseDown);
    expect(rightThumb.contains(hint)).toBeTrue();
    document.dispatchEvent(fakeMouseUp);

    slider.setOptions({hintAboveThumb: false});

    leftThumb.dispatchEvent(fakeMouseDown);
    expect(leftThumb.contains(hint)).toBeFalse();
    document.dispatchEvent(fakeMouseUp);

    rightThumb.dispatchEvent(fakeMouseDown);
    expect(rightThumb.contains(hint)).toBeFalse();
    document.dispatchEvent(fakeMouseUp);
  });
});

describe(`Метод "unbundFrom" позволяет отвязать привязанный 
элемент от слайдера\n`, () => {
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it(`В частности, можно отвязать даже значение 
  подсказки над кругляшом`, () => {
    const option = {
      min: -1000, max: 1000, step: 10, range: true,
      selector: '.div', className: 'slider',
      hintAboveThumb: true,
    };

    const slider = new Slider(option);

    const leftThumb = <HTMLDivElement>div.querySelector('[class*=left]');
    const scaleWidth = div.clientWidth - leftThumb.offsetWidth;

    const fakeMouseDown = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true, clientX: 0,
    });
    const fakeMouseMove = new MouseEvent('mousemove', {
      bubbles: true, cancelable: true, clientX: scaleWidth,
    });
    const fakeMouseUp = new MouseEvent('mouseup', {
      bubbles: true, cancelable: true,
    });

    leftThumb.dispatchEvent(fakeMouseDown);
    const hint = <HTMLDivElement>div.querySelector('[class*=hint]');
    expect(leftThumb.contains(hint)).toBeTrue();
    expect(slider.getOptions().thumbLeftPos).toEqual(-1000);
    document.dispatchEvent(fakeMouseUp);

    slider.unbindFrom(hint);
    leftThumb.dispatchEvent(fakeMouseDown);
    document.dispatchEvent(fakeMouseMove);
    expect(leftThumb.contains(hint)).toBeTrue();
    expect(+hint.textContent).toEqual(-1000);
  });

  it(`Можно заставить над подсказкой отображать любые значения`, () => {
    const options = {
      min: 0,
      max: 1200,
      selector: '.div',
      range: true,
      hintAboveThumb: true,
      rangeValue: ['Jan', 'Dec'],
    };

    const slider = new Slider(options);

    type fnResType = (elem: HTMLElement, leftX: number, scaledLeftX: number,
      rightX: number, scaledRightX: number, data: any) => void;

    // Пример задания вообще левых значений
    slider.unbindFrom(slider.hintEl);
    const fnMonths:
      fnResType = (elem, leftX, scaledLeftX, rightX, scaledRightX, data) => {
        const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (data.el == 'L') {
          elem.textContent = months[Math.round(scaledLeftX)];
        } else {
          elem.textContent = months[Math.round(scaledRightX)];
        }
      };
    slider.bindWith(slider.hintEl, 0, 11, fnMonths);

    const leftThumb = <HTMLDivElement>div.querySelector('[class*=left]');
    const rightThumb = <HTMLDivElement>div.querySelector('[class*=right]');
    const scaleWidth = div.clientWidth - leftThumb.offsetWidth;
    const leftRangeValue = slider._view.el.querySelector('[data-side=L]');

    let fakeMouseDown = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true, clientX: 0,
    });
    const fakeMouseUp = new MouseEvent('mouseup', {
      bubbles: true, cancelable: true,
    });
    const fameMouseClick = new MouseEvent('click', {
      cancelable: true, bubbles: true,
    });

    const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


    leftThumb.dispatchEvent(fakeMouseDown);
    expect(slider.hintEl.textContent).toEqual('Jan');

    for (let i = 1; i < 10; i++) {
      const fakeMouseMove = new MouseEvent('mousemove', {
        bubbles: true, cancelable: true, clientX: scaleWidth / 11 * i,
      });
      leftThumb.dispatchEvent(fakeMouseMove);
      expect(slider.hintEl.textContent).toEqual(months[i]);
    }

    leftThumb.dispatchEvent(fakeMouseUp);
    leftRangeValue.dispatchEvent(fameMouseClick);

    // Уберем бегунок опять в начало
    fakeMouseDown = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true, clientX: scaleWidth,
    });
    rightThumb.dispatchEvent(fakeMouseDown);

    expect(slider.hintEl.textContent).toEqual('Dec');
    for (let i = 10; i > 1; i--) {
      const fakeMouseMove = new MouseEvent('mousemove', {
        bubbles: true, cancelable: true, clientX: scaleWidth / 11 * i,
      });
      rightThumb.dispatchEvent(fakeMouseMove);

      expect(slider.hintEl.textContent).toEqual(months[i]);
    }
  });
});
