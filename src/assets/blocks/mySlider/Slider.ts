import { EventObserver, ISubscriber } from "./Helpers";
import { Model } from "./Model";
import { View } from "./View";

// export class Presenter implements ISubscriber {
export class Slider implements ISubscriber {
    private event: EventObserver = new EventObserver();
    private model: Model;
    private view: View;

    constructor(options: any) {
        this.model = new Model(options);
        this.view = new View(options);
        let [model, view] = [this.model, this.view];

        this.event.addSubscriber("changeView", model);
        model.event.addSubscriber("changeModel", this);

        this.event.addSubscriber("changeModel", view);
        view.event.addSubscriber("changeView", this);
        view.render();
        model.setThumbsPos(model.thumbLeftPos, model.thumbRightPos);
    }

    update(eventType: string, data: any) {
        if (eventType == "changeModel") {
            this.event.broadcast("changeModel", data);

        } else if (eventType == "changeView") {
            data.el = data.el.className.includes("left") ? "L" : "R";
            this.event.broadcast("changeView", data);
        }
    }
    
    setThumbsPos(leftPos, rightPos) {
        return this.model.setThumbsPos.call(this.model, leftPos, rightPos);
    }

    setOptions(options) {
        return this.model.setOptions.call(this.model, options);
    }

    getOption(optionName) {
        let res = `Option "${optionName}" doesn't exist!`;

        if (optionName in this.model) {
            res =  this.model[optionName];
        }  else if (optionName in this.view) {
            res =  this.view[optionName];
        }
        return res;
    }

    bindWith(selector: string, fnStart, fnEnd, fnRes) {
        let elemDom = <HTMLElement>document.querySelector(selector);
        if (!elemDom) return;

        let model = this.model;
        if (fnStart > fnEnd) {
            [fnStart, fnEnd] = [fnEnd, fnStart];
        }

        //создадим замыкание, чтобы не тащись в свойства elemSubscriber лишнего
        function update(eventType, data) {
            data = model.getThumbsOffset();
            return fnRes(elemDom, (fnEnd - fnStart) * data.L.offset + fnStart,
                (fnEnd - fnStart) * data.R.offset + fnStart);
        }

        let elemSubscriber = {
            update: update,
        }
        this.event.addSubscriber("changeView", elemSubscriber);
        this.event.addSubscriber("changeModel", elemSubscriber);

        this.model.event.broadcast("changeModel", this.model.getThumbsOffset());
    }
}