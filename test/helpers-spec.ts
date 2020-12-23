import EventObserver from '../src/assets/blocks/helpers/event-observer';
import { SliderEvents } from '../src/assets/blocks/helpers/slider-events';
import { ISubscriber } from '../src/assets/blocks/helpers/interfaces';

// EventObserver is abstract class so let us create some derived class
class EventObserverChild extends EventObserver {}

describe('EventObserver\n', () => {
  let observer: EventObserver;
  let subscriberA: ISubscriber;
  let subscriberB: ISubscriber;
  const eventRange: SliderEvents = { event: 'range', value: true };
  const eventMin: SliderEvents = { event: 'min', value: 0 };

  beforeEach(() => {
    observer = new EventObserverChild();

    subscriberA = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      update(data: SliderEvents) {
        return this;
      },
    };
    subscriberB = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      update(data: SliderEvents) {
        return this;
      },
    };
    observer.addSubscriber(eventRange.event, subscriberA);
    observer.addSubscriber(eventRange.event, subscriberB);
    observer.addSubscriber(eventMin.event, subscriberB);
  });

  it('Корректно сохраняет в памяти подписчиков', () => {
    expect(observer.observers.range)
      .toEqual(jasmine.arrayContaining([subscriberA, subscriberB]));
    expect(observer.observers.min)
      .toEqual([subscriberB]);
  });

  describe('Удаляет подписчиков при необходимости\n', () => {
    it('Корректно удаляет подписчика, если он есть', () => {
      observer.removeSubscriber('min', subscriberB);
      observer.removeSubscriber('range', subscriberB);

      expect(observer.observers.min).toEqual([]);
      expect(observer.observers.range).toEqual([subscriberA]);
    });

    it('Ничего не делает, если подписчика или события нет', () => {
      const { ...subscriberC } = subscriberA;
      observer.removeSubscriber('mousemove', subscriberA);
      observer.removeSubscriber('mouseup', subscriberC);

      expect(observer.observers).toEqual(jasmine.objectContaining({
        range: [subscriberA, subscriberB],
        min: [subscriberB],
      }));

      expect(observer.observers).not.toEqual(jasmine.objectContaining({
        mousemove: [subscriberA],
      }));
    });
  });

  describe('Извещает подписчиков о наступлении события', () => {
    it('Вызывает обработчиков по мере наступления события', () => {
      spyOn(subscriberA, 'update');
      spyOn(subscriberB, 'update');
      observer.broadcast(eventRange);

      expect(subscriberA.update).toHaveBeenCalledWith(eventRange);
      expect(subscriberB.update).toHaveBeenCalledWith(eventRange);
    });

    it('Ничего не делает, если обработчиков на событие нет', () => {
      expect(observer.broadcast({ event: 'precision', value: 0 })).toBeUndefined();
    });
  });
});
