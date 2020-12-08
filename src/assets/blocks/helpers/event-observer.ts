import { ISubscriber } from './interfaces';

export default abstract class EventObserver {
  public observers: {[key: string]: ISubscriber[]} = {};

  public addSubscriber(eventType: string, obj: ISubscriber): void {
    this.observers[eventType] = this.observers[eventType] || [];
    this.observers[eventType].push(obj);
  }

  public removeSubscriber(eventType: string, obj: ISubscriber): void {
    if (!this.observers[eventType]) return;

    this.observers[eventType] = this.observers[eventType]
      .filter((subscriber) => subscriber !== obj);
  }

  public broadcast<T>(eventType: string, data: T): void {
    if (!this.observers[eventType]) return;

    this.observers[eventType]
      .forEach((subscriber) => (subscriber
        && subscriber.update(eventType, data)));
  }
}
