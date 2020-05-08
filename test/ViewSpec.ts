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

describe(`Первоначальная минимальная инициализация`, () => {
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

    let fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: 0, clientY: 0 });
    //вообще для fakeMouseDown clientX and clientY по умолчанию равны нулю, но указывают дополнительно, чтоб впоследствии самому не запутаться
    leftThumb.dispatchEvent(fakeMouseDown);

    let { min, max, step } = view.getOptions()

    //бежим к концу
    let startLeft = leftThumb.getBoundingClientRect().left; //начальное положение бегунка
    for (let i = 1; i < 9; i++) {
      let deltaPx = i * scaleWidth / 8;
      let fakeMouseMove = new MouseEvent("mousemove", { bubbles: true, cancelable: true, clientX: deltaPx });
      document.dispatchEvent(fakeMouseMove);
      let deltaInFact = leftThumb.getBoundingClientRect().left - startLeft;
      let pixelStep: number = step * (scaleWidth) / (max - min);

      //Погрешность округления всегда присутствует...
      expect(Math.abs(deltaInFact - deltaPx)).toBeLessThanOrEqual(pixelStep);
    }

    /*
    let fakeMouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true });
    document.dispatchEvent(fakeMouseUp);

    //При fakeMouseDown обязательно генерировать clientX, если хочешь, к примеру, двигаться назад
    //По умолчанию clientX всегда равно 0, поэтому бегунок при fakeMouseMove будет двигаться только вперед
    fakeMouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: scaleWidth });
    leftThumb.dispatchEvent(fakeMouseDown);
    document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, cancelable: true, clientX: scaleWidth / 2 }))
    expect(Math.abs(view.getOption("thumbLeftPos") - (max - min) / 2)).toBeLessThanOrEqual(2 * step);
    */

  });

  it(`Можно двигать правый бегунок мышкой`, () => {

  });

  it(`Если левый и правый бегунок меняются местами, также меняются и их классы:
      thumb-left и thumb-right соответственно`, () => {

  });
  it(`Движение бегунков ограничено шкалой`, () => {

  });
});