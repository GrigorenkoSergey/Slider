import * as $ from "jquery";
import { Model } from "./Model";
import { View } from "./View";
import { Presenter } from "./Presenter";

class Slider {
    model: Model;
    view: View;
    presenter: Presenter;

    constructor(options: any) {
        this.model = new Model(options);
        this.view = new View(options);
        this.presenter = new Presenter(this.model, this.view);
    }

    setLeftThumbPos(value: number) {
        if (value < this.model.min || value > this.model.max) return;
        console.log(this.model.thumbLeftPos);
        this.model.thumbLeftPos = value;
        this.model._offsetLeft = this.model._findOffset(value);

        this.presenter.update("changeModel",  {
            "L": { x: this.model.thumbLeftPos, "offset": this.model._offsetLeft},
            "R": { x: this.model.thumbRightPos, "offset": this.model._offsetRight },
        });
    }
}

let options1 = {
    ticks: {1000: 100, 20000: 150},
    max: 20000,
    min: 0,
    step: 100,
    selector: ".slider1",
    className: "slider",
    angle: 0,
    range: true,
    thumbLeftPos: 200,
    thumbRightPos: 8000
}

let options2 = {
    max: 1000,
    min: 0,
    step: 100,
    selector: ".slider2",
    className: "slider",
    angle: 45,
    range: true,
}

let options3 = {
    max: 1000,
    min: 0,
    step: 10,
    selector: ".slider3",
    className: "slider",
    angle: 90,
    range: false,
    thumbLeftPos: 500,
}

let slider1 = new Slider(options1);
slider1.setLeftThumbPos(0);
let slider2 = new Slider(options2);
let slider3 = new Slider(options3);
