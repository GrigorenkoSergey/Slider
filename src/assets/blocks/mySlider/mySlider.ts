// class Model implements IModel{
//     // event: EventObserver;
//     // min: number = 0;
//     // max: number = 100;
//     // thumbLeftPos: number = 0;
//     // thumbRightPos: number = 0;
//     // step: number = 10;
//     // ticks: number[] = [this.min, this.max];
//     // angle: number = 0;
//     // bifurcation: boolean = false;
//     // hintAboveThumb: boolean = false;


//     constructor(options: IModel) {
//         Object.assign(this, options);
//     }

//     // update(eventType, data) {
//     //     console.log("updating model");
//     //     this.event.broadcast("changeModel", this);
//     // }
// }

// interface IModel {
//     // event?: EventObserver;
//     min?: number 
//     max?: number 
//     thumbLeftPos?: number;
//     thumbRightPos?: number;
//     step?: number;
//     ticks?: number[];
//     angle?: number;
//     bifurcation?: boolean;
//     hintAboveThumb?: boolean;
// }

/*
class Presenter {
    constructor(model, view) {
        this.event = new EventObserver();

        this.event.addSubscriber("changeView", model);
        model && model.event && model.event.addSubscriber("changeModel", this);

        this.event.addSubscriber("changeModel", view);
        view && view.event && view.event.addSubscriber("changeView", this);
    }

    update(eventType, data) {
        if (eventType == "changeModel") {
            let result = this.translate(data);
            this.event.broadcast("changeModel", result);

        } else if (eventType == "changeView") {
            this.event.broadcast("changeView", this);
        }
    }

    translate(data) {
        console.log("translating data!");
        return 3;
    }

}

class View {
    constructor() {
        this.event = new EventObserver();
    }

    update(eventType, data) {
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
    constructor() {
        this.observers = {};
    }

    addSubscriber(eventType, obj) {
        this.observers[eventType] = this.observers[eventType] || [];
        this.observers[eventType].push(obj);
    }

    removeSubscriber(eventType, obj) {
        if (!this.observers[eventType]) return;
        this.observers[eventType] = this.observers[eventType].filter(subscriber => subscriber !== fn);
    }

    broadcast(eventType, data) {
        if (!this.observers[eventType]) return;
        this.observers[eventType].forEach(subscriber => subscriber && subscriber.update(eventType, data));
    }
}

let slider = new Model();
let view = new View();
let presenter = new Presenter(slider, view);

slider.update();
console.log("\n");
view.someLogic();
*/