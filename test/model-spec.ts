import {Model} from '../src/assets/blocks/slider/model';
// import {debuggerPoint} from '../src/assets/blocks/slider/Helpers';

describe(`Model\n`, () => {
  describe(`Первоначальная минимальная инициализация\n`, () => {
    it(`Можно инициализировать с необходимым минимумом аргументов`, () => {
      const model = new Model({min: 0, max: 100});
      Object.keys(model).forEach((key: keyof Model) => {
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


    it(`Если задан нулевой шаг, он пересчитывается и становится
     равным 1/100 от длины диапазона`, () => {
      const model = new Model({min: 0, max: 100, step: 0});
      expect(model.step).toEqual((model.max - model.min) / 100);
    });

    it(`Можно задавать начальные положения бегунков`, () => {
      // debuggerPoint.start = 3;
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

    it(`По умолчанию свойство "thumbRightPos" всегда определено 
    (даже если не задано пользователем) и равно максимальному значению`, () => {
      const model = new Model({min: 0, max: 100, step: 1});
      expect(model.thumbRightPos).toEqual(model.max);
    });

    it(`Свойства "thumbLeftPos" и "thumbRightPos" не могут 
    выйти за пределы шкалы.`, () => {
      const model = new Model({min: 0, max: 100, step: 1, thumbLeftPos: 200});
      expect(model.thumbLeftPos).toEqual(model.max);

      model.setOptions({thumbLeftPos: -100});
      expect(model.thumbLeftPos).toEqual(model.min);

      model.setOptions({thumbRightPos: -100});
      expect(model.thumbRightPos).toEqual(model.max);

      model.setOptions({thumbRightPos: 200});
      expect(model.thumbRightPos).toEqual(model.max);

      model.setThumbsPos(-100);
      expect(model.thumbLeftPos).toEqual(model.min);
      expect(model.thumbRightPos).toEqual(model.max);

      model.setThumbsPos(-100, 500);
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
      const model = new Model({min: 10, max: 299, step: 3});
      expect(model.thumbLeftPos).toBeGreaterThanOrEqual(10);
      expect(model.min).toEqual(10);
      expect(model.thumbRightPos).toBeLessThanOrEqual(299);
      expect(model.max).toEqual(299);
    });
  });

  describe(`Проверка правильности задания свойств`, () => {
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
      expect(model.angle).toEqual(89);
    });

    it(`Выбрасывает ошибку, если хотя бы одно из свойств нельзя 
    преобразовать в строку`, () => {
      const shouldBeNumbers: string[] = ['min', 'max', 'step', 'thumbLeftPos',
        'thumbRightPos', 'angle'];

      shouldBeNumbers.map((key) => {
        expect(() => model.setOptions({[key]: '1000x'})).toThrowError();
      });
    });

    it(`Значение свойства "max" должно быть больше, чем "min"`, () => {
      expect(() => model.setOptions({min: 100, max: 0})).toThrowError();
    });

    it(`Значение угла должно находиться в диапазоне 0...90 градусов`, () => {
      expect(() => model.setOptions({angle: '91'})).toThrowError();
    });

    it(`Если заданный шаг слишком большой (больше диапазона), 
    выбрасываем ошибку`, () => {
      expect(() => model.setOptions({step: 101})).toThrowError();
    });

    it(`Нельзя задать "thumbRightPos" больше максимума`, () => {
      model.setOptions({thumbRightPos: 1000});
      expect(model.thumbRightPos).toEqual(100);
    });

    it(`Нельзя задать "thumbLeftPos" меньше минимума`, () => {
      model.setOptions({thumbLeftPos: -1000});
      expect(model.thumbLeftPos).toEqual(0);
      model.setOptions({thumbLeftPos: 1});
      expect(model.thumbLeftPos).toEqual(1);
    });

    it(`Если позиции "thumbRightPos" и "thumbLeftPos" совпали, 
    "thumbRightPos" становится равным max`, () => {
      model.setOptions({thumbLeftPos: model.thumbRightPos});
      expect(model.thumbRightPos).toEqual(model.max);
    });

    it(`Технически можно задавать напрямую значения свойств, 
    но это не рекомендуется т.к. внутренние механизмы проверки 
    правильности свойств не будут работать`, () => {
      model.max = -10;
      expect(model.min).toEqual(0);
      expect(model.max).toEqual(-10);
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

    it(`При попытке изменить max без изменения ticks получим ошибку`, () => {
      expect(() => {
        const model = new Model({min: 0, max: 100, ticks: {10: 5, 100: 7}});
        model.setOptions({max: 150});
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

    it(`Сброс до обычной линейной шкалы происходит заданием ticks = {}`, () => {
      const model = new Model({
        min: 0, max: 100, ticks: {10: 50, 20: 55, 50: 70, 100: 80},
      });

      model.setOptions({ticks: {}});
      expect(model.ticks).toEqual({[model.max]: 100});
      model.setOptions({max: 200});
      expect(model.max).toEqual(200);
    });
  });

  describe(`Метод "setThumbsPos"\n`, () => {
    let model: Model;
    beforeEach(() => {
      model = new Model({min: 0, max: 100, range: true});
    });

    it(`Меняет положение левого и правого значений диапазона`, () => {
      model.setThumbsPos(20, 80);
      expect(model.thumbLeftPos).toEqual(20);
      expect(model.thumbRightPos).toEqual(80);
      expect(model.min).toEqual(0);
      expect(model.max).toEqual(100);

      model.setThumbsPos(30, 95);
      expect(model.thumbLeftPos).toEqual(30);
      expect(model.thumbRightPos).toEqual(95);
      expect(model.min).toEqual(0);
      expect(model.max).toEqual(100);
    });

    it(`Если левое значение всегда ближе к началу, а правое к концу, 
    меняются автоматически`, () => {
      model.setThumbsPos(90, 20);
      expect(model.thumbLeftPos).toEqual(20);
      expect(model.thumbRightPos).toEqual(90);
    });

    it(`Минимальное значение левого бегунка равно значению свойства 
    "min", ставится автоматически`, () => {
      model.setThumbsPos(-10);
      expect(model.thumbLeftPos).toEqual(model.min);
    });

    it(`Максимальное значение правого диапазона равно значению свойства 
    "max", ставится автоматически`, () => {
      model.setThumbsPos(model.thumbLeftPos, 101);
      expect(model.thumbRightPos).toEqual(100);
    });

    it(`Допускается задавать только одно минимальное значение 
    диапазона`, () => {
      expect(() => model.setThumbsPos(-10)).not.toThrowError();
    });

    it(`Если значение границы диапазона не кратно шагу, 
    оно округляется`, () => {
      model.setOptions({step: 10});
      model.setThumbsPos(6, 94);
      expect(model.thumbLeftPos).toEqual(10);
      expect(model.thumbRightPos).toEqual(90);
    });
  });

  describe(`Обновление состояния, метод "update"\n`, () => {
    let model: Model;
    beforeEach(() => {
      model = new Model({
        min: 0, max: 100, range: true, step: 10,
        thumbRightPos: 10, thumbLeftPos: 90,
      });
    });

    it(`Model - это всего лишь функция интерполяции, поэтому она просто 
    высчитывает значения в зависимости от аргумента, который представляет 
    собой координату смещения от начала отсчета`, () => {
      model.update('event', {el: 'L', offset: 0});
      expect(model.thumbLeftPos).toEqual(0);

      model.update('event', {el: 'L', offset: 0.5});
      expect(model.thumbLeftPos).toEqual(50);

      model.update('event', {el: 'L', offset: 1});
      expect(model.thumbLeftPos).toEqual(100);

      model.update('event', {el: 'L', offset: 0});
      model.update('event', {el: 'R', offset: 0.5});
      expect(model.thumbRightPos).toEqual(50);

      model.update('event', {el: 'R', offset: 0.7});
      expect(model.thumbRightPos).toEqual(70);
    });

    it(`ВАЖНО!!! Корректность значений data никак не обрабатывается 
    при update (для скорости)`, () => {
      model.update('', {el: 'R', offset: 0.5});
      model.update('', {el: 'L', offset: 0.9});
      expect(model.thumbLeftPos).toEqual(90);
      expect(model.thumbRightPos).toEqual(50);
    });

    it(`Корректно вычисляет значения функции для нелинейной шкалы.
        К примеру, у нас товары по цене от 100 до 200 рублей. 
        50% товаров находятся в ценовом диапазоне от 100 до 120 рублей,
        25% товаров в диапазоне от 120 до 150 рублей,
        25% товаров в диапазоне от 150 до 200 рублей.`, () => {
      model.setOptions({min: 100, max: 200, step: 1});
      model.setOptions({ticks: {120: 50, 150: 75, 200: 100}});

      model.update('', {el: 'L', offset: 0});
      expect(model.thumbLeftPos).toEqual(100);

      model.update('', {el: 'L', offset: 0.25});
      expect(model.thumbLeftPos).toEqual(110);

      model.update('', {el: 'L', offset: 0.5});
      expect(model.thumbLeftPos).toEqual(120);

      model.update('', {el: 'L', offset: (0.5 + 0.75) / 2});
      expect(model.thumbLeftPos).toEqual(135);

      model.update('', {el: 'L', offset: 0.75});
      expect(model.thumbLeftPos).toEqual(150);

      model.update('', {el: 'L', offset: (0.75 + 1) / 2});
      expect(model.thumbLeftPos).toEqual(175);

      model.update('', {el: 'L', offset: 1});
      expect(model.thumbLeftPos).toEqual(200);

      model.update('', {el: 'L', offset: 0});
      expect(model.thumbLeftPos).toEqual(100);

      model.update('', {el: 'R', offset: 0.25});
      expect(model.thumbRightPos).toEqual(110);

      model.update('', {el: 'R', offset: 0.5});
      expect(model.thumbRightPos).toEqual(120);

      model.update('', {el: 'R', offset: (0.5 + 0.75) / 2});
      expect(model.thumbRightPos).toEqual(135);

      model.update('', {el: 'R', offset: 0.75});
      expect(model.thumbRightPos).toEqual(150);

      model.update('', {el: 'R', offset: (0.75 + 1) / 2});
      expect(model.thumbRightPos).toEqual(175);

      model.update('', {el: 'R', offset: 1});
      expect(model.thumbRightPos).toEqual(200);
    });
  });

  describe(`Метод getThumbsOffset предназначен для получения 
  положения бегунков\n`, () => {
    const model = new Model({min: 0, max: 100});

    it(`В любой момент времени можно получить расширенную 
    информацию о положении бегунков`, () => {
      expect(model.getThumbsOffset().L.x).toEqual(model.thumbLeftPos);
      expect(model.getThumbsOffset().R.x).toEqual(model.thumbRightPos);
      expect(model.getThumbsOffset().L.offset).toEqual(0);
      expect(model.getThumbsOffset().R.offset).toEqual(1);

      model.update('', {el: 'L', offset: 0.3});
      expect(model.getThumbsOffset().L.x).toEqual(30);
      expect(model.getThumbsOffset().R.x).toEqual(100);
      expect(model.getThumbsOffset().L.offset).toEqual(.3);
      expect(model.getThumbsOffset().R.offset).toEqual(1);

      model.update('', {el: 'R', offset: 0.7});
      expect(model.getThumbsOffset().L.x).toEqual(30);
      expect(model.getThumbsOffset().R.x).toEqual(70);
      expect(model.getThumbsOffset().L.offset).toEqual(.3);
      expect(model.getThumbsOffset().R.offset).toEqual(0.7);
    });
  });
});
