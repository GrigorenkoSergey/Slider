import {EventObserver, ISubscriber} from
  '../src/assets/blocks/slider/helpers';

describe('EventObserver\n', () => {
  let observer: EventObserver;
  let subscriber1: ISubscriber;
  let subscriber2: ISubscriber;

  beforeEach(() => {
    observer = new EventObserver();

    subscriber1 = {
      update(eventType: string) {
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
      const {...subscriber3} = subscriber1;
      observer.removeSubscriber('mousemove', subscriber1);
      observer.removeSubscriber('mouseup', subscriber3);

      expect(observer.observers).toEqual(jasmine.objectContaining({
        'mousedown': [subscriber1, subscriber2],
        'mouseup': [subscriber2],
      }));

      expect(observer.observers).not.toEqual(jasmine.objectContaining({
        'mousemove': [subscriber1],
      }));
    });
  });

  describe('Извещает подписчиков о наступлении события', () => {
    it('Вызывает обработчиков по мере наступления события', () => {
      spyOn(subscriber1, 'update');
      spyOn(subscriber2, 'update');
      observer.broadcast('mousedown', 'DOWN!');

      expect(subscriber1.update).toHaveBeenCalledWith('mousedown', 'DOWN!');
      expect(subscriber2.update).toHaveBeenCalledWith('mousedown', 'DOWN!');
    });

    it('Ничего не делает, если обработчиков на событие нет', () => {
      expect(observer.broadcast('mousemove', 'MOUSEMOVE!')).toBeUndefined();
    });
  });
});

