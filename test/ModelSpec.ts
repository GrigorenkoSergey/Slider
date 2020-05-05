import { Model, isIncreasing } from "../src/assets/blocks/mySlider/Model";

describe(`Model\n`, () => {

    describe(`Первоначальная минимальная инициализация\n`, () => {
        it(`Можно инициализировать с необходимым минимумом аргументов`, () => {
            let model = new Model({ min: 0, max: 100 });
            Object.keys(model).forEach((key: keyof Model) => {
                expect(model[key]).toBeDefined();
            });
        });

        it(`Лишние свойства просто будут проигнорированы`, () => {
            let option = { min: 0, max: 100, "foo": 1, "bar": 2 };
            let model = new Model(option);
            expect("foo" in model).toBeFalse();
            expect("bar" in model).toBeFalse();
        });

        it(`Если аргументов для инициализации не достаточно, выкидывает ошибку`, () => {
            expect(() => {
                let model = new Model({ min: 0 });
                return model;
            }).toThrowError();
        });


        it(`Если задан нулевой шаг, он пересчитывается и становится равным 1/100 от длины диапазона`, () => {
            let model = new Model({ min: 0, max: 100, step: 0 });
            expect(model.step).toEqual((model.max - model.min) / 100);
        });

        it(`По умолчанию свойство "thumbRightPos" всегда определено и равно максимальному значению`, () => {
            let model = new Model({ min: 0, max: 100, step: 1 });
            expect(model.thumbRightPos).toEqual(model.max);
        });

        it(`Если свойство "thumbRightPos" не задано пользователем, оно автоматически становится
        равным максимальному значению диапазона бегунка`, () => {
            let model = new Model({ min: 0, max: 100, step: 0 });
            expect(model.thumbRightPos).toEqual(model.max);
        });

        it(`Свойсто "ticks" всегда определено, даже если не задано пользователем`, () => {
            let model = new Model({ min: 0, max: 100, step: 1 });
            expect(model.ticks).toEqual({ 100: 100 });
        });

    });

    describe(`Проверка правильности задания свойств`, () => {
        let model = new Model({ max: 100, min: 0 });

        it(`Допустимо задавать свойства в виде строки`, () => {
            model.setOptions({
                min: "0", max: "100", "step": 1, "thumbLeftPos": 10,
                "thumbRightPos": 80, angle: "89", range: true
            });

            expect(model.max).toEqual(100);
            expect(model.min).toEqual(0);
            expect(model.step).toEqual(1);
            expect(model.thumbLeftPos).toEqual(10);
            expect(model.thumbRightPos).toEqual(80);
            expect(model.angle).toEqual(89);
        });

        it(`Выбрасывает ошибку, если хотя бы одно из свойств нельзя преобразовать в строку`, () => {
            let shouldBeNumbers: string[] = ["min", "max", "step", "thumbLeftPos",
                "thumbRightPos", "angle"];

            shouldBeNumbers.map(key => {
                expect(() => model.setOptions({ [key]: "1000x" })).toThrowError();
            });
        });

        it(`Значение свойства "max" должно быть больше, чем "min"`, () => {
            expect(() => model.setOptions({ min: 100, max: 0 })).toThrowError();
        });

        it(`Значение угла должно находиться в диапазоне 0...90 градусов`, () => {
            expect(() => model.setOptions({ angle: "91" })).toThrowError();
        });

        it(`Если заданный шаг слишком большой (больше диапазона), выбрасываем ошибку`, () => {
            expect(() => model.setOptions({ step: 101 })).toThrowError();
        });

        it(`Нельзя задать "thumbRightPos" больше максимума`, () => {
            model.setOptions({ thumbRightPos: 1000 });
            expect(model.thumbRightPos).toEqual(100);
        });

        it(`Нельзя задать "thumbLeftPos" меньше минимума`, () => {
            model.setOptions({ thumbLeftPos: -1000 });
            expect(model.thumbLeftPos).toEqual(0);
            model.setOptions({ thumbLeftPos: 1 });
            expect(model.thumbLeftPos).toEqual(1);
        });

        it(`Если позиции "thumbRightPos" и "thumbLeftPos" совпали, "thumbRightPos" становится равным max`, () => {
            model.setOptions({ thumbLeftPos: model.thumbRightPos });
            expect(model.thumbRightPos).toEqual(model.max);
        });
    });

    describe(`Задание нелинейной шкалы\n`, () => {
        let model = new Model({ min: 0, max: 100, ticks: { 10: 50, 20: 55, 50: 70, 100: 80 } });

        it(`При задании нелинейной шкалы последний ключ ticks должен быть равен max, иначе ошибка`, () => {
            expect(+Object.keys(model.ticks).pop()).toEqual(model.max);

            expect(() => {
                let model2 = new Model({ min: 0, max: 1000, ticks: { 10: 50, 20: 55, 50: 70, 100: 80 } });
            }).toThrowError();

            expect(() => {
                let model3 = new Model({ min: 0, max: 100, ticks: { 10: 50, 20: 55, 50: 70, 1000: 80 } });
            }).toThrowError();
        });

        it(`Первый ключ ticks должен быть больше min`, () => {
            expect(+Object.keys(model.ticks)[0]).toBeGreaterThan(model.min);

            expect(() => {
                let model2 = new Model({ min: 20, max: 100, ticks: { 10: 50, 20: 55, 50: 70, 100: 80 } });
            }).toThrowError();
        });

        it(`И ключи, и значения ticks должны быть возрастающими числовыми последовательностями`, () => {
            expect(() => {
                let model2 = new Model({ min: 0, max: 100, ticks: { 10: 2, 20: 1, 100: 5 } });
            }).toThrowError();
            expect(() => {
                let model2 = new Model({ min: 0, max: 100, ticks: { 1: 2, 30: 4, 20: 5, 100: 20 } });
            }).toThrowError();
        });

        it(`При попытке изменить max без изменения ticks получим ошибку`, () => {
            expect(() => {
                let model2 = new Model({ min: 0, max: 100, ticks: { 10: 5, 100: 7 } });
                model2.setOptions({ max: 150 });
            }).toThrowError();
            expect(() => {
                model.setOptions({ max: 150 });
            }).toThrowError();
        });

        it(`При изменении max и соответсвующем изменении ticks все пройдет гладко`, () => {
            expect(() => {
                let {...modelOptions} = model;
                let model2 = new Model(modelOptions);

                model2.setOptions({ max: 150, ticks: { 10: 20, 30: 45, 80: 50, 150: 52 } });
            }).not.toThrowError();
        });

        it(`Сброс до обычной линейной шкалы происходит заданием ticks = {}`, () => {
            model.setOptions({ticks: {}});
            expect(model.ticks).toEqual({[model.max]: 100});
            model.setOptions({max: 200});
            expect(model.max).toEqual(200);
        });
    });
});