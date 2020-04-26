class EventObserver {
    //every subscriber should have method "update(eventType, data)"
    observers: { [key: string]: ISubscriber[]} = {};

    addSubscriber(eventType: string, obj: ISubscriber): void {
        this.observers[eventType] = this.observers[eventType] || [];
        this.observers[eventType].push(obj);
    }

    removeSubscriber(eventType: string, obj: ISubscriber): void {
        if (!this.observers[eventType]) return;
        this.observers[eventType] = this.observers[eventType].filter(subscriber => subscriber !== obj);
    }

    broadcast(eventType: string, data: any) {
        if (!this.observers[eventType]) return;
        this.observers[eventType].forEach(subscriber => subscriber && subscriber.update(eventType, data));
    }
}

interface IModel {
    event?: EventObserver;
    min?: number
    max?: number
    thumbLeftPos?: number;
    thumbRightPos?: number;
    step?: number;
    ticks?: any; //Пока не знаю, как оформить
    _totalItems?: number;
    angle?: number;
    bifurcation?: boolean;
}

interface IViewOptions {
    selector: string;
    className: string;
    angle: number;
    min: number;
    max: number; 
    step: number;
    range: boolean;
    hintAboveThumb?: boolean;
}


interface ISubscriber {
    update: (eventType: string, data: any) => void;
}

let debuggerPoint = {start: 0}; //Специальный объект для отладки. Ставим debuggerPoint.start = 1
//в нужном месте кода и в одном из проверяемых элементов ставим if(debuggerPoint.start) debugger;
//и отладка довольно сильно упрощается.

export {EventObserver, IModel, ISubscriber, IViewOptions, debuggerPoint};