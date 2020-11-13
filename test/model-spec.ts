// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../src/assets/blocks/helpers/debugger-point';
import Model from '../src/assets/blocks/slider/components/model/model';

describe(`Model\n`, () => {
  describe(`Первоначальная минимальная инициализация\n`, () => {
    it(`Можно инициализировать с необходимым минимумом аргументов: min, max`, () => {
      const model = new Model({min: 0, max: 100});
      Object.keys(model).forEach((key: keyof Model) => {
        if (key === 'thumbRightPos') return;
        expect(model[key]).toBeDefined();
      });
    });

    it(`Лишние свойства просто будут проигнорированы`, () => {
      const option = {'min': 0, 'max': 100, 'foo': 1, 'bar': 2};
      const model = new Model(option);
      expect('foo' in model).toBeFalse();
      expect('bar' in model).toBeFalse();
    });

    it(`Если аргументов для инициализации не достаточно, 
    выкидывает ошибку`, () => {
      expect(() => {
        new Model({min: 0});
      }).toThrowError();
    });

    it(`Можно задавать начальные положения бегунков`, () => {
      const model = new Model({
        min: 0, max: 100, thumbLeftPos: 20, thumbRightPos: 80, range: true,
      });

      expect(model.thumbLeftPos).toEqual(20);
      expect(model.thumbRightPos).toEqual(80);
    });

    it(`Если не задано положение левого бегунка, 
    он становится равными минимуму`, () => {
      const model = new Model({min: -200, max: 100});
      expect(model.thumbLeftPos).toEqual(-200);
    });

    it(`При изменении свойства "range" свойство "thumbRightPos" автоматически
    становится равным "Infinity"`, () => {
      const model = new Model({min: -200, max: 100});
      expect(model.thumbRightPos).toEqual(Infinity);

      model.setOptions({range: true});
      expect(model.thumbRightPos).toEqual(100);

      model.setOptions({range: false});
      expect(model.thumbRightPos).toEqual(Infinity);
    });

    it(`Свойства "thumbLeftPos" и "thumbRightPos" не могут 
    выйти за пределы шкалы.`, () => {
      const model = new Model({min: 0, max: 100, step: 1});

      model.setOptions({thumbLeftPos: -100});
      expect(model.thumbLeftPos).toEqual(model.min);

      model.setOptions({thumbRightPos: 200, range: true});

      model.setOptions({thumbLeftPos: -100});
      expect(model.thumbLeftPos).toEqual(model.min);

      model.setOptions({range: true, thumbLeftPos: -100, thumbRightPos: 500});
      expect(model.thumbLeftPos).toEqual(model.min);
      expect(model.thumbRightPos).toEqual(model.max);
    });

    it(`Свойсто "ticks" всегда определено, даже если
     не задано пользователем`, () => {
      const model = new Model({min: 0, max: 100, step: 1});
      expect(model.ticks).toEqual({100: 100});
    });

    it(`При некратном шаге достижимые значения слайдера не могут 
    быть меньше min и больше max`, () => {
      const model = new Model({min: 10, max: 299, step: 3, range: true});
      expect(model.thumbLeftPos).toBeGreaterThanOrEqual(10);
      expect(model.min).toEqual(10);
      expect(model.thumbRightPos).toBeLessThanOrEqual(299);
      expect(model.max).toEqual(299);
    });

    it(`Проверка правильности округления`, () => {
      const model = new Model({min: 2, max: 6, step: 4, range: false});
      expect(model.setOptions({thumbLeftPos: 2}));
      expect(model.thumbLeftPos).toEqual(2);
    });
  });

  describe(`Проверка правильности задания свойств\n`, () => {
    let model: Model;

    beforeEach(() => {
      model = new Model({max: 100, min: 0});
    });

    it(`Допустимо задавать свойства в виде строки`, () => {
      model.setOptions({
        'min': '0', 'max': '100', 'step': 1, 'thumbLeftPos': 10,
        'thumbRightPos': 80, 'angle': '89', 'range': true,
      });

      expect(model.max).toEqual(100);
      expect(model.min).toEqual(0);
      expect(model.step).toEqual(1);
      expect(model.thumbLeftPos).toEqual(10);
      expect(model.thumbRightPos).toEqual(80);
    });

    it(`Шаг не может быть отрицательным`, () => {
      expect( () => model.setOptions({step: -1})).toThrowError();
    });

    it(`Значение свойства "max" должно быть больше, чем "min"`, () => {
      expect(() => model.setOptions({min: 100, max: 0})).toThrowError();
    });

    it(`Нельзя задать "max" меньше "thumbLeftPos, если "thumbLeftPos" задано в опциях`, () => {
      expect(() => model.setOptions({thumbLeftPos: 101, max: 100})).toThrowError();
    });

    it(`Если "max" задан меньше, чем текущее значение "thumbLeftPos", то последнее
    либо становится минимумом, если опция "range" == true, иначе максимумом`, () => {
      
      model.setOptions({thumbLeftPos: 50, range: true, thumbRightPos: 100});
      model.setOptions({max: 40});
      expect(model.thumbLeftPos).toEqual(model.min);
      expect(model.thumbRightPos).toEqual(model.max);

      model.setOptions({max: 100, thumbLeftPos: 50, range: false});
      model.setOptions({max: 40});
      expect(model.thumbLeftPos).toEqual(40);
    });

    it(`Если заданный шаг слишком большой (больше диапазона), 
    выбрасываем ошибку`, () => {
      expect(() => model.setOptions({step: 101})).toThrowError();
    });

    it(`Нельзя задать "max" меньше "thumbRightPos", если "thumbRightPos" задано в опциях`, () => {
      expect(() => model.setOptions({thumbRightPos: 101, max: 100})).toThrowError();
    });

    it(`Нельзя задать "thumbRightPos" больше максимума`, () => {
      model.setOptions({thumbRightPos: 1000, range: true});
      expect(model.thumbRightPos).toEqual(100);
    });

    it(`Нельзя задать "thumbLeftPos" меньше минимума`, () => {
      model.setOptions({thumbLeftPos: -1000});
      expect(model.thumbLeftPos).toEqual(0);
      model.setOptions({thumbLeftPos: 1});
      expect(model.thumbLeftPos).toEqual(1);
    });


    it (`При задании свойств "min"/"max" если бегунки оказываются за пределами, \n
          то они разбегаются по краям слайдера`, () => {
      model.setOptions({range: true, min: 200, max: 300});

      expect(model.thumbLeftPos).toEqual(200);
      expect(model.thumbRightPos).toEqual(300);
      
    });
    it(`Технически можно задавать напрямую значения свойств, 
    но это не рекомендуется т.к. внутренние механизмы проверки 
    правильности свойств не будут работать`, () => {
      model.max = -10;
      expect(model.min).toEqual(0);
      expect(model.max).toEqual(-10);
    });

    it(`В любой момент можно узнать значения свойств модели`, () => {
      const options = model.getOptions();
      expect(options.min).toEqual(0);
      expect(options.max).toEqual(100);
      expect(options.step).toEqual(1);
      expect(options.thumbLeftPos).toEqual(0);
    });
  });
  
  describe(`Задание нелинейной шкалы\n`, () => {
    it(`При задании нелинейной шкалы последний ключ ticks 
    должен быть равен max, иначе ошибка`, () => {
      const model = new Model({
        min: 0, max: 100, ticks: {10: 50, 20: 55, 50: 70, 100: 80},
      });
      expect(+Object.keys(model.ticks).pop()).toEqual(model.max);

      expect(() => {
        new Model({
          min: 0, max: 1000, ticks: {10: 50, 20: 55, 50: 70, 100: 80},
        });
      }).toThrowError();

      expect(() => {
        new Model({
          min: 0, max: 100, ticks: {10: 50, 20: 55, 50: 70, 1000: 80},
        });
      }).toThrowError();
    });

    it(`Первый ключ ticks должен быть больше min`, () => {
      const model = new Model({
        min: 0, max: 100, ticks: {10: 50, 20: 55, 50: 70, 100: 80},
      });

      expect(+Object.keys(model.ticks)[0]).toBeGreaterThan(model.min);

      expect(() => {
        new Model({
          min: 20, max: 100, ticks: {10: 50, 20: 55, 50: 70, 100: 80},
        });
      }).toThrowError();
    });

    it(`И ключи, и значения ticks должны быть возрастающими 
    числовыми последовательностями`, () => {
      expect(() => {
        new Model({min: 0, max: 100, ticks: {10: 2, 20: 1, 100: 5}});
      }).toThrowError();

      expect(() => {
        new Model({min: 0, max: 100, ticks: {1: 2, 30: 4, 20: 5, 100: 20}});
      }).toThrowError();
    });

    it(`При изменении max и соответсвующем изменении 
    ticks все пройдет гладко`, () => {
      const model = new Model({
        min: 0, max: 100, ticks: {10: 50, 20: 55, 50: 70, 100: 80},
      });

      expect(() => {
        model.setOptions({max: 150, ticks: {10: 20, 30: 45, 80: 50, 150: 52}});
      }).not.toThrowError();
    });
  });

  describe(`Метод "setThumbsPos"\n`, () => {
    let model: Model;
    beforeEach(() => {
      model = new Model({min: 0, max: 100, range: true});
    });

    it(`Меняет положение левого и правого значений диапазона`, () => {
      model.setThumbsPos({left: 20, right: 80});
      expect(model.thumbLeftPos).toEqual(20);
      expect(model.thumbRightPos).toEqual(80);
      expect(model.min).toEqual(0);
      expect(model.max).toEqual(100);

      model.setThumbsPos({left: 30, right: 95});
      expect(model.thumbLeftPos).toEqual(30);
      expect(model.thumbRightPos).toEqual(95);
      expect(model.min).toEqual(0);
      expect(model.max).toEqual(100);
    });

    it(`Минимальное значение левого бегунка равно значению свойства 
    "min", ставится автоматически`, () => {
      model.setThumbsPos({left: -10});
      expect(model.thumbLeftPos).toEqual(model.min);
    });

    it(`Максимальное значение правого диапазона равно значению свойства 
    "max", ставится автоматически`, () => {
      model.setThumbsPos({left: model.thumbLeftPos, right: 101});
      expect(model.thumbRightPos).toEqual(100);
    });

    it(`Допускается задавать только одно минимальное значение 
    диапазона`, () => {
      expect(() => model.setThumbsPos({left: -10})).not.toThrowError();
    });
  });

  describe(`Model - это всего лишь функция интерполяции, поэтому она просто 
    высчитывает значения в зависимости от аргумента, который представляет 
    собой координату смещения от начала отсчета`, () => {
    let model: Model;
    beforeEach(() => {
      model = new Model({
        min: 0, max: 100, range: true, step: 10,
        thumbRightPos: 90, thumbLeftPos: 10,
      });
    });

    it(`Всегда можем найти значение функции от аргумента`, () => {
      expect(model.findValue(0)).toEqual(0);
      expect(model.findValue(0.5)).toEqual(50);
      expect(model.findValue(1)).toEqual(100);
      expect(model.findValue(0.5)).toEqual(50);
      expect(model.findValue(0.7)).toEqual(70);
    });

    it(`Всегда можем найти значение аргумента в зависимости от значения функции`, () => {
      expect(model.findArgument(0)).toEqual(0);
      expect(model.findArgument(50)).toEqual(0.5);
      expect(model.findArgument(100)).toEqual(1);
      expect(model.findArgument(50)).toEqual(0.5);
      expect(model.findArgument(70)).toEqual(0.7);
    });

    it(`Корректно вычисляет значения функции для нелинейной шкалы.
        К примеру, у нас товары по цене от 100 до 200 рублей. 
        50% товаров находятся в ценовом диапазоне от 100 до 120 рублей,
        25% товаров в диапазоне от 120 до 150 рублей,
        25% товаров в диапазоне от 150 до 200 рублей.`, () => {
      model.setOptions({min: 100, max: 200, step: 1});
      model.setOptions({ticks: {120: 50, 150: 75, 200: 100}});

      expect(model.findValue(0)).toEqual(100);
      expect(model.findValue(0.25)).toEqual(110);
      expect(model.findValue(0.5)).toEqual(120);
      expect(model.findValue((0.5 + 0.75) / 2)).toEqual(135);
      expect(model.findValue(0.75)).toEqual(150);
      expect(model.findValue((0.75 + 1) / 2)).toEqual(175);
      expect(model.findValue(1)).toEqual(200);

      expect(model.findArgument(100)).toEqual(0);
      expect(model.findArgument(110)).toEqual(0.25);
      expect(model.findArgument(120)).toEqual(0.5);
      expect(model.findArgument(135)).toEqual((0.5 + 0.75) / 2);
      expect(model.findArgument(150)).toEqual(0.75);
      expect(model.findArgument(175)).toEqual((0.75 + 1) / 2);
      expect(model.findArgument(200)).toEqual(1);
    });
  });
});
