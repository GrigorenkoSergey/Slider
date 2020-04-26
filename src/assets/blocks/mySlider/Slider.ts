import { EventObserver, ISubscriber, debuggerPoint } from "./Helpers";
import { Model } from "./Model";
import { View } from "./View";

export class Slider implements ISubscriber {
    private event: EventObserver = new EventObserver();
    private model: Model;
    private view: View;
    private bindedElements = [];

    constructor(options: any) {
        this.model = new Model(options);
        this.view = new View(options);
        let [model, view] = [this.model, this.view];

        if (this.view.hintAboveThumb) {
            let hint = this.view.hintEl;

            let fnRes = (elem, leftX, resLeft, rightX, resRight, data) => {
                let res = data.el == "L" ? leftX : rightX;
                elem.textContent = "" + Math.round(res);
            }

            this.bindWith(hint, this.model.min, this.model.max, fnRes);
        }

        this.event.addSubscriber("changeView", model);
        model.event.addSubscriber("changeModel", this);

        this.event.addSubscriber("changeModel", view);
        this.event.addSubscriber("updateView", view);//?
        view.event.addSubscriber("changeView", this);
        view.render();
        model.setThumbsPos(model.thumbLeftPos, model.thumbRightPos);
    }

    update(eventType: string, data: any) {
        if (eventType == "changeModel") {
            this.event.broadcast("changeModel", data);

        } else if (eventType == "changeView") {
            data.el && (data.el = data.el.className.includes("left") ? "L" : "R");
            this.event.broadcast("changeView", data);
        }
    }

    setThumbsPos(leftPos, rightPos) {
        return this.model.setThumbsPos.call(this.model, leftPos, rightPos);
    }

    setOptions(options) {
        this.model.setOptions.call(this.model, options);
        this.view.setOptions.call(this.view, options);
        this.view.update("changeModel", this.model.getThumbsOffset());

        return this;
    }

    getOption(optionName) {
        let res = `Option "${optionName}" doesn't exist!`;

        if (optionName in this.model) {
            res = this.model[optionName];
        } else if (optionName in this.view) {
            res = this.view[optionName];
        }
        return res;
    }

    bindWith(elemDom: HTMLElement, fnStart: number, fnEnd: number, fnRes) {
        //fnRes(elem, leftX, scaledLeftX, rightX, scaledRightX, data)

        let model = this.model;
        let { min, max } = model;
        if (fnStart > fnEnd) {
            [fnStart, fnEnd] = [fnEnd, fnStart];
        }

        //создадим замыкание, чтобы не тащись в свойства elemSubscriber лишнего
        function update(eventType, data) {
            let dataModel = model.getThumbsOffset();
            return fnRes(elemDom,
                dataModel.L.x, (fnEnd - fnStart) / (max - min) * dataModel.L.x + fnStart,
                dataModel.R.x, (fnEnd - fnStart) / (max - min) * dataModel.R.x + fnStart,
                data);
        }

        let elemSubscriber = {
            update: update,
            el: elemDom,
        }
        this.event.addSubscriber("changeView", elemSubscriber);
        this.event.addSubscriber("changeModel", elemSubscriber);

        this.model.event.broadcast("changeModel", this.model.getThumbsOffset());
        this.bindedElements.push(elemSubscriber);
    }

    unbindFrom(elemDom) { //не тестировал.
        let elemSubscriber = this.bindedElements.find(elem => elem.el === elemDom);

        this.event.removeSubscriber("chageView", elemSubscriber);
        this.event.removeSubscriber("changeModel", elemSubscriber);
        this.bindedElements = this.bindedElements.filter(elem => elemSubscriber);
    }
}