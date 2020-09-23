import ISubscriber from './i-subscriber';

export default class EventObserver {
  // every subscriber should have method "update(eventType, data)"
  observers: {[key: string]: ISubscriber[]} = {};

  addSubscriber(eventType: string, obj: ISubscriber): void {
    this.observers[eventType] = this.observers[eventType] || [];
    this.observers[eventType].push(obj);
  }

  removeSubscriber(eventType: string, obj: ISubscriber): void {
    if (!this.observers[eventType]) return;
    this.observers[eventType] = this.observers[eventType]
      .filter((subscriber) => subscriber !== obj);
  }

  broadcast(eventType: string, data: any): void {
    if (!this.observers[eventType]) return;
    this.observers[eventType]
      .forEach((subscriber) => subscriber &&
        subscriber.update(eventType, data));
  }
}