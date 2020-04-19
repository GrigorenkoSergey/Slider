import {EventObserver, IModel, ISubscriber} from "./Helpers";

export class Model implements IModel, ISubscriber {
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
