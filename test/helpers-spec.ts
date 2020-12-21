import EventObserver from '../src/assets/blocks/helpers/event-observer';
import { ISubscriber, SliderEvents } from '../src/assets/blocks/helpers/interfaces';
import { isObjKey } from '../src/assets/blocks/helpers/functions/is-obj-key';
import { setOption } from '../src/assets/blocks/helpers/functions/set-option';

// EventObserver is abstract class so let us create some derived class
class EventObserverChild extends EventObserver {}

describe('EventObserver\n', () => {
  let observer: EventObserver;
  let subscriber1: ISubscriber;
  let subscriber2: ISubscriber;

  beforeEach(() => {
    observer = new EventObserverChild();

    subscriber1 = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      update(eventType: string, data: SliderEvents) {
        return eventType;
      },
    };
    subscriber2 = {
      update(eventType: string, data: any) {
        return data;
      },
    };
    observer.addSubscriber('mousedown', subscriber1);
    observer.addSubscriber('mousedown', subscriber2);
    observer.addSubscriber('mouseup', subscriber2);
  });

  it('Корректно сохраняет в памяти подписчиков', () => {
    expect(observer.observers.mousedown)
      .toEqual(jasmine.arrayContaining([subscriber1, subscriber2]));
    expect(observer.observers.mouseup)
      .toEqual([subscriber2]);
  });

  describe('Удаляет подписчиков при необходимости', () => {
    it('Корректно удаляет подписчика, если он есть', () => {
      observer.removeSubscriber('mouseup', subscriber2);
      observer.removeSubscriber('mousedown', subscriber2);

      expect(observer.observers.mouseup).toEqual([]);
      expect(observer.observers.mousedown).toEqual([subscriber1]);
    });

    it('Ничего не делает, если подписчика или события нет', () => {
      const { ...subscriber3 } = subscriber1;
      observer.removeSubscriber('mousemove', subscriber1);
      observer.removeSubscriber('mouseup', subscriber3);

      expect(observer.observers).toEqual(jasmine.objectContaining({
        mousedown: [subscriber1, subscriber2],
        mouseup: [subscriber2],
      }));

      expect(observer.observers).not.toEqual(jasmine.objectContaining({
        mousemove: [subscriber1],
      }));
    });
  });

  describe('Извещает подписчиков о наступлении события', () => {
    it('Вызывает обработчиков по мере наступления события', () => {
      spyOn(subscriber1, 'update');
      spyOn(subscriber2, 'update');
      const event: SliderEvents = { event: 'angle', value: 0 };
      observer.broadcast('mousedown', event);

      expect(subscriber1.update).toHaveBeenCalledWith('mousedown', event);
      expect(subscriber2.update).toHaveBeenCalledWith('mousedown', event);
    });

    it('Ничего не делает, если обработчиков на событие нет', () => {
      expect(observer.broadcast('mousemove', { event: 'precision', value: 0 })).toBeUndefined();
    });
  });
});

describe('Functions\n', () => {
  it(`Функция isObjKey
     Выдает верные результаты, если строка является ключом объекта`, () => {
    const person = {
      name: 'Sergey',
      age: '999',
      character: 'nasty',
    };

    expect(isObjKey(person, 'name')).toBeTrue();
    expect(isObjKey(person, 'age')).toBeTrue();
    expect(isObjKey(person, 'height')).toBeFalse();
  });

  it(`Функция setOptions. Может устанавливать свойства объекта,
    при неправильных значениях TS просто подсветит ошибку`, () => {
    const obj = {
      height: 12,
    };

    const objCopy: typeof obj = setOption(obj, 'height', 15);
    expect(objCopy.height).toEqual(15);

    /* Если раскомментировать, компилятор должен выделить ошибки

    const obj2 = {
      width: 100,
    };

    objCopy = setOption(obj, 'weight', 10);
    objCopy = setOption(obj2, 'width', 12);
    */
  });
});
