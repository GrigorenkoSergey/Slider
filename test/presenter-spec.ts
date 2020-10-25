// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../src/assets/blocks/helpers/debugger-point';
import Presenter from '../src/assets/blocks/slider/components/presenter/presenter';
import '../src/assets/blocks/slider/slider.scss';


const div = document.createElement('div');
// Должен быть уникальный класс для каждого спека.
div.className = 'divPresenterSpec';
div.style.marginTop = '70px';
document.body.append(div);

describe(`Меняет значения подсказки над бегунком, берет данные из модели\n`, () => {
  const option = {
    range: true, selector: '.divPresenterSpec',
    className: 'slider', showScale: true,
    partsNum: 4,
    min: 10,
    max: 100,
  };

  const fakeMouseDown = new MouseEvent('mousedown',
    {bubbles: true, cancelable: true, clientX: 0, clientY: 0});

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
  });

  it(`При нажатии на правом кругляше отображается подсказка`, () => {
    const presenter = new Presenter(option);
    const thumb = presenter.view.thumbs.thumbRight
    thumb.dispatchEvent(fakeMouseDown);

    const hint = <HTMLDivElement>thumb.querySelector('[class*=__hint]');

    expect(hint.hidden).toBeFalse();
    expect(hint.textContent).toEqual('100');
  });

  it(`При движении значение подсказки меняется`, () => {
    const presenter = new Presenter(option);
    const thumb = presenter.view.thumbs.thumbLeft;

    thumb.dispatchEvent(fakeMouseDown);
    const hint = <HTMLDivElement>thumb.querySelector('[class*=__hint]');

    const scaleWidth = div.clientWidth - thumb.offsetWidth;

    const fakeMouseMove = new MouseEvent('mousemove',
      {
        bubbles: true, cancelable: true,
        clientX: scaleWidth / 2, clientY: 0,
      });

    thumb.dispatchEvent(fakeMouseMove);
    expect(hint.textContent).toEqual('55');
  });

  it(`При движении значение подсказки меняется`, () => {
    const presenter = new Presenter(option);
    const thumb = presenter.view.thumbs.thumbLeft;

    thumb.dispatchEvent(fakeMouseDown);
    const hint = <HTMLDivElement>thumb.querySelector('[class*=__hint]');

    const scaleWidth = div.clientWidth - thumb.offsetWidth;

    const fakeMouseMove = new MouseEvent('mousemove',
      {
        bubbles: true, cancelable: true,
        clientX: scaleWidth / 2, clientY: 0,
      });

    thumb.dispatchEvent(fakeMouseMove);
    expect(hint.textContent).toEqual('55');
  });

});
describe(`Меняет значения шкалы в соответствии с моделью\n`, () => {
  beforeEach(() => {
    document.body.append(div);
  });

  afterEach(() => {
    div.innerHTML = '';
    div.remove();
  });

  it(`Масштабирует значения шкалы\n`, () => {
    const option = {
      range: true, selector: '.divPresenterSpec',
      className: 'slider', showScale: true,
      min: 20, 
      max: 200,
    };

    const presenter = new Presenter(option);
    let anchors = presenter.view.scale.el.querySelectorAll('[class*=scale-points]');

    expect(anchors[0].textContent).toEqual('20');
    expect(anchors[1].textContent).toEqual('110');
    expect(anchors[2].textContent).toEqual('200');
  });
});