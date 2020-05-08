import { EventObserver, ISubscriber, debuggerPoint } from "./Helpers";
import { Model } from "./Model";
import { View } from "./View";

type fnResType = (elem: HTMLElement, leftX: number, scaledLeftX: number,
    rightX: number, scaledRightX: number, data: any) => void;
type Obj = { [key: string]: any };

export class Slider implements ISubscriber {
    _model: Model; //Хотел сделать приватными, но для отладки довольно неудобно. Перенастраивать Karma для js неохота..
    _view: View;
    private observer: EventObserver = new EventObserver();
    private bindedElements: Array<ISubscriber & { el: HTMLElement }> = [];

    constructor(options: any) {
        this._model = new Model(options);
        this._view = new View(options);
        let [model, view] = [this._model, this._view];

        this.observer.addSubscriber("changeView", model);
        model.observer.addSubscriber("changeModel", this);

        this.observer.addSubscriber("changeModel", view);
        view.observer.addSubscriber("changeView", this);
        // view.render(); //перестал видеть причины для выноса в отдельный метод

        model.setThumbsPos(model.thumbLeftPos, model.thumbRightPos);

        //Займемся подсказкой
        let hint = this._view.hintEl;
        let fnRes: fnResType = (elem, leftX, resLeft, rightX, resRight, data) => {
            let res = data.el == "L" ? leftX : rightX;
            elem.textContent = "" + Math.round(res);
        }
        //Информация в подсказке должна отображаться уже после того, как обработана модель и вид, поэтому она добавлена именно в конце.
        this.bindWith(hint, this._model.min, this._model.max, fnRes);
    }

    update(eventType: string, data: any): void {
        if (eventType == "changeModel") {
            //for View data should be {"L": {x: number, offset: number}, "R": {x: number, offset: number}}
            //data.offset should be in range from 0 to 1
            this.observer.broadcast("changeModel", data);

        } else if (eventType == "changeView") {
            //for Model data should be {el: HTMLDivElement, offset: number}
            //data.el.className should contain "left" of "right" substrings
            data.el && (data.el = data.el.className.includes("left") ? "L" : "R");
            this.observer.broadcast("changeView", data);
        }
    }

    setThumbsPos(leftPos: number, rightPos?: number): void {
        return this._model.setThumbsPos.call(this._model, leftPos, rightPos);
    }

    setOptions(options: Obj): Slider {
        this._model.setOptions.call(this._model, options);
        this._view.setOptions.call(this._view, options);
        this._view.update("changeModel", this._model.getThumbsOffset());

        return this;
    }

    getOptions() {
        let viewOps = this._view.getOptions.call(this._view);
        let modelOps = this._model.getOptions.call(this._model);
        //Сравним, совпадают ли значения общих опций, если нет (А ВДРУГ????), выкинем ошибку для отладки

        let synchronized = Object.keys(viewOps).every(key => { 
           return key in modelOps ? viewOps[key] === modelOps[key] : true;
        });

        if (!synchronized) throw new Error("Модель не синхронизирована с View!");
        
        return Object.assign({}, viewOps, modelOps);
    }

    bindWith(elemDom: HTMLElement, fnStart: number, fnEnd: number, fnRes: fnResType) {
        //fnRes(elem, leftX, scaledLeftX, rightX, scaledRightX, data)

        let model = this._model;
        let { min, max } = model;
        if (fnStart > fnEnd) {
            [fnStart, fnEnd] = [fnEnd, fnStart];
        }

        //создадим замыкание, чтобы не тащись в свойства elemSubscriber лишнего
        function update(eventType: string, data: any) {

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
        this.observer.addSubscriber("changeView", elemSubscriber);
        this.observer.addSubscriber("changeModel", elemSubscriber);

        this._model.observer.broadcast("changeModel", this._model.getThumbsOffset());
        this.bindedElements.push(elemSubscriber);
    }

    unbindFrom(elemDom: HTMLElement): Slider {
        let elemSubscriber = this.bindedElements.find(elem => elem.el === elemDom);

        this.observer.removeSubscriber("changeView", elemSubscriber);
        this.observer.removeSubscriber("changeModel", elemSubscriber);
        this.bindedElements = this.bindedElements.filter(elem => elemSubscriber);
        return this;
    }
}