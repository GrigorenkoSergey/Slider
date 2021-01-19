import { MODEL_OPTIONS_DEFAULT } from
  '../src/assets/blocks/slider/components/model/components/model-options-default';
import Model from '../src/assets/blocks/slider/components/model/model';

describe('Model\n', () => {
  describe('Первоначальная минимальная инициализация\n', () => {
    it('Можно инициализировать пустым объектом', () => {
      const model = new Model({});

      const modelOptions = model.getOptions();
      expect(modelOptions.alternativeRange).toBeDefined();
      expect(modelOptions.max).toBeDefined();
      expect(modelOptions.min).toBeDefined();
      expect(modelOptions.partsAmount).toBeDefined();
      expect(modelOptions.precision).toBeDefined();
      expect(modelOptions.range).toBeDefined();
      expect(modelOptions.step).toBeDefined();
      expect(modelOptions.thumbLeftValue).toBeDefined();
      expect(modelOptions.thumbRightValue).toBeDefined();
    });

    it(`В качестве значений опции "alternativeRange" принимается массив,
        состоящий из, по-крайней мере, двух значений`, () => {
      expect(() => new Model({ alternativeRange: [] })).toThrowError();
    });

    it('Нельзя одновременно указывать "min"/"max" и "alternativeRange" в опциях', () => {
      expect(() => new Model({ alternativeRange: ['start', 'end'], min: -10 })).toThrowError();
      expect(() => new Model({ alternativeRange: ['start', 'end'], max: 10 })).toThrowError();
      expect(() => new Model({ alternativeRange: ['start', 'end'], min: 0, max: 10 })).toThrowError();
    });

    it('Лишние свойства просто будут проигнорированы', () => {
      const options = {
        min: 0, max: 100, foo: 1, bar: 2,
      };
      const model = new Model(options);
      expect('foo' in model).toBeFalse();
      expect('bar' in model).toBeFalse();
    });

    it('Можно задавать начальные положения бегунков', () => {
      const model = new Model({
        min: 0, max: 100, thumbLeftValue: 20, thumbRightValue: 80, range: true,
      });

      expect(model.getOptions().thumbLeftValue).toEqual(20);
      expect(model.getOptions().thumbRightValue).toEqual(80);
    });

    it(`Если не задано положение левого бегунка, 
    он становится равным "min"`, () => {
      const model = new Model({ min: -200, max: 100 });
      expect(model.getOptions().thumbLeftValue).toEqual(-200);
    });

    it(`При изменении свойства "range" свойство "thumbRightValue" автоматически
    становится равным "null"`, () => {
      const model = new Model({ min: -200, max: 100 });
      expect(model.getOptions().thumbRightValue).toEqual(null);

      model.setOptions({ range: true });
      expect(model.getOptions().thumbRightValue).toEqual(100);

      model.setOptions({ range: false });
      expect(model.getOptions().thumbRightValue).toEqual(null);
    });

    it(`Свойства "thumbLeftValue" и "thumbRightValue" не могут 
    выйти за пределы шкалы.`, () => {
      const model = new Model({ min: 0, max: 100, step: 1 });

      model.setOptions({ thumbLeftValue: -100 });
      expect(model.getOptions().thumbLeftValue).toEqual(model.getOptions().min);

      model.setOptions({ thumbRightValue: 200, range: true });

      model.setOptions({ thumbLeftValue: -100 });
      expect(model.getOptions().thumbLeftValue).toEqual(model.getOptions().min);

      model.setOptions({ range: true, thumbLeftValue: -100, thumbRightValue: 500 });
      expect(model.getOptions().thumbLeftValue).toEqual(model.getOptions().min);
      expect(model.getOptions().thumbRightValue).toEqual(model.getOptions().max);
    });

    it(`При некратном шаге достижимые значения слайдера не могут 
    быть меньше "min" и больше "max"`, () => {
      const model = new Model({
        min: 10, max: 299, step: 3, range: true,
      });
      expect(model.getOptions().thumbLeftValue).toBeGreaterThanOrEqual(10);
      expect(model.getOptions().min).toEqual(10);
      expect(model.getOptions().thumbRightValue).toBeLessThanOrEqual(299);
      expect(model.getOptions().max).toEqual(299);
    });

    it('Проверка правильности округления', () => {
      const model = new Model({
        min: 2, max: 6, step: 4, range: false,
      });
      expect(model.setOptions({ thumbLeftValue: 2 }));
      expect(model.getOptions().thumbLeftValue).toEqual(2);
    });
  });

  describe('Проверка правильности задания свойств\n', () => {
    let model: Model;

    beforeEach(() => {
      model = new Model({ max: 100, min: 0 });
    });

    it('Значение свойства "precision" - целое число в пределах [0, 3]', () => {
      expect(() => model.setOptions({ precision: -0.5 })).toThrowError();

      model.setOptions({ precision: 0 });
      expect(model.getOptions().precision).toEqual(0);
      model.setOptions({ precision: 1 });
      expect(model.getOptions().precision).toEqual(1);
    });

    it('Значение свойства "partsAmount" должно быть целым положительным числом', () => {
      expect(() => model.setOptions({ partsAmount: 0 })).toThrowError();
      expect(() => model.setOptions({ partsAmount: 3, step: 50 })).toThrowError();
    });

    it('Результат min + step * partsAmount должен быть > max + step', () => {
      expect(() => model.setOptions({ step: 50, partsAmount: 3 })).toThrowError();
      model.setOptions({ partsAmount: 3 });
      model.setOptions({ step: 50 });
      expect(model.getOptions().partsAmount).toEqual(1);

      model.setOptions({ step: 40, partsAmount: 3 });
      model.setOptions({ min: 21 });
      expect(model.getOptions().partsAmount).toEqual(1);
    });

    it(`Когда сначала задано свойство "alternativeRange", а потом устанавливается "min" 
      или "max", свойство "alternativeRange" сбрасывается и становится равным []`, () => {
      model.setOptions({ alternativeRange: ['start', 'end'] });
      expect(model.getOptions().alternativeRange).toEqual(['start', 'end']);
      model.setOptions({ min: -10 });
      expect(model.getOptions().min).toEqual(-10);
      expect(model.getOptions().alternativeRange).toEqual([]);

      model.setOptions({ alternativeRange: ['start', 'end'] });
      expect(model.getOptions().alternativeRange).toEqual(['start', 'end']);
      model.setOptions({ max: 100 });
      expect(model.getOptions().max).toEqual(100);
      expect(model.getOptions().alternativeRange).toEqual([]);
    });

    it('Шаг должен быть положительным', () => {
      expect(() => model.setOptions({ step: -1 })).toThrowError();
      expect(() => model.setOptions({ step: 0 })).toThrowError();
    });

    it('Значение свойства "max" должно быть больше, чем "min"', () => {
      expect(() => model.setOptions({ min: 100, max: 0 })).toThrowError();
      expect(() => model.setOptions({ max: 0 })).toThrowError();
    });

    it('Нельзя задать "max" меньше "thumbLeftValue, если "thumbLeftValue" задано в опциях', () => {
      expect(() => model.setOptions({ thumbLeftValue: 101, max: 100 })).toThrowError();
    });

    it(`Если "max" задан меньше, чем текущее значение "thumbLeftValue", то последнее
    либо становится минимумом, если опция "range" == true, либо максимумом`, () => {
      model.setOptions({ thumbLeftValue: 50, range: true, thumbRightValue: 100 });
      model.setOptions({ max: 40 });
      expect(model.getOptions().thumbLeftValue).toEqual(model.getOptions().min);
      expect(model.getOptions().thumbRightValue).toEqual(model.getOptions().max);

      model.setOptions({ max: 100, thumbLeftValue: 50, range: false });
      model.setOptions({ max: 40 });
      expect(model.getOptions().thumbLeftValue).toEqual(40);
    });

    it(`Если заданный шаг слишком большой (больше диапазона), 
    выбрасываем ошибку`, () => {
      expect(() => model.setOptions({ step: 101 })).toThrowError();
      model.setOptions({ step: 50 });
      expect(() => model.setOptions({ max: 49 })).toThrowError();
    });

    it('Нельзя задать "max" меньше "thumbRightValue", если "thumbRightValue" задано в опциях', () => {
      expect(() => model.setOptions({ thumbRightValue: 101, max: 100 })).toThrowError();
    });

    it(`При задании max меньше, чем значение partsAmount * step + min, 
        значение partsAmount сбросится до 1, если оно было установлено до этого`, () => {
      model.setOptions({ partsAmount: 20, min: 0 });
      model.setOptions({ max: 100, step: 50 });
      expect(model.getOptions().partsAmount).toEqual(1);
    });

    it('Нельзя задать "thumbRightValue" больше максимума и меньше минимума', () => {
      model.setOptions({ thumbRightValue: 1000, range: true });
      expect(model.getOptions().thumbRightValue).toEqual(100);
      expect(() => { model.setOptions({ thumbRightValue: 10, min: 20 }); }).toThrowError();
    });

    it('Нельзя задать "thumbLeftValue" меньше минимума', () => {
      model.setOptions({ thumbLeftValue: -1000 });
      expect(model.getOptions().thumbLeftValue).toEqual(0);
      model.setOptions({ thumbLeftValue: 1 });
      expect(model.getOptions().thumbLeftValue).toEqual(1);
      expect(() => model.setOptions(({ thumbLeftValue: 50, min: 51 }))).toThrowError();
    });

    it('Нельзя задать "thumbLeftValue" больше чем "thumbRightValue" и наоборот', () => {
      expect(() => model.setOptions({
        range: true,
        thumbRightValue: 10,
        thumbLeftValue: 15,
      })).toThrowError();

      model.setOptions({ thumbLeftValue: 50, range: true });
      expect(() => model.setOptions({ thumbRightValue: 49 })).toThrowError();
    });

    it(`При задании свойств "min"/"max" если бегунки оказываются за пределами
      новых значений шкалы, то они устанавливаются по краям слайдера`, () => {
      model.setOptions({ range: true, min: 200, max: 300 });

      expect(model.getOptions().thumbLeftValue).toEqual(200);
      expect(model.getOptions().thumbRightValue).toEqual(300);
      model.setOptions({ max: 500 });
      model.setOptions({ min: 400 });
      expect(model.getOptions().thumbRightValue).toEqual(500);
    });

    it('В любой момент можно узнать значения свойств модели', () => {
      const options = model.getOptions();
      expect(Object.keys(options).every((key) => key in MODEL_OPTIONS_DEFAULT))
        .toBeTrue();
    });
  });

  describe('Метод "setThumbsPos"\n', () => {
    let model: Model;
    beforeEach(() => {
      model = new Model({ min: 0, max: 100, range: true });
    });

    it('Меняет положение левого и правого значений диапазона', () => {
      model.setThumbsPos({ left: 20, right: 80 });
      expect(model.getOptions().thumbLeftValue).toEqual(20);
      expect(model.getOptions().thumbRightValue).toEqual(80);

      model.setThumbsPos({ left: 30, right: 95 });
      expect(model.getOptions().thumbLeftValue).toEqual(30);
      expect(model.getOptions().thumbRightValue).toEqual(95);
    });

    it(`Минимальное значение положения левого бегунка равно значению свойства
     "min", при необходимости ставится автоматически`, () => {
      model.setThumbsPos({ left: -10 });
      expect(model.getOptions().thumbLeftValue).toEqual(model.getOptions().min);
    });

    it(`Максимальное значение положения правого бегунка равно значению свойства 
    "max", при необходимости ставится автоматически`, () => {
      model.setThumbsPos({ left: model.getOptions().thumbLeftValue, right: 101 });
      expect(model.getOptions().thumbRightValue).toEqual(100);
    });

    it(`Допускается задавать только одно минимальное значение 
    диапазона`, () => {
      expect(() => model.setThumbsPos({ left: -10 })).not.toThrowError();
      expect(() => model.setThumbsPos({ right: 90 })).not.toThrowError();
    });
  });

  describe(`Model - это всего лишь функция интерполяции, поэтому она просто 
    высчитывает значения в зависимости от аргумента, который представляет 
    собой координату смещения от начала отсчета\n`, () => {
    let model: Model;

    beforeEach(() => {
      model = new Model({
        min: 0,
        max: 100,
        range: true,
        step: 10,
        thumbRightValue: 90,
        thumbLeftValue: 10,
      });
    });

    it('Всегда можем найти значение функции от аргумента', () => {
      expect(model.findValue(0)).toEqual(0);
      expect(model.findValue(0.5)).toEqual(50);
      expect(model.findValue(1)).toEqual(100);
      expect(model.findValue(0.5)).toEqual(50);
      expect(model.findValue(0.7)).toEqual(70);
    });

    it('Всегда можем найти значение аргумента в зависимости от значения функции', () => {
      expect(model.findArgument(0)).toEqual(0);
      expect(model.findArgument(50)).toEqual(0.5);
      expect(model.findArgument(100)).toEqual(1);
      expect(model.findArgument(50)).toEqual(0.5);
      expect(model.findArgument(70)).toEqual(0.7);
    });
  });
});
