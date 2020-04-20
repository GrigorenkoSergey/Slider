import * as $ from "jquery";
import { Model } from "./Model";
import { View } from "./View";
import { Presenter } from "./Presenter";

// let slider = new Model();
// let view = new View();
// let presenter = new Presenter(slider, view);
// slider.update("hello", null);
// console.log("\n");
// view.someLogic();

// let slider2 = new View(".slider2", "slider", 90);
// let slider3 = new View(".slider3", "slider", 45);

let model1 = new Model({
    ticks: { 1000: 100, 20000: 150 },
    max: 20000,
    min: 0,
    step: 100,
});

let slider1 = new View({
    div: ".slider1",
    className: "slider",
    angle: 0,
    min: 0,
    max: 20000,
    step: 5000,
});

let presenter1 = new Presenter(model1, slider1);

console.log(model1);
// console.log($div);