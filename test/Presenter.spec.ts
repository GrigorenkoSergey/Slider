/* eslint-disable prefer-destructuring */
/* eslint-disable no-new */
import { Presenter } from '../src/assets/blocks/Slider/components/Presenter/Presenter';
import '../src/assets/blocks/Slider/slider.scss';

const div = document.createElement('div');
// Должен быть уникальный класс для каждого спека.
div.classList.add('divPresenterSpec');
document.body.append(div);

describe('Первоначальная минимальная реализация\n', () => {
  const selector = '.divPresenterSpec';

  afterEach(() => {
    div.innerHTML = '';
  });

  it(`Если аргументов для инициализации не достаточно,
    выбрасывает ошибку`, () => {
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
      которые принимают Model или View, при инициализации выбросит ошибку`, () => {
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
      которые принимают Model или View, при присваивании выбросит ошибку`, () => {
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
  });
});

describe('Существует метод \'slider\'. Это альтернативный способ вызова остальных методов', () => {
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

  it(`Метод presenter.getOptions() вернет то же, 
      что и presenter.slider('getOptions')`, () => {
    const presenter = new Presenter(options);

    const optsFromMainMethod = presenter.getOptions();
    const optsFromSliderMethod = presenter.slider('getOptions');
    expect(JSON.stringify(optsFromMainMethod))
      .toEqual(JSON.stringify(optsFromSliderMethod));
  });

  it(`Метод presenter.getOffsets() вернет то же, 
      что и presenter.slider('getOffsets')`, () => {
    const presenter = new Presenter(options);

    const optsFromMainMethod = presenter.getOffsets();
    const optsFromSliderMethod = presenter.slider('getOffsets');
    expect(JSON.stringify(optsFromMainMethod))
      .toEqual(JSON.stringify(optsFromSliderMethod));
  });

  it(`Метод presenter.getOffsets() вернет то же, 
      что и presenter.slider('getOffsets')`, () => {
    const presenter = new Presenter(options);

    const optsFromMainMethod = presenter.getOffsets();
    const optsFromSliderMethod = presenter.slider('getOffsets');
    expect(JSON.stringify(optsFromMainMethod))
      .toEqual(JSON.stringify(optsFromSliderMethod));
  });

  it(`Метод presenter.setOptions(opts) сделает то же, 
      что и presenter.slider('setOptions', opts)`, () => {
    const presenter = new Presenter(options);

    presenter.slider('setOptions', ({
      range: false,
      showScale: false,
      min: 0,
      max: 100,
      step: 10,
      angle: 45,
      thumbLeftValue: 50,
    }));

    const opts = presenter.getOptions();
    expect(opts.range).toEqual(false);
    expect(opts.showScale).toEqual(false);
    expect(opts.min).toEqual(0);
    expect(opts.max).toEqual(100);
    expect(opts.step).toEqual(10);
    expect(opts.thumbLeftValue).toEqual(50);
    expect(opts.angle).toEqual(45);
  });

  it('Если поддерживаемого метода не существует, выбросит ошибку', () => {
    const presenter = new Presenter(options);
    // @ts-ignore
    expect(() => presenter.slider('seizeWorldDomination!')).toThrowError();
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

    presenter.setOptions({ thumbLeftValue: 100 });
    expect(num).toEqual(100);
  });

  it(`Альтернативная подписка на изменение нашего слайдера 
     с помощью метода 'slider'`, () => {
    const presenter = new Presenter(options);
    let num = 3;

    const miniObserver = presenter.slider('onChange');

    if (!('update' in miniObserver)) throw new Error();

    miniObserver.update = () => { num = presenter.getOptions().thumbLeftValue; };

    presenter.setOptions({ thumbLeftValue: 10 });
    expect(num).toEqual(10);

    presenter.setOptions({ thumbLeftValue: 100 });
    expect(num).toEqual(100);
  });
});
