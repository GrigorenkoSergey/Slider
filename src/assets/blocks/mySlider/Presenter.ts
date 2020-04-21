import { EventObserver, IModel, ISubscriber } from "./Helpers";
import { Model } from "./Model";
import { View } from "./View";

export class Presenter implements ISubscriber {
    event: EventObserver = new EventObserver();

    constructor(model: Model, view: View) {
        this.event.addSubscriber("changeView", model);
        model.event.addSubscriber("changeModel", this);

        this.event.addSubscriber("changeModel", view);
        view.event.addSubscriber("changeView", this);
        model.getThumbsOffset();
    }

    update(eventType: string, data: any) {
        if (eventType == "changeModel") {
            this.event.broadcast("changeModel", data);

        } else if (eventType == "changeView") {
            let result = this.translateToModel(data);
            this.event.broadcast("changeView", result);
        }
    }

    translateToModel(data: any) {
        data.el = data.el.className.includes("left") ? "L" : "R";
        return data;
    }
}