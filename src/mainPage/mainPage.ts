import "./mainPage.scss";
import "../assets/blocks/range-slider/range-slider";
import { Slider } from "../assets/blocks/mySlider/Slider";
import { debuggerPoint } from "../assets/blocks/mySlider/Helpers";

let options1 = {
    // ticks: { 1000: 100, 20000: 150 },
    max: 10000,
    min: 0,
    step: 100,
    selector: ".slider1",
    className: "slider",
    angle: 0,
    range: true,
    thumbLeftPos: 200,
    thumbRightPos: 8000,
    hintAboveThumb: true
}

let options2 = {
    max: 1000,
    min: 0,
    step: 10,
    selector: ".slider2",
    className: "slider",
    // angle: 45,
    angle: 0,
    range: false,
    hintAboveThumb: true
}

let options3 = {
    max: 1000,
    min: 0,
    step: 10,
    selector: ".slider3",
    className: "slider",
    // angle: 90,
    angle: 0,
    range: false,
    thumbLeftPos: 500,
    hintAboveThumb: true
}

let options4 = {
    min: 0,
    max: 100,
    step: 1,
    selector: ".slider4",
    className: "slider",
    angle: 0,
    range: false,
    hintAboveThumb: true
}

let options5 = {
    min: 0,
    max: 100,
    step: 1,
    selector: ".slider5",
    className: "slider",
    angle: 0,
    range: false,
}

let slider1 = new Slider(options1);
slider1.setThumbsPos(100, 10000);
let pContent = document.querySelector('p').textContent;
slider1.bindWith(document.querySelector('p'), 0, document.querySelector('p').textContent.length, fnRes1);

function fnRes1(elem, leftX, resLeft, rightX, resRight) {
    resLeft = Math.round(resLeft);
    resRight = Math.round(resRight);
    elem.textContent = pContent.slice(resLeft, resRight);
}

let slider2 = new Slider(options2);
slider2.setThumbsPos(200, 600);
slider2.bindWith(document.querySelector("span"), 0, 20, fnRes2);

function fnRes2(elem, leftX, resLeft, rightX, resRight, data) {
    elem.style.textShadow = resLeft + "px 19px 7px grey";
}


let slider3 = new Slider(options3);
slider3.setThumbsPos(500, 600);
slider3.bindWith(document.querySelector('.imgSprite'), 0, 13, fnRes3);

function fnRes3(elem, leftX, resLeft) {
    let imgWidth = 918 / 5;
    let imgHeight = 506 / 3;
    resLeft = Math.round(resLeft);

    let offsetLeft = imgWidth * (resLeft % 5);
    let offsetTop = imgHeight * Math.floor(resLeft / 5);

    elem.style.backgroundPositionX = -offsetLeft + "px";
    elem.style.backgroundPositionY = -offsetTop + "px";
}

let slider4 = new Slider(options4);


let slider5 = new Slider(options5);
slider5.bindWith(document.querySelector('span'), 200, 360, fnRes4);

function fnRes4(elem, leftX, resLeft) {
    resLeft = Math.round(resLeft);
    let resStr = "hsl(" + resLeft + ", 100%, 50%)";
    elem.style.color = resStr;
}



let arr = [slider1, slider2, slider3, slider4, slider5];

let inputs: Array<HTMLElement> = Array.from(document.querySelectorAll(".slider-options__input"));

for (let i = 0; i < inputs.length; i++) {
    getInputValue(inputs[i]);
    inputs[i].addEventListener("change", onChangeInputValue);
}

function getInputValue(input) {
    let num = +input.dataset.id.match(/\d+/)[0];
    let option = input.name;
    input.value = arr[num - 1].getOption(option);
    if (input.name === "thumbRightPos") {
        let disabled = arr[num - 1].getOption("range");
        if (!disabled) {
            input.disabled = true;
            input.value ='';
        }
    }
}

function onChangeInputValue(e) {
    let input = e.target;
    let num = +input.dataset.id.match(/\d+/)[0];
    let option = input.name;
    arr[num - 1].setOptions({ [option]: input.value });
    inputs.forEach(item => getInputValue(item));
}

let checkboxes = Array.from(document.querySelectorAll("[type=checkbox]"));
checkboxes.forEach((item: HTMLInputElement) => {
    let num = +item.dataset.id.match(/\d+/)[0];
    let prop = item.name;
    item.checked = arr[num - 1].getOption(prop);

    item.onchange = function(e) {
        arr[num - 1].setOptions({[prop]: item.checked});
    }
    console.log(item.checked);
})