import { EventObserver, ISubscriber } from "./Helpers";
import { Model } from "./Model";
import { View } from "./View";

export class Slider implements ISubscriber {
    private event: EventObserver = new EventObserver();
    private model: Model;
    private view: View;
    private handlers = {};//& непосредственное хранение функций-обработчиков событий
    private eventsGenerators = {}; //& для глобального хранения функций, заставлющих генерировать события

    constructor(options: any) {
        this.model = new Model(options);
        this.view = new View(options);
        let [model, view] = [this.model, this.view];

        if (this.view.hintAboveThumb) {
            let hint = this.view.hintEl;

            this._showTip = this._showTip.bind(this);
            this.addDomEvent("mousedown", this._showTip);

            let fnRes = (elem, leftX, resLeft, rightX, resRight, data) => {
                let res = data.el == "L" ? leftX : rightX;
                elem.textContent = "" + Math.round(res);
            };

            this.bindWith(hint, model.min, model.max, fnRes);
        }

        this.event.addSubscriber("changeView", model);
        model.event.addSubscriber("changeModel", this);

        this.event.addSubscriber("changeModel", view);
        view.event.addSubscriber("changeView", this);

        view.render();
        model.setThumbsPos(model.thumbLeftPos, model.thumbRightPos);
    }

    addDomEvent(eventType, func) { //&
        //func(e, data)
        function _addEventBroadcast(e) {
            return this.event.broadcast(eventType, e);
        }

        if (!(eventType in this.view.event.observers)) {
            this.handlers[eventType] = [];

            let bindedFunc = _addEventBroadcast.bind(this.view);
            this.view.el.addEventListener(eventType, bindedFunc);
            this.eventsGenerators[eventType] = bindedFunc;
        }

        this.handlers[eventType].push(func);
        this.view.event.addSubscriber(eventType, this);
    }

    removeDomEventHandler(eventType, func) {//&
        this.handlers[eventType] = this.handlers[eventType].filter(handler => handler != func);
    }

    removeDomEvent(eventType) {//&
        this.view.el.removeEventListener(eventType, this.eventsGenerators[eventType]);
        delete this.eventsGenerators[eventType];
    }

    update(eventType: string, data: any) {
        if (eventType == "changeModel") {
            this.event.broadcast("changeModel", data);

        } else if (eventType == "changeView") {
            data.el = data.el.className.includes("left") ? "L" : "R";
            this.event.broadcast("changeView", data);

        } else {
            this.handlers[eventType].forEach(func => func(data, this.model.getThumbsOffset()));
        }

        if (!this.view.hintAboveThumb) {
            this.removeDomEventHandler("mousedown", this._showTip);
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
            res = this.model[optionName];
        } else if (optionName in this.view) {
            res = this.view[optionName];
        }
        return res;
    }

    bindWith(elemDom: HTMLElement, fnStart: number, fnEnd: number, fnRes) {
        //fnRes(elem, countedLeftX, scaledLeftX, countedRightX, scaledRightX, data)
        if (elemDom == null) return;

        let model = this.model;
        let { min, max } = this.model;
        if (fnStart > fnEnd) {
            [fnStart, fnEnd] = [fnEnd, fnStart];
        }

        //создадим замыкание, чтобы не тащись в свойства elemSubscriber лишнего
        function update(eventType, data) {
            let dataModel = model.getThumbsOffset();
            return fnRes(elemDom,
                dataModel.L.x, dataModel.L.x * (fnEnd - fnStart) / (max - min) + fnStart,
                dataModel.R.x, dataModel.R.x * (fnEnd - fnStart) / (max - min) + fnStart,
                data);
        }

        let elemSubscriber = {
            update: update,
        }
        this.event.addSubscriber("changeView", elemSubscriber);
        this.event.addSubscriber("changeModel", elemSubscriber);

        this.model.event.broadcast("changeModel", this.model.getThumbsOffset());
    }

    _showTip(e, data) {
        let res = e.target.className.includes('left') ? data.L.x : data.R.x;
        this.view.hintEl.textContent = "" + Math.round(res);
    }
}