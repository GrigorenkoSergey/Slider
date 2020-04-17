class Model implements IModel, ISubscriber {
    event = new EventObserver();
    min = 0;
    max = 100;
    thumbLeftPos = 0;
    thumbRightPos = 0;
    step = 10;
    ticks = [this.min, this.max];
    angle = 0;
    bifurcation = false;
    hintAboveThumb = false;

    constructor(options: IModel = {}) {
        Object.assign(this, options);
    }

    update(eventType: string, data: any) {
        console.log("updating model");
        this.event.broadcast("changeModel", this);
    }
}

class Presenter implements ISubscriber {
    event: EventObserver = new EventObserver();

    constructor(model: Model, view: View) {
        this.event.addSubscriber("changeView", model);
        model.event.addSubscriber("changeModel", this);

        this.event.addSubscriber("changeModel", view);
        view.event.addSubscriber("changeView", this);
    }

    update(eventType: string, data: any) {
        if (eventType == "changeModel") {
            let result = this.translate(data);
            this.event.broadcast("changeModel", result);

        } else if (eventType == "changeView") {
            this.event.broadcast("changeView", this);
        }
    }

    translate(data: any) {
        console.log("translating data!");
        return 3;
    }

}

class View implements ISubscriber {
    event: EventObserver = new EventObserver();

    update(eventType: string, data: any) {
        console.log("updating View");
    }

    someLogic() {
        console.log("make some logic!");
        this.event.broadcast("changeView", null);
    }

    render() {

    }
}
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
    ticks?: number[];
    angle?: number;
    bifurcation?: boolean;
    hintAboveThumb?: boolean;
}

interface ISubscriber {
    update: (eventType: string, data: any) => void;
}

debugger;
let slider = new Model();
let view = new View();
let presenter = new Presenter(slider, view);
slider.update("hello", null);
console.log("\n");
view.someLogic();
