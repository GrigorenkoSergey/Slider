import "./mainPage.scss";
import { Slider } from "../assets/blocks/mySlider/Slider";
import { debuggerPoint } from "../assets/blocks/mySlider/Helpers";

let options1 = {
    min: 10,
    max: 100,
    step: 1,
    selector: ".slider1",
    angle: 0,
    range: true,
    hintAboveThumb: true,
}

// let slider1 = new Slider(options1);
let slider1 = $('.slider1').slider(options1);

let options2 = {
    min: 100,
    max: 2000,
    step: 1,
    selector: ".slider2",
    angle: 90,
    range: false,
    hintAboveThumb: true,
    thumbLeftPos: 800,
}
// let slider2 = new Slider(options2); //работает
// let slider2 = $('.slider2').slider(options2); //работает
let slider2 = $().slider(options2); //так тоже работает

let options3 = {
    min: 0,
    max: 1000,
    step: 1,
    selector: ".slider3",
    angle: 45,
    range: false,
    hintAboveThumb: true,
    rangeValue: ["Jan", "Dec"],
}

// let slider3 = new Slider(options3);
let slider3 = $('.slider3').slider(options3);

//Пример задания вообще левых значений
slider3.unbindFrom(slider3.hintEl);
let fnMonths: fnResType = (elem, leftX, scaledLeftX, rightX, scaledRightX, data) => {
    let months = ["Jan", "Feb", "March", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (data.el == "L") {
        elem.textContent = months[Math.round(scaledLeftX)];
    } else {
        elem.textContent = months[Math.round(scaledRightX)];
    }
}
slider3.bindWith(slider3.hintEl, 0, 11, fnMonths);

let options4 = {
    min: 100,
    max: 20000,
    ticks: { 500: 100, 10000: 150, 20000: 180 },
    step: 10,
    selector: ".slider4",
    angle: 0,
    range: false,
    hintAboveThumb: true
}
// let slider4 = new Slider(options4);
let slider4 = $('.slider4').slider(options4);

let options5 = {
    max: 100,
    min: 0,
    step: 1,
    selector: ".slider5",
    angle: 0,
    range: true,
    hintAboveThumb: true
}

//скопировали с сигнатуры коллбека функции bindWith (последнего аргумента)
type fnResType = (elem: HTMLElement, leftX: number, scaledLeftX: number, rightX: number, scaledRightX: number, data: any) => void;

let slider5 = new Slider(options5);
let pContent = document.querySelector('.slider5__p').textContent;

let fnResLine: fnResType = (elem, leftX, resLeft, rightX, resRight) => {
    resLeft = Math.round(resLeft);
    resRight = Math.round(resRight);
    elem.textContent = pContent.slice(resLeft, resRight);
}
slider5.bindWith(document.querySelector('.slider5__p'), 0, document.querySelector('.slider5__p').textContent.length, fnResLine);


let options6 = {
    max: 1000,
    min: 0,
    step: 10,
    selector: ".slider6",
    angle: 0,
    range: false,
    hintAboveThumb: true
}

// let slider6 = new Slider(options6);
let slider6 = $('.slider6').slider(options6);

let fnResShadow: fnResType = (elem, leftX, resLeft, rightX, resRight, data) => {
    elem.style.textShadow = resLeft + "px 19px 7px grey";
}
let fnResColor: fnResType = (elem, leftX, resLeft) => {
    resLeft = Math.round(resLeft);
    let resStr = "hsl(" + resLeft + ", 100%, 50%)";
    elem.style.color = resStr;
}
slider6.bindWith(document.querySelector("[class*=__text]"), 0, 20, fnResShadow);
slider6.bindWith(document.querySelector('[class*=__text]'), 200, 360, fnResColor);



let options7 = {
    max: 1000,
    min: 0,
    step: 10,
    selector: ".slider7",
    angle: 0,
    range: false,
    hintAboveThumb: true
}

// let slider7 = new Slider(options7);
let slider7 = $('.slider7').slider(options7);
let fnResBird: fnResType = (elem, leftX, resLeft) => {
    let imgWidth = 918 / 5;
    let imgHeight = 506 / 3;
    resLeft = Math.round(resLeft);

    let offsetLeft = imgWidth * (resLeft % 5);
    let offsetTop = imgHeight * Math.floor(resLeft / 5);

    elem.style.backgroundPositionX = -offsetLeft + "px";
    elem.style.backgroundPositionY = -offsetTop + "px";
}

slider7.bindWith(document.querySelector('.imgSprite'), 0, 13, fnResBird);


let sliders: { [key: string]: Slider } = { slider1, slider2, slider3, slider4, slider5, slider6, slider7 };

let inputs: Array<HTMLInputElement> = Array.from(document.querySelectorAll(".slider-options__input"));

for (let i = 0; i < inputs.length; i++) {
    getInputValue(inputs[i]);
    inputs[i].addEventListener("change", onChangeInputValue);
}

function getInputValue(input: HTMLInputElement) {
    let option = input.name;
    let slider = sliders[input.dataset.id];

    input.value = slider.getOptions()[option];

    if (input.name === "thumbRightPos") {
        let disabled = !slider.getOptions().range;
        input.disabled = disabled;

        if (disabled) input.value = "";
    }
}

function onChangeInputValue(e: Event): void {
    // debuggerPoint.start += 1; //Специально оставил на будущее, чтобы не вспоминать технику отладки
    let input = <HTMLInputElement>e.target;
    let slider = sliders[input.dataset.id];
    let prop = input.name;

    slider.setOptions({ [prop]: input.value });
    inputs.forEach(item => getInputValue(item));
}

let checkboxes = Array.from(document.querySelectorAll("[type=checkbox]"));
checkboxes.forEach((item: HTMLInputElement) => {
    let slider = sliders[item.dataset.id];
    let prop = item.name;
    item.checked = slider.getOptions()[prop];

    item.onchange = function (e) {
        slider.setOptions({ [prop]: item.checked });
        inputs.forEach(item => getInputValue(item));
    }
});

let thumbsLeft = Array.from(document.querySelectorAll("[name=thumbLeftPos]"));
thumbsLeft.forEach((item: HTMLInputElement) => {
    let slider = sliders[item.dataset.id];
    slider.bindWith(item, slider.getOptions().max, slider.getOptions().min,
        (elem, leftX) => { item.value = leftX.toString() }
    )
});

let thumbsRight = Array.from(document.querySelectorAll("[name=thumbRightPos]"));
thumbsRight.forEach((item: HTMLInputElement) => {
    let slider = sliders[item.dataset.id];
    slider.bindWith(item, slider.getOptions().max, slider.getOptions().min,
        (elem, leftX, foo, rightX) => { item.value = rightX.toString() }
    )
});
debuggerPoint.start = 1;