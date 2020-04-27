import "./mainPage.scss";
import "../assets/blocks/range-slider/range-slider";
import { Slider } from "../assets/blocks/mySlider/Slider";
import { debuggerPoint } from "../assets/blocks/mySlider/Helpers";

let options1 = {
    min: 0,
    max: 100,
    step: 1,
    selector: ".slider1",
    className: "slider",
    angle: 0,
    range: false,
    hintAboveThumb: true
}
let slider1 = new Slider(options1);

let options5 = {
    max: 1000,
    min: 0,
    step: 10,
    selector: ".slider5",
    className: "slider",
    angle: 0,
    range: true,
    hintAboveThumb: true
}

debuggerPoint.start = 1;
let slider5 = new Slider(options5);

let pContent = document.querySelector('p').textContent;
slider5.bindWith(document.querySelector('p'), 0, document.querySelector('p').textContent.length, fnRes5);

function fnRes5(elem, leftX, resLeft, rightX, resRight) {
    resLeft = Math.round(resLeft);
    resRight = Math.round(resRight);
    elem.textContent = pContent.slice(resLeft, resRight);
}

let options6 = {
    max: 1000,
    min: 0,
    step: 10,
    selector: ".slider6",
    className: "slider",
    angle: 0,
    range: false,
    hintAboveThumb: true
}

let slider6 = new Slider(options6);
slider6.bindWith(document.querySelector("span"), 0, 20, fnRes6);

function fnRes6(elem, leftX, resLeft, rightX, resRight, data) {
    elem.style.textShadow = resLeft + "px 19px 7px grey";
}

let options7 = {
    min: 0,
    max: 100,
    step: 1,
    selector: ".slider7",
    className: "slider",
    angle: 65,
    range: false,
}







let slider7 = new Slider(options7);
slider7.bindWith(document.querySelector('span'), 200, 360, fnRes7);

function fnRes7(elem, leftX, resLeft) {
    resLeft = Math.round(resLeft);
    let resStr = "hsl(" + resLeft + ", 100%, 50%)";
    elem.style.color = resStr;
}

let options8 = {
    max: 1000,
    min: 0,
    step: 10,
    selector: ".slider8",
    className: "slider",
    angle: 0,
    range: false,
    hintAboveThumb: true
}

let slider8 = new Slider(options8);
// slider8.setThumbsPos(500, 600);
slider8.bindWith(document.querySelector('.imgSprite'), 0, 13, fnRes8);

function fnRes8(elem, leftX, resLeft) {
    let imgWidth = 918 / 5;
    let imgHeight = 506 / 3;
    resLeft = Math.round(resLeft);

    let offsetLeft = imgWidth * (resLeft % 5);
    let offsetTop = imgHeight * Math.floor(resLeft / 5);

    elem.style.backgroundPositionX = -offsetLeft + "px";
    elem.style.backgroundPositionY = -offsetTop + "px";
}

// let sliders = { slider1, slider2, slider3, slider4, slider5 };
let sliders = { slider1};
let inputs: Array<HTMLElement> = Array.from(document.querySelectorAll(".slider-options__input"));

for (let i = 0; i < inputs.length; i++) {
    getInputValue(inputs[i]);
    inputs[i].addEventListener("change", onChangeInputValue);
}

function getInputValue(input) {
    let option = input.name;
    let slider = sliders[input.dataset.id];
    input.value = slider.getOption(option);

    if (input.name === "thumbRightPos") {
        let disabled = !slider.getOption('range');
        input.disabled = disabled;

        if (disabled) input.value = "";
    }
}

function onChangeInputValue(e) {
    let input = e.target;
    let slider = sliders[input.dataset.id];
    let prop = input.name;
    slider.setOptions({ [prop]: input.value });
    inputs.forEach(item => getInputValue(item));
}

let checkboxes = Array.from(document.querySelectorAll("[type=checkbox]"));
checkboxes.forEach((item: HTMLInputElement) => {
    let slider = sliders[item.dataset.id];
    let prop = item.name;
    item.checked = slider.getOption(prop);

    item.onchange = function (e) {
        slider.setOptions({ [prop]: item.checked });
        inputs.forEach(item => getInputValue(item));
    }
});

let thumbsLeft = Array.from(document.querySelectorAll("[name=thumbLeftPos]"));
thumbsLeft.forEach((item: HTMLInputElement) => {
    let slider = sliders[item.dataset.id];
    slider.bindWith(item, slider.max, slider.min,
         (elem, leftX) => {item.value = leftX}
    )
});

let thumbsRight = Array.from(document.querySelectorAll("[name=thumbRightPos]"));
thumbsRight.forEach((item: HTMLInputElement) => {
    let slider = sliders[item.dataset.id];
    slider.bindWith(item, slider.max, slider.min,
         (elem, leftX, foo, rightX) => {item.value = rightX}
    )
});



