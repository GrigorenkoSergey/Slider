// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../src/assets/blocks/helpers/debugger-point';
import Presenter from '../src/assets/blocks/slider/components/presenter/presenter';
import '../src/assets/blocks/slider/slider.scss';


const div = document.createElement('div');
// Должен быть уникальный класс для каждого спека.
div.className = 'divPresenterSpec';
div.style.marginTop = '70px';
document.body.append(div);

const fakeMouseDown = new MouseEvent('mousedown',
  {bubbles: true, cancelable: true, clientX: 0, clientY: 0});

const fakeMouseUp = new MouseEvent('mouseup', {
  bubbles: true, cancelable: true,
});

const fakeClick = new MouseEvent('click', {
  bubbles: true, cancelable: true,
})

describe(`Меняет значения подсказки над бегунком, берет данные из модели\n`, () => {
  const option = {
    range: true, selector: '.divPresenterSpec',
    className: 'slider', showScale: true,
    partsNum: 4,
    min: 10,
    max: 100,
  };

  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it(`При нажатии на левом кругляше отображается подсказка`, () => {
    const presenter = new Presenter(option);
    const thumb = presenter.view.thumbs.thumbLeft;
    thumb.dispatchEvent(fakeMouseDown);

    const hint = <HTMLDivElement>thumb.querySelector('[class*=__hint]');

    expect(hint.hidden).toBeFalse();
    expect(hint.textContent).toEqual('10');
    thumb.dispatchEvent(fakeMouseUp);
  });

  it(`При нажатии на правом кругляше отображается подсказка`, () => {
    const presenter = new Presenter({...option, thumbRightPos: 70});
    const thumb = presenter.view.thumbs.thumbRight
    thumb.dispatchEvent(fakeMouseDown);

    const hint = <HTMLDivElement>thumb.querySelector('[class*=__hint]');

    expect(hint.textContent).toEqual('70');
    expect(hint.hidden).toBeFalse();
    thumb.dispatchEvent(fakeMouseUp);
  });

  it(`При движении значение подсказки меняется`, () => {
    const presenter = new Presenter(option);
    const thumbLeft = presenter.view.thumbs.thumbLeft;
    const thumbRight = presenter.view.thumbs.thumbRight;

    thumbLeft.dispatchEvent(fakeMouseDown);
    const hintLeft = <HTMLDivElement>thumbLeft.querySelector('[class*=__hint]');

    const scaleWidth = div.clientWidth - thumbLeft.offsetWidth;

    let fakeMouseMove = new MouseEvent('mousemove',
      {
        bubbles: true, cancelable: true,
        clientX: scaleWidth / 2, clientY: 0,
      });

    thumbLeft.dispatchEvent(fakeMouseMove);
    expect(hintLeft.textContent).toEqual('55');
    thumbLeft.dispatchEvent(fakeMouseUp);

    fakeMouseMove = new MouseEvent('mousemove',
      {
        bubbles: true, cancelable: true,
        clientX: -scaleWidth / 4, clientY: 0,
      });

    thumbRight.dispatchEvent(fakeMouseDown);
    const hintRight = <HTMLDivElement>thumbRight.querySelector('[class*=__hint]');
    thumbLeft.dispatchEvent(fakeMouseMove);
    expect(hintRight.textContent).toEqual('78');
    thumbLeft.dispatchEvent(fakeMouseUp);
  });
});

describe(`Проверка работы "alternativeRange"\n`, () => {
  const option = {
    range: true, 
    selector: '.divPresenterSpec',
    className: 'slider', 
    showScale: true,
    partsNum: 2,
    alternativeRange: ["Jan", "Feb", "March", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  };

  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it(`При нажатии на левом кругляше отображается подсказка`, () => {
    const presenter = new Presenter(option);
    const thumb = presenter.view.thumbs.thumbLeft;
    thumb.dispatchEvent(fakeMouseDown);

    const hint = <HTMLDivElement>thumb.querySelector('[class*=__hint]');

    expect(hint.hidden).toBeFalse();
    expect(hint.textContent).toEqual('Jan');
    thumb.dispatchEvent(fakeMouseUp);
  });

  it(`При нажатии на правом кругляше отображается подсказка`, () => {
    const presenter = new Presenter({...option, thumbRightPos: 10});
    const thumb = presenter.view.thumbs.thumbRight
    thumb.dispatchEvent(fakeMouseDown);

    const hint = <HTMLDivElement>thumb.querySelector('[class*=__hint]');

    expect(hint.textContent).toEqual('Nov');
    expect(hint.hidden).toBeFalse();
    thumb.dispatchEvent(fakeMouseUp);
  });

  it(`При движении значение подсказки меняется`, () => {
    const presenter = new Presenter(option);
    const thumbLeft = presenter.view.thumbs.thumbLeft;
    const thumbRight = presenter.view.thumbs.thumbRight;

    thumbLeft.dispatchEvent(fakeMouseDown);
    const hintLeft = <HTMLDivElement>thumbLeft.querySelector('[class*=__hint]');

    const scaleWidth = div.clientWidth - thumbLeft.offsetWidth;

    let fakeMouseMove = new MouseEvent('mousemove',
      {
        bubbles: true, cancelable: true,
        clientX: scaleWidth / 2, clientY: 0,
      });

    thumbLeft.dispatchEvent(fakeMouseMove);
    expect(hintLeft.textContent).toEqual('Jul');
    thumbLeft.dispatchEvent(fakeMouseUp);

    fakeMouseMove = new MouseEvent('mousemove',
      {
        bubbles: true, cancelable: true,
        clientX: -scaleWidth / 4, clientY: 0,
      });

    thumbRight.dispatchEvent(fakeMouseDown);
    const hintRight = <HTMLDivElement>thumbRight.querySelector('[class*=__hint]');
    thumbLeft.dispatchEvent(fakeMouseMove);
    expect(hintRight.textContent).toEqual('Sep');
    thumbLeft.dispatchEvent(fakeMouseUp);
  });
});

describe(`Меняет значения шкалы в соответствии с моделью и видом\n`, () => {
  const option = {
    range: true, selector: '.divPresenterSpec',
    className: 'slider', showScale: true,
    min: 20, 
    max: 200,
    precision: 1,
  };

  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it(`Масштабирует значения шкалы при первоначальной инициализации\n`, () => {
    const presenter = new Presenter(option);
    let anchors = presenter.view.scale.el.querySelectorAll('[class*=scale-points]');

    expect(anchors[0].textContent).toEqual('20');
    expect(anchors[1].textContent).toEqual('110');
    expect(anchors[2].textContent).toEqual('200');
  });

  it('Реагирует на изменение свойства "min" модели', () => {
    const presenter = new Presenter(option);
    const {model} = presenter;

    let anchors = presenter.view.scale.el.getElementsByClassName('slider__scale-points');

    model.setOptions({min: 0});
    expect(anchors[0].textContent).toEqual('0');
    expect(anchors[1].textContent).toEqual('100');
    expect(anchors[2].textContent).toEqual('200');

    model.setOptions({min: 0.5});
    expect(anchors[0].textContent).toEqual('0.5');
  });

  it('При изменении свойства "min" или "max" модели, бегунок бежит к своему старому местоположению', () => {
    const presenter = new Presenter(option);

    presenter.setOptions({
      min: 0,
      max: 100, 
      range: true,
      hintAlwaysShow: true,
      thumbLeftPos: 50,
      thumbRightPos: 80,
    });

    presenter.setOptions({min: 50});
    const thumbLeft = div.getElementsByClassName('slider__thumb-left')[0];
    expect(getComputedStyle(thumbLeft).left).toEqual('0px');

    const thumbRight = div.getElementsByClassName('slider__thumb-right')[0];
    presenter.setOptions({max: 80});
    expect(getComputedStyle(thumbRight).left).toEqual(presenter.view.scale.width + 'px');
  });

  it('Реагирует на изменение свойства "max" модели', () => {
    const presenter = new Presenter({...option, ...{min: 0}});
    const {model} = presenter;
    let anchors = presenter.view.scale.el.getElementsByClassName('slider__scale-points');

    model.setOptions({max: 1000});
    expect(anchors[0].textContent).toEqual('0');
    expect(anchors[1].textContent).toEqual('500');
    expect(anchors[2].textContent).toEqual('1000');
  });

  it('Реагирует на изменение свойства "step" модели', () => {
    const presenter = new Presenter({...option, ...{min: 0, max: 1000}});
    const {model, view} = presenter;

    model.setOptions({step: 100});
    expect(view.getOptions().step).toEqual(0.1);
  });

  it('Реагирует на изменение свойства "thumbLeftPos" модели', () => {
    const presenter = new Presenter({...option, ...{min: 0, max: 1000}});
    const {model} = presenter;

    const thumbLeft = div.getElementsByClassName('slider__thumb-left')[0];
    const leftHint  = <HTMLElement>thumbLeft.querySelector('[class*=hint]');

    model.setOptions({thumbLeftPos: 100});
    expect(model.thumbLeftPos).toEqual(100)
    expect(leftHint.offsetHeight).toEqual(0);
    thumbLeft.dispatchEvent(fakeMouseDown);
    expect(leftHint.textContent).toEqual('100');
    thumbLeft.dispatchEvent(fakeMouseUp);
    expect(leftHint.offsetHeight).toEqual(0);
  });

  it('Реагирует на изменение свойства "thumbRightPos" модели', () => {
    const presenter = new Presenter({...option, ...{min: 0, max: 1000}});
    const {model} = presenter;

    const thumbRight = div.getElementsByClassName('slider__thumb-right')[0];
    const rightHint  = <HTMLElement>thumbRight.querySelector('[class*=hint]');

    model.setOptions({thumbRightPos: 800});
    expect(model.thumbRightPos).toEqual(800);
    expect(rightHint.offsetHeight).toEqual(0);
    thumbRight.dispatchEvent(fakeMouseDown);
    expect(thumbRight.textContent).toEqual('800');
    thumbRight.dispatchEvent(fakeMouseUp);
    expect(rightHint.offsetHeight).toEqual(0);
  });

  it('Реагирует на изменение свойства "range" модели', () => {
    const presenter = new Presenter(option);
    const {model} = presenter;
    const stretcher = div.getElementsByClassName('slider__stretcher')[0];
    const style = getComputedStyle(stretcher);
    const thumb = <HTMLElement>div.querySelector('[class*=thumb]');

    expect(parseFloat(style.left)).toEqual(thumb.offsetWidth / 2);
    
    expect(parseFloat(style.right)).toEqual(thumb.offsetWidth);
    model.setOptions({range: false, thumbLeftPos: 1000});
    expect(style.left).toEqual('0px');
    expect(style.right).toEqual('16px');
  });

  it('Реагирует на изменение свойства "partsNum" вида', () => {
    const presenter = new Presenter(option);
    let anchors = presenter.view.scale.el.getElementsByClassName('slider__scale-points');

    presenter.setOptions({partsNum: 3});
    expect(anchors.length).toEqual(4);
    expect(anchors[0].textContent).toEqual('20');
    expect(anchors[1].textContent).toEqual('80');
    expect(anchors[2].textContent).toEqual('140');
    expect(anchors[3].textContent).toEqual('200');

    presenter.setOptions({partsNum: 4});
    expect(anchors[1].textContent).toEqual('66');
    expect(anchors[2].textContent).toEqual('110');
    expect(anchors[3].textContent).toEqual('156');

    presenter.setOptions({partsNum: 2});
    expect(anchors[0].textContent).toEqual('20');
    expect(anchors[1].textContent).toEqual('110');
    expect(anchors[2].textContent).toEqual('200');
  });
});

describe(`Меняет состояние модели в соответствии с положением бегунков\n`, () => {

  const option = {
    range: true, selector: '.divPresenterSpec',
    className: 'slider', showScale: true,
    partsNum: 4,
    min: 0,
    max: 100,
  };

  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it(`При движении левого бегунка меняется значение thumbLeftPos в модели`, () => {
    const presenter = new Presenter(option);
    const {model} = presenter;
    const thumbLeft = div.getElementsByClassName('slider__thumb-left')[0];
    const anchors = div.getElementsByClassName('slider__scale-points');
    const hints = div.getElementsByClassName('slider__hint')

    anchors[1].dispatchEvent(fakeClick);
    thumbLeft.dispatchEvent(fakeMouseDown);
    expect(hints[0].textContent).toEqual('25');
    expect(model.thumbLeftPos).toEqual(25);
  });

  it(`При движении правого бегунка меняется значение thumbRightPos в модели`, () => {
    const presenter = new Presenter(option);
    const {model} = presenter;
    const thumbLeft = div.getElementsByClassName('slider__thumb-right')[0];
    const anchors = div.getElementsByClassName('slider__scale-points');
    const hints = div.getElementsByClassName('slider__hint')

    anchors[3].dispatchEvent(fakeClick);
    thumbLeft.dispatchEvent(fakeMouseDown);
    expect(hints[1].textContent).toEqual('75');
    expect(model.thumbRightPos).toEqual(75);
  });
});

describe(`В любой момент времени можно узнать и задать нужные свойства\n`, () => {
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  const option = {
    range: true, selector: '.divPresenterSpec',
    className: 'slider', showScale: true,
    min: 20, 
    max: 200,
  };

  it('Узнаём свойства слайдера', () => {
    const presenter = new Presenter(option);
    const options = presenter.getOptions();
    
    expect(options.angle).toEqual(0);
    expect(options.hintAboveThumb).toBeTrue();
    expect(options.min).toEqual(20);
    expect(options.max).toEqual(200);
    expect(options.partsNum).toEqual(2);
    expect(options.range).toBeTrue();
    expect(options.showScale).toBeTrue();
    expect(options.thumbLeftPos).toEqual(20);
    expect(options.thumbRightPos).toEqual(200);
    expect(options.step).toEqual(2);
  });

  it('Задаем свойства слайдера', () => {
    const presenter = new Presenter(option);
    const {model, view} = presenter;

    presenter.setOptions({
      range: false, 
      showScale: false,
      min: 0, 
      max: 100,
      step: 10,
      angle: 45,
      thumbLeftPos: 50,
    });

    // Для красоты
    div.style.marginTop = '300px';

    let options = presenter.getOptions();
    expect(options.range).toEqual(false);
    expect(options.showScale).toEqual(false);
    expect(options.min).toEqual(0);
    expect(options.max).toEqual(100);
    expect(options.step).toEqual(10);

    options = model.getOptions();
    expect(options.range).toEqual(false);
    expect(options.min).toEqual(0);
    expect(options.max).toEqual(100);
    expect(options.step).toEqual(10);
    expect(options.thumbLeftPos).toEqual(50);

    options = view.getOptions();
    expect(options.angle).toEqual(45);
    expect(options.range).toEqual(false);
    expect(options.showScale).toEqual(false);
    expect(options.step).toEqual(0.1);

    div.style.marginTop = '70px';
  });
});

describe(`Проверка поведения подсказки над бегунком\n`, () => {
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  const option = {
    range: true, selector: '.divPresenterSpec',
    className: 'slider', showScale: true,
    min: 20, 
    max: 200,
    thumbLeftPos: 25,
  };

  it(`При включенной опции "hintAlwaysShow" и при клике на значении шкалы, 
  значение подсказки над бегунком меняется`, () => {
    const presenter = new Presenter({...option, hintAlwaysShow: true, step: 1});

    const anchors = div.getElementsByClassName('slider__scale-points');
    const hints = div.getElementsByClassName('slider__hint')
    const thumbLeft = div.getElementsByClassName('slider__thumb-left')[0];
    expect(hints[0].textContent).toEqual('25');

    thumbLeft.dispatchEvent(fakeMouseDown);
    expect(hints[0].textContent).toEqual('25');
    expect(hints[1].textContent).toEqual('200');
    thumbLeft.dispatchEvent(fakeMouseUp);

    presenter.setOptions({thumbLeftPos: 50});
    anchors[1].dispatchEvent(fakeClick);
    expect(hints[0].textContent).toEqual('110');
  });

  it(`При нажатии на сам слайдер, значение подсказки над бегунком также меняется`, () => {
    const presenter = new Presenter({
      ...option, 
      min: 0,
      max: 100, 
      hintAlwaysShow: true,
      thumbLeftPos: 0,
    });

    presenter.setOptions({range: false});

    const leftThumb = <HTMLElement>div.getElementsByClassName('slider__thumb-left')[0];
    const slider = <HTMLElement>div.getElementsByClassName('slider')[0];
    const thumbStartX = leftThumb.getBoundingClientRect().left;
    const hint = <HTMLElement>div.getElementsByClassName('slider__hint')[0];

    let fakeMouseClick = new MouseEvent('click', {
      bubbles: true, cancelable: true,
      clientX: thumbStartX + slider.clientWidth,  clientY: 0,
    });

    slider.dispatchEvent(fakeMouseClick);
    expect(hint.textContent).toEqual('100');

    fakeMouseClick = new MouseEvent('click', {
      bubbles: true, cancelable: true,
      clientX: -thumbStartX - slider.clientWidth,  clientY: 0,
    });

    slider.dispatchEvent(fakeMouseClick);
    expect(hint.textContent).toEqual('0');
  });
});

describe(`Проверка оции "onChange\n`, () => {
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  const option = {
    range: true, selector: '.divPresenterSpec',
    className: 'slider', showScale: true,
    min: 0, 
    max: 200,
  };

  it(`Любой элемент можно подписать на изменение нашего слайдера`, () => {
    const presenter = new Presenter(option);
    let num = 3;

    const miniObserver = presenter.onChange({el: num});
    miniObserver.update = () => num = presenter.getOptions().thumbLeftPos;

    presenter.setOptions({thumbLeftPos: 10});
    expect(num).toEqual(10);

    const anchors = div.getElementsByClassName('slider__scale-points');
    anchors[1].dispatchEvent(fakeClick);
    expect(num).toEqual(100);
  });
});

describe(`Данные баги более не возникают\n`, () => {

  let options: Obj = {
    min: 0,
    max: 100,
    step: 1,
    selector: '.divPresenterSpec',
    angle: 0,
    range: true,
    hintAboveThumb: true,
    hintAlwaysShow: true,
  };

  let slider: Presenter;
  let leftThumb: HTMLDivElement;
  let rightThumb: HTMLDivElement;
  let leftHint: Element;
  let rightHint: Element;

  beforeEach(() => {
    document.body.append(div);

    slider = new Presenter({...options});
    leftThumb = <HTMLDivElement>div.getElementsByClassName('slider__thumb-left')[0];
    rightThumb = <HTMLDivElement>div.getElementsByClassName('slider__thumb-right')[0];
    leftHint = leftThumb.getElementsByClassName('slider__hint')[0];
    rightHint = rightThumb.getElementsByClassName('slider__hint')[0];
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it(`При наложении бегунков значение подсказок должно быть одинаковым`, () => {
    slider.setOptions({min: 0, thumbLeftPos: 0});

    slider.setOptions({max: 6, step: 1, thumbRightPos: 1, min: 1});

    expect(leftHint.textContent).toEqual('1');
    expect(rightHint.textContent).toEqual('1');
  });

  it(`При изменении шага, если бегунок находится в недостижимом
    положении, он передвигается в ближайшее допустимое положение`, () => {
    slider.setOptions({min: 0, max: 11, step: 1, thumbLeftPos: 10, range: false});
    expect(leftHint.textContent).toEqual('10');
    slider.setOptions({step: 11})
    expect(leftHint.textContent).toEqual('11');
  });

  it(`При изменении шага, бегунок нельзя перетащить за границы слайдера`, () => {
    slider.setOptions({min: 0, max: 11, step: 4, range: false});
    leftThumb.dispatchEvent(fakeMouseDown);

    const scaleWidth = div.clientWidth - leftThumb.offsetWidth;

    let fakeMouseMove = new MouseEvent('mousemove',
      {
        bubbles: true, cancelable: true,
        clientX: scaleWidth * 2, clientY: 0,
      });

    leftThumb.dispatchEvent(fakeMouseMove);
    expect(leftHint.textContent).toEqual('8');
    leftThumb.dispatchEvent(fakeMouseUp);
  });

  it(`При любой ширине контейнера, бегунки могут слиться`, () => {
    div.innerHTML = '';
    div.remove();
    div.style.width = '421.33px';

    document.body.appendChild(div);
    slider = new Presenter({...options});
    slider.setOptions({min: 0, max: 58, thumbRightPos: 41});

    const scaleWidth = div.clientWidth - leftThumb.offsetWidth;

    let fakeMouseMove = new MouseEvent('mousemove',
      {
        bubbles: true, cancelable: true,
        clientX: scaleWidth * 2, clientY: 0,
      });

    leftThumb = <HTMLDivElement>div.getElementsByClassName('slider__thumb-left')[0];
    rightThumb = <HTMLDivElement>div.getElementsByClassName('slider__thumb-right')[0];
    leftThumb.dispatchEvent(fakeMouseDown);
    leftThumb.dispatchEvent(fakeMouseMove);
    leftThumb.dispatchEvent(fakeMouseUp);
    expect(leftThumb.getBoundingClientRect().left).toEqual(rightThumb.getBoundingClientRect().left);
    div.style.width = '';
  })

  it(`При выключении и включении опции "range" правый бегунок может достичь
    только максимального значения, кратного шагу`, () => {
    slider.setOptions({min: 1, max: 6, step: 4, range: false});
    slider.setOptions({range: true});
    expect(slider.getOptions().thumbRightPos).toEqual(5);
  });
});