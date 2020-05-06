import { Slider } from "../src/assets/blocks/mySlider/Slider";
import { debuggerPoint } from "../src/assets/blocks/mySlider/Helpers";

describe(`Работает в принципе...\n`, () => {
    let option = {
        min: 0,
        max: 100,
        selector: ".div"
    };

    let div = document.createElement('div');
    div.className = "div";

    beforeEach(() => {
        document.body.append(div);
        // let slider = new Slider(option);
    });

    afterEach(() => {
        div.innerHTML = "";
        div.remove()
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

    it(`Можно задавать вообще любые свойства`, () => {
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
});


// describe(`Любые изменения View затрагивают и Model`, () => {
//     let div = document.createElement('div');
//     div.className = "div";

//     beforeEach(() => {
//         document.body.append(div);
//         let option = { min: 0, max: 100, range: true, selector: ".div", className: "slider" };
//         let slider = new Slider(option);
//     });

//     afterEach(() => {
//         div.innerHTML = "";
//         div.remove()
//     });

//     it(`Можно двигать мышкой... еще не дописал...`, () => {
//         let leftThumb = div.querySelector("[class*=left]");
//         let rightThumb = div.querySelector("[class*=right]");

//         let fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
//         let fakeMouseMove = new MouseEvent("mousemove", {
//             bubbles: true,
//             cancelable: true,
//             clientX: 1000,
//         });
//         let fakeMouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true });

//         leftThumb.dispatchEvent(fakeMouseDown);
//         leftThumb.dispatchEvent(fakeMouseMove);
//         leftThumb.dispatchEvent(fakeMouseUp);
//         // leftThumb.addEventListener("fakeMouseMove", (e) => 
//         div.style.background = "red";
//         debugger;

//     });

// });

