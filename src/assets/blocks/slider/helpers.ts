class EventObserver {
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

interface ISubscriber {
  update: (eventType: string, data: any) => void;
}

const debuggerPoint = {start: 0};
// Специальный объект для отладки. Ставим debuggerPoint.start = 1
// в нужном месте кода и в одном из проверяемых элементов
// ставим if(debuggerPoint.start) debugger;
// и отладка довольно сильно упрощается.

function isIncreasing(arr: number[] | string[]): boolean {
  let prev = +arr[0];
  arr = arr.slice(1);

  for (let i = 0; i < arr.length; i++) {
    if (+arr[i] <= prev) return false;
    prev = +arr[i];
  }

  return true;
}

export {EventObserver, ISubscriber, debuggerPoint, isIncreasing};
