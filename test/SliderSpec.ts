import { Slider } from "../src/assets/blocks/mySlider/Slider";
import { debuggerPoint } from "../src/assets/blocks/mySlider/Helpers";

let style = document.createElement("style");
style.type = "text/css";

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

let div = document.createElement('div');
div.className = "div";
document.body.append(div);


describe(`Работает в принципе...\n`, () => {
    let option = {
        min: 0,
        max: 100,
        selector: ".div"
    };

    //На будущее, не стоит убирать beforeEach, afterEach, т.к. из-за асинхронной работы библиотеки
    //могут ломаться заведомо правильные тесты.

    beforeEach(() => {
        document.body.append(div);
    });

    afterEach(() => {
        div.innerHTML = "";
        div.remove();
    });

    it(`Инициализируется с минимальным количеством опций`, () => {
        expect(() => { let slider = new Slider(option) }).not.toThrowError();
        let slider = new Slider(option);
        expect(slider.update).toBeDefined();
        expect(slider.getOption).toBeDefined();
        expect(slider.setOptions).toBeDefined();
        expect(slider.bindWith).toBeDefined();
        expect(slider.setThumbsPos).toBeDefined();
        expect(slider.unbindFrom).toBeDefined();
    });

    it(`Правильно инициализируется с любым количеством опций `, () => {
        let option = {
            min: 0,
            max: 100,
            selector: ".div",
            bar: 12,
            foo: "asdf",
            thumbLeftPos: 10,
            thumbRightPos: 90,
            range: true,
            angle: 45,
            hintAboveThumb: true,
        };

        let slider = new Slider(option);
        expect(slider.getOption("min")).toEqual(0);
        expect(slider.getOption("max")).toEqual(100);
        expect(slider.getOption("step")).toEqual(1);
        expect(slider.getOption("thumbLeftPos")).toEqual(10);
        expect(slider.getOption("thumbRightPos")).toEqual(90);
        expect(slider.getOption("ticks")).toEqual({ 100: 100 });
        expect(slider.getOption("angle")).toEqual(45);
        expect(slider.getOption("range")).toBeTruthy();
        expect(slider.getOption("className")).toEqual("slider");
        expect(slider.getOption("selector")).toEqual(".div");
        expect(slider.getOption("hintAboveThumb")).toBeTruthy();
    });

    it(`Позволяет двигать бегунки`, () => {
        let option = { min: 0, max: 100, range: true, selector: ".div" };
        let slider = new Slider(option);

        slider.setThumbsPos(20, 80);
        expect(slider.getOption("thumbLeftPos")).toEqual(20);
        expect(slider.getOption("thumbRightPos")).toEqual(80);

        slider.setThumbsPos(70, 30);
        expect(slider.getOption("thumbLeftPos")).toEqual(30);
        expect(slider.getOption("thumbRightPos")).toEqual(70);

        slider.setThumbsPos(20);
        expect(slider.getOption("thumbLeftPos")).toEqual(20);
        expect(slider.getOption("thumbRightPos")).toEqual(70);

    });

    it(`Однако, если задан в функцию "setThumbsPos" передан один аргумент, проверки на корректность задания положения бегунка не делается`, () => {
        let option = { min: 0, max: 100, range: true, selector: ".div", thumbRightPos: 50 };
        let slider = new Slider(option);

        slider.setThumbsPos(90);
        expect(slider.getOption("thumbLeftPos")).toEqual(90);
        expect(slider.getOption("thumbRightPos")).toEqual(50);
    });

    it(`Можно задавать вообще любые свойства, лишние свойства будут проигнорированы`, () => {
        let option = {
            min: 0,
            max: 100,
            selector: ".div",
            bar: 12,
            foo: "asdf",
            thumbLeftPos: 10,
            thumbRightPos: 90,
            range: true,
            angle: 45,
            hintAboveThumb: true,
        };

        let slider = new Slider(option);
        slider.setOptions({ min: 20, max: 80, range: false, angle: 0 });
        expect(slider.getOption("min")).toEqual(20);
        expect(slider.getOption("max")).toEqual(80);
        expect(slider.getOption("range")).toEqual(false);
        expect(slider.getOption("angle")).toEqual(0);

        slider.setOptions({ hintAboveThumb: true });
        expect(slider.getOption("hintAboveThumb")).toBeTruthy();
    });

    it(`При попытке обращения к несуществующим свойствам функция вернет строку:
    "Option "<optionName>" doesn't exist!"`, () => {
        let slider = new Slider(option);
        expect(slider.getOption("bar")).toEqual(`Option "bar" doesn't exist!`);
        expect(slider.getOption("foo")).toEqual(`Option "foo" doesn't exist!`);
    });

});

describe(`Любые изменения View затрагивают и Model\n`, () => {
    beforeEach(() => {
        document.body.append(div);
    });

    afterEach(() => {
        div.innerHTML = "";
        div.remove();
    });

    it(`Можно двигать мышкой левый бегунок`, () => {
        let option = { min: 0, max: 1000, range: false, selector: ".div", className: "slider" };
        let slider = new Slider(option);

        let leftThumb = <HTMLDivElement>div.querySelector("[class*=left]");
        let scaleWidth = div.clientWidth - leftThumb.offsetWidth;

        let fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, });
        leftThumb.dispatchEvent(fakeMouseDown);

        let min = slider.getOption("min");
        let max = slider.getOption("max");
        let step = slider.getOption("step");

        //бежим к концу
        for (let i = 1; i < 9; i++) {
            let fakeMouseMove = new MouseEvent("mousemove", { bubbles: true, cancelable: true, clientX: i * scaleWidth / 8 });
            document.dispatchEvent(fakeMouseMove);
            //Да, мой юный друг, это связано с погрешностью округления ))
            expect(Math.abs(slider.getOption("thumbLeftPos") - (max - min) / 8 * i)).toBeLessThanOrEqual(2 * step);
        }

        let fakeMouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true });
        document.dispatchEvent(fakeMouseUp);

        //При fakeMouseDown обязательно генерировать clientX, если хочешь, к примеру, двигаться назад
        //По умолчанию clientX всегда равно 0, поэтому бегунок при fakeMouseMove будет двигаться только вперед
        fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: scaleWidth });
        leftThumb.dispatchEvent(fakeMouseDown);
        document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, cancelable: true, clientX: scaleWidth / 2 }))
        expect(Math.abs(slider.getOption("thumbLeftPos") - (max - min) / 2)).toBeLessThanOrEqual(2 * step);

    });

    it(`Можно двигать мышкой правый бегунок`, () => {
        let option = { min: -200, max: 100, range: true, selector: ".div", className: "slider" };
        let slider = new Slider(option);
        let rightThumb = <HTMLDivElement>div.querySelector("[class*=right]");
        let scaleWidth = div.clientWidth - rightThumb.offsetWidth;

        let fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: scaleWidth });
        rightThumb.dispatchEvent(fakeMouseDown);

        let min = slider.getOption("min");
        let max = slider.getOption("max");
        let step = slider.getOption("step");

        //бежим к началу
        for (let i = 7; i > 1; i--) {
            let fakeMouseMove = new MouseEvent("mousemove", { bubbles: true, cancelable: true, clientX: i * scaleWidth / 8 });
            document.dispatchEvent(fakeMouseMove);
            expect(Math.abs(slider.getOption("thumbRightPos") - ((max - min) / 8 * i + min))).toBeLessThanOrEqual(2 * step);
        }

        let fakeMouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true });
        document.dispatchEvent(fakeMouseUp);

        //Опять переместим правый бегунок в конец
        fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
        rightThumb.dispatchEvent(fakeMouseDown);
        document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, cancelable: true, clientX: scaleWidth }))
        expect(Math.abs(slider.getOption("thumbRightPos") - max)).toBeLessThanOrEqual(2 * step);
    });

    it(`Ближний к началу бегунок ВСЕГДА меняет свойство "thumbLeftPos", а ближний к концу - "thumbRightPos"`, () => {
        let option = {
            min: -500, max: 500, step: 7, range: true,
            thumbLeftPos: -100, thumbRightPos: 200,
            selector: ".div", className: "slider",
        };
        let slider = new Slider(option);

        let leftThumb = <HTMLDivElement>div.querySelector("[class*=left]");
        let rightThumb = <HTMLDivElement>div.querySelector("[class*=right]");
        let scaleWidth = div.clientWidth - rightThumb.offsetWidth;

        //уведем левый бегунок далеко вправо к концу шкалы
        let fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: 0, clientY: 0, });
        let fakeMouseMove = new MouseEvent("mousemove", { bubbles: true, cancelable: true, clientX: scaleWidth * 2, clientY: 500 })
        let fakeMouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true });

        leftThumb.dispatchEvent(fakeMouseDown);
        document.dispatchEvent(fakeMouseMove);
        document.dispatchEvent(fakeMouseUp);

        //уведем правый бегунок далеко вправо к концу шкалы
        fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: scaleWidth, clientY: 0, });
        fakeMouseMove = new MouseEvent("mousemove", { bubbles: true, cancelable: true, clientX: 0, clientY: 500 })
        fakeMouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true });

        rightThumb.dispatchEvent(fakeMouseDown);
        document.dispatchEvent(fakeMouseMove);
        document.dispatchEvent(fakeMouseUp);

        let { min, max, step } = option;
        expect(Math.abs(slider.getOption("thumbLeftPos") - min)).toBeLessThanOrEqual(step);
        expect(slider.getOption("thumbRightPos") - max).toBeLessThanOrEqual(step);
    });

    it(`Подсказка над бегунками всегда отображает корректное значение положения бегунка`, () => {
        let option = {
            min: -1000, max: 1000, step: 10, range: true,
            selector: ".div", className: "slider",
            hintAboveThumb: true,
        };

        let slider = new Slider(option);

        let leftThumb = <HTMLDivElement>div.querySelector("[class*=left]");
        let rightThumb = <HTMLDivElement>div.querySelector("[class*=right]");
        let scaleWidth = div.clientWidth - rightThumb.offsetWidth;

        //Подвигаем левый бегунок
        let fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: 0, clientY: 0, });
        let fakeMouseMove = new MouseEvent("mousemove", { bubbles: true, cancelable: true, clientX: scaleWidth / 4, clientY: 500 })
        let fakeMouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true });

        leftThumb.dispatchEvent(fakeMouseDown);
        //Подсказка появляется только после нажатия на кругляше, поэтому должно произойти mousedown для правильного выделения
        let hint = <HTMLDivElement>div.querySelector("[class*=hint]"); 

        expect(slider.getOption("thumbLeftPos")).toEqual(+hint.textContent);
        document.dispatchEvent(fakeMouseMove);

        expect(slider.getOption("thumbLeftPos")).toEqual(+hint.textContent);
        document.dispatchEvent(fakeMouseUp);

        expect(slider.getOption("thumbLeftPos")).toEqual(+hint.textContent);

        fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: scaleWidth, clientY: 0, });
        fakeMouseMove = new MouseEvent("mousemove", { bubbles: true, cancelable: true, clientX: scaleWidth * 0.75, clientY: 500 })

        rightThumb.dispatchEvent(fakeMouseDown);
        expect(slider.getOption("thumbRightPos")).toEqual(+hint.textContent);

        document.dispatchEvent(fakeMouseMove);
        expect(slider.getOption("thumbRightPos")).toEqual(+hint.textContent);

        document.dispatchEvent(fakeMouseUp);
        expect(slider.getOption("thumbRightPos")).toEqual(+hint.textContent);

    });

    it(`В любое время подсказку над бегунком можно отключить можно отключить`, () => {
        let option = {
            min: -1000, max: 1000, step: 10, range: true,
            selector: ".div", className: "slider",
            hintAboveThumb: true,
        };

        let slider = new Slider(option);

        let leftThumb = <HTMLDivElement>div.querySelector("[class*=left]");
        let rightThumb = <HTMLDivElement>div.querySelector("[class*=right]");

        let fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true});
        let fakeMouseMove = new MouseEvent("mousemove", { bubbles: true, cancelable: true});
        let fakeMouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true });

        leftThumb.dispatchEvent(fakeMouseDown);
        let hint = <HTMLDivElement>div.querySelector("[class*=hint]"); 
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

describe(`Метод "unbundFrom" позволяет отвязать привязанный элемент от слайдера\n`, () => {
    beforeEach(() => {
        document.body.append(div);
    });

    afterEach(() => {
        div.innerHTML = "";
        div.remove();
    });

    it (`В частности, можно отвязать даже значение подсказки над кругляшом`, () => {
        let option = {
            min: -1000, max: 1000, step: 10, range: true,
            selector: ".div", className: "slider",
            hintAboveThumb: true,
        };

        let slider = new Slider(option);

        let leftThumb = <HTMLDivElement>div.querySelector("[class*=left]");
        let scaleWidth = div.clientWidth - leftThumb.offsetWidth;

        let fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: 0});
        let fakeMouseMove = new MouseEvent("mousemove", { bubbles: true, cancelable: true, clientX: scaleWidth});
        let fakeMouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true });

        leftThumb.dispatchEvent(fakeMouseDown);
        let hint = <HTMLDivElement>div.querySelector("[class*=hint]"); 
        expect(leftThumb.contains(hint)).toBeTrue();
        expect(slider.getOption("thumbLeftPos")).toEqual(-1000);
        document.dispatchEvent(fakeMouseUp);

        slider.unbindFrom(hint);
        leftThumb.dispatchEvent(fakeMouseDown);
        document.dispatchEvent(fakeMouseMove);
        expect(leftThumb.contains(hint)).toBeTrue();
        expect(+hint.textContent).toEqual(-1000);
    });
});