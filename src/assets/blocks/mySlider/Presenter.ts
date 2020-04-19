import {EventObserver, IModel, ISubscriber} from "./Helpers";
import {Model} from "./Model";
import {View} from "./View";

export class Presenter implements ISubscriber {
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