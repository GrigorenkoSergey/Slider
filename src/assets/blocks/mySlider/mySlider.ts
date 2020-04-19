import * as $ from "jquery";
import {Model} from "./Model";
import {View} from "./View";
import {Presenter} from "./Presenter";

// let slider = new Model();
// let view = new View();
// let presenter = new Presenter(slider, view);
// slider.update("hello", null);
// console.log("\n");
// view.someLogic();

let slider1 = new View(".slider1", "slider", 0);
let slider2 = new View(".slider2", "slider", 90);
let slider3 = new View(".slider3", "slider", 45);
// console.log($div);