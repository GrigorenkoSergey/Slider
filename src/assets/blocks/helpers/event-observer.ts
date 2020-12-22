import { ISubscriber, SliderEvents } from './interfaces';

export default abstract class EventObserver {
  observers: {[key: string]: ISubscriber[]} = {};

  addSubscriber(eventType: string, obj: ISubscriber) {
    const { observers } = this;
    observers[eventType] = observers[eventType] || [];
    observers[eventType].push(obj);
  }

  removeSubscriber(eventType: string, obj: ISubscriber): void {
    const { observers } = this;
    if (!observers[eventType]) return;

    observers[eventType] = observers[eventType]
      .filter((subscriber) => subscriber !== obj);
  }

  broadcast(data: SliderEvents): void {
    const { observers } = this;
    const { event } = data;

    if (!observers[event]) return;

    observers[event]
      .forEach((subscriber) => (subscriber
        && subscriber.update(data)));
  }
}
