// import * as $ from "jquery";
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

    setThumbsPos(leftPos, rightPos) {
        return this.model.setThumbsPos.call(this.model, leftPos, rightPos);
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

let options4 = {
    min: 0,
    max: 100,
    step: 1,
    selector: ".slider4",
    className: "slider",
    angle: 0,
    range: false,
}

let slider1 = new Slider(options1);
slider1.setThumbsPos(100, 20000);

let slider2 = new Slider(options2);
slider2.setThumbsPos(200, 600);

let slider3 = new Slider(options3);
slider3.setThumbsPos(200, 600);

let slider4 = new Slider(options4);
slider4.presenter.bindWith("h2", 0, 40, fnRes4);
slider4.setThumbsPos(50, null);

function fnRes4 (elem, resLeft, resRight) {
    resLeft = Math.round(resLeft);
    let resStr = "hsl(" + resLeft + ", 100%, 50%)";
    elem.style.color = resStr;
}

slider1.presenter.bindWith('p', 0, document.querySelector('p').textContent.length, fnRes1)
let pContent = document.querySelector('p').textContent;
function fnRes1(elem, resLeft, resRight) {
    resLeft = Math.round(resLeft);
    resRight = Math.round(resRight)
    elem.textContent = pContent.slice(resLeft, resRight);
}


// debugger;