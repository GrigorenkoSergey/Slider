// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../src/assets/blocks/helpers/debugger-point';
import Model from '../src/assets/blocks/slider/components/model/model';

describe('Model\n', () => {
  describe('Первоначальная минимальная инициализация\n', () => {
    it('Можно инициализировать с необходимым минимумом аргументов: min, max', () => {
      const model = new Model({ min: 0, max: 100 });

      const modelOptions = model.getOptions() as {[key: string]: any};
      Object.keys(modelOptions).forEach((key) => {
        expect(modelOptions[key]).toBeDefined();
      });
    });

    it('Альтернативно можно инициализировать с помощью опции "alternativeRange"', () => {
      const model = new Model({ alternativeRange: ['start', 'end'] });

      const modelOptions = model.getOptions() as {[key: string]: any};
      Object.keys(modelOptions).forEach((key) => {
        expect(modelOptions[key]).toBeDefined();
      });
    });

    it(`В качестве значений опции "alternativeRange" принимается массив,
        состоящий из по-крайнеме мере двух значений`, () => {
      expect(() => new Model({ alternativeRange: [] })).toThrowError();
    });

    it('Нельзя одновременно указывать "min"/"max" и "alternativeRange" в опциях', () => {
      expect(() => new Model({ alternativeRange: ['start', 'end'], min: -10 })).toThrowError();
      expect(() => new Model({ alternativeRange: ['start', 'end'], max: 10 })).toThrowError();
      expect(() => new Model({ alternativeRange: ['start', 'end'], min: 0, max: 10 })).toThrowError();
    });

    it('Лишние свойства просто будут проигнорированы', () => {
      const option = {
        min: 0, max: 100, foo: 1, bar: 2,
      };
      const model = new Model(option);
      expect('foo' in model).toBeFalse();
      expect('bar' in model).toBeFalse();
    });

    it('Можно задавать начальные положения бегунков', () => {
      const model = new Model({
        min: 0, max: 100, thumbLeftPos: 20, thumbRightPos: 80, range: true,
      });

      expect(model.getOptions().thumbLeftPos).toEqual(20);
      expect(model.getOptions().thumbRightPos).toEqual(80);
    });

    it(`Если не задано положение левого бегунка, 
    он становится равными минимуму`, () => {
      const model = new Model({ min: -200, max: 100 });
      expect(model.getOptions().thumbLeftPos).toEqual(-200);
    });

    it(`При изменении свойства "range" свойство "thumbRightPos" автоматически
    становится равным "Infinity"`, () => {
      const model = new Model({ min: -200, max: 100 });
      expect(model.getOptions().thumbRightPos).toEqual(Infinity);

      model.setOptions({ range: true });
      expect(model.getOptions().thumbRightPos).toEqual(100);

      model.setOptions({ range: false });
      expect(model.getOptions().thumbRightPos).toEqual(Infinity);
    });

    it(`Свойства "thumbLeftPos" и "thumbRightPos" не могут 
    выйти за пределы шкалы.`, () => {
      const model = new Model({ min: 0, max: 100, step: 1 });

      model.setOptions({ thumbLeftPos: -100 });
      expect(model.getOptions().thumbLeftPos).toEqual(model.getOptions().min);

      model.setOptions({ thumbRightPos: 200, range: true });

      model.setOptions({ thumbLeftPos: -100 });
      expect(model.getOptions().thumbLeftPos).toEqual(model.getOptions().min);

      model.setOptions({ range: true, thumbLeftPos: -100, thumbRightPos: 500 });
      expect(model.getOptions().thumbLeftPos).toEqual(model.getOptions().min);
      expect(model.getOptions().thumbRightPos).toEqual(model.getOptions().max);
    });

    it(`При некратном шаге достижимые значения слайдера не могут 
    быть меньше min и больше max`, () => {
      const model = new Model({
        min: 10, max: 299, step: 3, range: true,
      });
      expect(model.getOptions().thumbLeftPos).toBeGreaterThanOrEqual(10);
      expect(model.getOptions().min).toEqual(10);
      expect(model.getOptions().thumbRightPos).toBeLessThanOrEqual(299);
      expect(model.getOptions().max).toEqual(299);
    });

    it('Проверка правильности округления', () => {
      const model = new Model({
        min: 2, max: 6, step: 4, range: false,
      });
      expect(model.setOptions({ thumbLeftPos: 2 }));
      expect(model.getOptions().thumbLeftPos).toEqual(2);
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

    it('Значение свойства "partsNum" должно быть целым положительным числом', () => {
      expect(() => model.setOptions({ partsNum: 0 })).toThrowError();
      expect(() => model.setOptions({ partsNum: 3, step: 50 })).toThrowError();
    });

    it('min + step * partsNum should be > max + step', () => {
      expect(() => model.setOptions({ step: 50, partsNum: 3 })).toThrowError();
      model.setOptions({ partsNum: 3 });
      model.setOptions({ step: 50 });
      expect(model.getOptions().partsNum).toEqual(1);

      model.setOptions({ step: 40, partsNum: 3 });
      model.setOptions({ min: 21 });
      expect(model.getOptions().partsNum).toEqual(1);
    });

    it(`Когда задано свойство "alternativeRange", потом устанавливается "min" или "max",
      свойство "alternativeRange" обнуляется (становится равным [])`, () => {
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

    it('Нельзя задать "max" меньше "thumbLeftPos, если "thumbLeftPos" задано в опциях', () => {
      expect(() => model.setOptions({ thumbLeftPos: 101, max: 100 })).toThrowError();
    });

    it(`Если "max" задан меньше, чем текущее значение "thumbLeftPos", то последнее
    либо становится минимумом, если опция "range" == true, иначе максимумом`, () => {
      model.setOptions({ thumbLeftPos: 50, range: true, thumbRightPos: 100 });
      model.setOptions({ max: 40 });
      expect(model.getOptions().thumbLeftPos).toEqual(model.getOptions().min);
      expect(model.getOptions().thumbRightPos).toEqual(model.getOptions().max);

      model.setOptions({ max: 100, thumbLeftPos: 50, range: false });
      model.setOptions({ max: 40 });
      expect(model.getOptions().thumbLeftPos).toEqual(40);
    });

    it(`Если заданный шаг слишком большой (больше диапазона), 
    выбрасываем ошибку`, () => {
      expect(() => model.setOptions({ step: 101 })).toThrowError();
      model.setOptions({ step: 50 });
      expect(() => model.setOptions({ max: 49 })).toThrowError();
    });

    it('Нельзя задать "max" меньше "thumbRightPos", если "thumbRightPos" задано в опциях', () => {
      expect(() => model.setOptions({ thumbRightPos: 101, max: 100 })).toThrowError();
    });

    it(`При задании max меньше, чем значение partsNum * step + min, 
        значение partsNum сбросится до 1, если оно было установлено до этого`, () => {
      model.setOptions({ partsNum: 20, min: 0 });
      model.setOptions({ max: 100, step: 50 });
      expect(model.getOptions().partsNum).toEqual(1);
    });

    it('Нельзя задать "thumbRightPos" больше максимума и минимума', () => {
      model.setOptions({ thumbRightPos: 1000, range: true });
      expect(model.getOptions().thumbRightPos).toEqual(100);
      expect(() => { model.setOptions({ thumbRightPos: 10, min: 20 }); }).toThrowError();
    });

    it('Нельзя задать "thumbLeftPos" меньше минимума', () => {
      model.setOptions({ thumbLeftPos: -1000 });
      expect(model.getOptions().thumbLeftPos).toEqual(0);
      model.setOptions({ thumbLeftPos: 1 });
      expect(model.getOptions().thumbLeftPos).toEqual(1);
      expect(() => model.setOptions(({ thumbLeftPos: 50, min: 51 }))).toThrowError();
    });

    it('Нельзя задать "thumbLeftPos" больше чем "thumbRightPos" и наоборот', () => {
      expect(() => model.setOptions({
        range: true,
        thumbRightPos: 10,
        thumbLeftPos: 15,
      })).toThrowError();

      model.setOptions({ thumbLeftPos: 50, range: true });
      expect(() => model.setOptions({ thumbRightPos: 49 })).toThrowError();
    });

    it(`При задании свойств "min"/"max" если бегунки оказываются за пределами, \n
          то они разбегаются по краям слайдера`, () => {
      model.setOptions({ range: true, min: 200, max: 300 });

      expect(model.getOptions().thumbLeftPos).toEqual(200);
      expect(model.getOptions().thumbRightPos).toEqual(300);
      model.setOptions({ max: 500 });
      model.setOptions({ min: 400 });
      expect(model.getOptions().thumbRightPos).toEqual(500);
    });

    it('В любой момент можно узнать значения свойств модели', () => {
      const options = model.getOptions();
      expect(options.min).toEqual(0);
      expect(options.max).toEqual(100);
      expect(options.step).toEqual(1);
      expect(options.thumbLeftPos).toEqual(0);
    });
  });

  describe('Метод "setThumbsPos"\n', () => {
    let model: Model;
    beforeEach(() => {
      model = new Model({ min: 0, max: 100, range: true });
    });

    it('Меняет положение левого и правого значений диапазона', () => {
      model.setThumbsPos({ left: 20, right: 80 });
      expect(model.getOptions().thumbLeftPos).toEqual(20);
      expect(model.getOptions().thumbRightPos).toEqual(80);
      expect(model.getOptions().min).toEqual(0);
      expect(model.getOptions().max).toEqual(100);

      model.setThumbsPos({ left: 30, right: 95 });
      expect(model.getOptions().thumbLeftPos).toEqual(30);
      expect(model.getOptions().thumbRightPos).toEqual(95);
      expect(model.getOptions().min).toEqual(0);
      expect(model.getOptions().max).toEqual(100);
    });

    it(`Минимальное значение левого бегунка равно значению свойства 
    "min", ставится автоматически`, () => {
      model.setThumbsPos({ left: -10 });
      expect(model.getOptions().thumbLeftPos).toEqual(model.getOptions().min);
    });

    it(`Максимальное значение правого диапазона равно значению свойства 
    "max", ставится автоматически`, () => {
      model.setThumbsPos({ left: model.getOptions().thumbLeftPos, right: 101 });
      expect(model.getOptions().thumbRightPos).toEqual(100);
    });

    it(`Допускается задавать только одно минимальное значение 
    диапазона`, () => {
      expect(() => model.setThumbsPos({ left: -10 })).not.toThrowError();
      expect(() => model.setThumbsPos({ right: 90 })).not.toThrowError();
    });
  });

  describe(`Model - это всего лишь функция интерполяции, поэтому она просто 
    высчитывает значения в зависимости от аргумента, который представляет 
    собой координату смещения от начала отсчета`, () => {
    let model: Model;
    beforeEach(() => {
      model = new Model({
        min: 0,
        max: 100,
        range: true,
        step: 10,
        thumbRightPos: 90,
        thumbLeftPos: 10,
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
