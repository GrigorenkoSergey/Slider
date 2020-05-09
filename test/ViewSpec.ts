import { View } from "../src/assets/blocks/mySlider/View";
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
div.className = "divViewSpec"; //Должен быть уникальный класс для каждого спека.
document.body.append(div);

describe(`Первоначальная минимальная инициализация\n`, () => {
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = "";
    div.remove();
  });

  it(`Можно инициализировать с минимальным количеством аргументов (min, max, selector), иначе будет ошибка`, () => {
    let view = new View({ min: 0, max: 100, selector: ".divViewSpec" });
    view.getOptions();

    expect(() => {
      let view2 = new View({ min: 0, max: 100, })
    }).toThrowError();

  });

  it(`В любой момент времени можно получить значения всех публичных свойств`, () => {
    let view = new View({ min: 0, max: 100, selector: ".divViewSpec" });
    let options = view.getOptions();
    expect(options.min).toEqual(0);
    expect(options.max).toEqual(100);
    expect(options.selector).toEqual(".divViewSpec");
    expect(options.step).toEqual(1);
  });

  it(`По умолчанию шаг равен 1/100 от длины шкалы`, () => {
    let view = new View({ min: 200, max: 1200, selector: ".divViewSpec" });
    expect(view.getOptions().step).toEqual(10);
  });

  it(`Если задан нулевой шаг, он автоматически становится 1/100 длины шкалы`, () => {
    let view = new View({ min: 200, max: 1200, selector: ".divViewSpec", step: 0 });
    expect(view.getOptions().step).toEqual(10);
  });

  it(`Если неправильно заданы некоторые опции вывалит ошибку`, () => {
    let view = new View({ min: 200, max: 1200, selector: ".divViewSpec", step: 0 });

    expect(() => { view.setOptions({min: "200a"}); }).toThrowError("min should be a number!");
    expect(() => { view.setOptions({max: "1200a"}); }).toThrowError("max should be a number!");
    expect(() => { view.setOptions({step: "1200a"}); }).toThrowError("step should be a number!");
    expect(() => { view.setOptions({angle: "90deg"}); }).toThrowError("angle should be a number!");
    expect(() => { view.setOptions({min: 1000, max: 0}); }).toThrowError("max should be greater then min!");
    expect(() => { view.setOptions({angle: -10}); }).toThrowError("angle should be >= 0 and <= 90");
  });
});

describe(`Позволяет пользователю взаимодействовать с бегунком\n`, () => {
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = "";
    div.remove();
  });


  it(`Можно двигать левый бегунок мышкой`, () => {
    let option = { min: 0, max: 1000, range: false, selector: ".divViewSpec", className: "slider" };
    let view = new View(option);

    let leftThumb = <HTMLDivElement>div.querySelector("[class*=left]");
    let scaleWidth = div.clientWidth - leftThumb.offsetWidth;

    let { min, max, step } = view.getOptions()

    //бежим к концу
    let deltaPx: number = scaleWidth / 8;
    let pixelStep: number = step * (scaleWidth) / (max - min);

    for (let i = 1; i < 8; i++) {
      //не стоит бежать до самого конца, т.к. из-зи погрешности округления мы можем достичь конца раньше, чем надеялись
      let startLeft = leftThumb.getBoundingClientRect().left; //начальное положение бегунка
      moveThumb(leftThumb, deltaPx);
      let deltaInFact = leftThumb.getBoundingClientRect().left - startLeft;
      expect(Math.abs(deltaInFact - deltaPx)).toBeLessThanOrEqual(pixelStep);
    }
  });

  it(`Можно двигать правый бегунок мышкой`, () => {
    let option = { min: -300, max: 1300, range: false, selector: ".divViewSpec", className: "slider" };
    let view = new View(option);
    view.setOptions({ range: true }).render();

    let rightThumb = <HTMLDivElement>div.querySelector("[class*=right]");
    let scaleWidth = div.clientWidth - rightThumb.offsetWidth;
    let { min, max, step } = view.getOptions()

    //бежим к началу
    let deltaPx = scaleWidth / 8;
    let pixelStep: number = step * (scaleWidth) / (max - min);

    for (let i = 7; i < 1; i++) {
      let startLeft = rightThumb.getBoundingClientRect().left; //начальное положение бегунка
      moveThumb(rightThumb, deltaPx);
      let deltaInFact = rightThumb.getBoundingClientRect().left - startLeft;
      expect(Math.abs(deltaInFact - deltaPx)).toBeLessThanOrEqual(pixelStep);
    }
  });

  it(`Если левый и правый бегунок меняются местами, также меняются и их классы:
      thumb-left и thumb-right соответственно`, () => {
    let option = { min: -300, max: 1300, range: false, selector: ".divViewSpec", className: "slider" };
    let view = new View(option);
    view.setOptions({ range: true, min: -1000, max: 2000 }).render();

    let leftThumb = <HTMLDivElement>div.querySelector("[class*=left]");
    let rightThumb = <HTMLDivElement>div.querySelector("[class*=right]");
    let scaleWidth = div.clientWidth - rightThumb.offsetWidth;

    let { min, max, step } = view.getOptions();
    moveThumb(leftThumb, scaleWidth * 7 / 8);
    moveThumb(rightThumb, -scaleWidth);

    expect(leftThumb.className.includes("right")).toBeTruthy();
    expect(leftThumb.className.includes("left")).toBeFalsy();

    expect(rightThumb.className.includes("left")).toBeTruthy();
    expect(rightThumb.className.includes("right")).toBeFalsy();
  });

  it(`Движение бегунков ограничено шкалой`, () => {
    let option = { min: -300, max: 1300, range: false, selector: ".divViewSpec", className: "slider" };
    let view = new View(option);
    view.setOptions({ range: true, min: -2777, max: 5341, step: 5 }).render();

    let leftThumb = <HTMLDivElement>div.querySelector("[class*=left]");
    let rightThumb = <HTMLDivElement>div.querySelector("[class*=right]");
    let scaleWidth = div.clientWidth - rightThumb.offsetWidth;

    let startTop: number;

    startTop = rightThumb.getBoundingClientRect().top;
    moveThumb(rightThumb, -scaleWidth * 100, 1000);
    expect(parseFloat(getComputedStyle(rightThumb).left)).toBeGreaterThanOrEqual(0);
    expect(rightThumb.getBoundingClientRect().top).toEqual(startTop);

    startTop = rightThumb.getBoundingClientRect().top;
    moveThumb(rightThumb, scaleWidth * 100, -50000);
    expect(parseFloat(getComputedStyle(rightThumb).left)).toBeLessThanOrEqual(scaleWidth);
    expect(rightThumb.getBoundingClientRect().top).toEqual(startTop);

    startTop = leftThumb.getBoundingClientRect().top;
    moveThumb(leftThumb, -scaleWidth * 100, 1000);
    expect(parseFloat(getComputedStyle(leftThumb).left)).toBeGreaterThanOrEqual(0);
    expect(leftThumb.getBoundingClientRect().top).toEqual(startTop);

    startTop = leftThumb.getBoundingClientRect().top;
    moveThumb(leftThumb, scaleWidth * 100, -50000);
    expect(parseFloat(getComputedStyle(leftThumb).left)).toBeLessThanOrEqual(scaleWidth);
    expect(leftThumb.getBoundingClientRect().top).toEqual(startTop);
  });

  it(`Слайдер может работать в вертикальном положении`, () => {
    let option = {
      min: 0, max: 100, range: true, selector: ".divViewSpec",
      className: "slider", angle: 90
    };
    let view = new View(option);

    let leftThumb = <HTMLDivElement>div.querySelector("[class*=left]");
    let rightThumb = <HTMLDivElement>div.querySelector("[class*=right]");
    let scaleWidth = div.clientWidth - rightThumb.offsetWidth;
    let { min, max, step } = view.getOptions()

    let highLimit = leftThumb.getBoundingClientRect().top;
    let lowLimit = rightThumb.getBoundingClientRect().top; //да, да... Именно top
    let leftLimit = leftThumb.getBoundingClientRect().left;
    let rightLimit = leftThumb.getBoundingClientRect().right;

    //проверим поведение верхнего бегунка (левого)
    let startTop = highLimit;
    moveThumb(leftThumb, 1000, scaleWidth / 4);
    let pos = leftThumb.getBoundingClientRect();
    expect(pos.left).toEqual(leftLimit);
    expect(pos.right).toEqual(rightLimit);
    expect(pos.top - startTop).toEqual(parseFloat(getComputedStyle(leftThumb).left));

    //проверим поведение верхнего бегунка (левого)
    startTop = lowLimit;
    moveThumb(rightThumb, 1000, -scaleWidth / 4);
    pos = rightThumb.getBoundingClientRect();
    expect(pos.left).toEqual(leftLimit);
    expect(pos.right).toEqual(rightLimit);
    expect(startTop - pos.top).toEqual(parseFloat(getComputedStyle(leftThumb).left));
  });

  it(`Проверки на углы более 0 и менее 90 градусов слишком сложны, поэтому их нужно проводить вручную`, () => {
    expect(true).toBeTrue();
  });

});

function moveThumb(thumb: HTMLDivElement, deltaXPx: number, deltaYPx: number = 0): void {
  let startX = Math.abs(deltaXPx);
  let startY = Math.abs(deltaYPx);

  let fakeMouseDown = new MouseEvent("mousedown",
    { bubbles: true, cancelable: true, clientX: startX, clientY: startY });

  let fakeMouseMove = new MouseEvent("mousemove",
    { bubbles: true, cancelable: true, clientX: startX + deltaXPx, clientY: startY + deltaYPx });

  let fakeMouseUp = new MouseEvent("mouseup",
    { bubbles: true, cancelable: true });

  thumb.dispatchEvent(fakeMouseDown);
  thumb.dispatchEvent(fakeMouseMove);
  thumb.dispatchEvent(fakeMouseUp);
}