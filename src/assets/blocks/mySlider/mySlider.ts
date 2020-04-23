import { Model } from "./Model";
import { View } from "./View";
import { Presenter } from "./Presenter";

export class Slider {
    private model: Model;
    private view: View;
    private presenter: Presenter;

    constructor(options: any) {
        this.model = new Model(options);
        this.view = new View(options);
        this.presenter = new Presenter(this.model, this.view);
    }

    setThumbsPos(leftPos, rightPos) {
        return this.model.setThumbsPos.call(this.model, ...arguments);
    }

    bindWith(selector: string, fnStart, fnEnd, fnRes) {
        return this.presenter.bindWith.call(this.presenter, ...arguments);
    }
}