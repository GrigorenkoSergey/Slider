// import * as $ from "jquery";
import { EventObserver, ISubscriber } from "./Helpers";

export class View implements ISubscriber {
    el: HTMLDivElement;
    event: EventObserver;
    className: string;
    angle: number;

    constructor(div: string, className: string, angle: number) {
        this.el = document.querySelector(div);
        this.el.className = className;
        this.className = className;
        this.event = new EventObserver();
        this.el.setAttribute(`data-angle`, angle.toString()); //потом  убрать в другие свойства
        this.render();
        this.addEventListeners();
    }

    update(eventType: string, data: any) {
        console.log("updating View");
    }

    addEventListeners() {
        this.el.addEventListener("mousedown", mouseDownThumbHandler);
        // this.event.broadcast("changeView", null);
    }

    render() {
        let [thumbLeft, thumbRight] = new Array(2).fill(1).map(item => document.createElement('div'));

        thumbLeft.className = `${this.el.className}__thumb-left`;
        thumbRight.className = `${this.el.className}__thumb-right`;

        this.el.append(thumbLeft, thumbRight);
        this.el.style.transform = `rotate(${this.el.dataset.angle}deg)`;
    }
}

function mouseDownThumbHandler(e: any): void {
    //теоретически e: MouseEvent, но тогда перестают действовать цепочки вроде e.target.className
    //применим всплытие, this - это элемент DOM, на котором навесили обработчик,
    // e.target - то, на котором сработало событие

    if (!e.target.className.includes("thumb")) return;

    const slider = this;
    const thumb = e.target;

    const thisCoord = this.getBoundingClientRect();
    const thumbCoords = e.target.getBoundingClientRect();


    const startX = thisCoord.left + this.clientLeft;
    const startY = thisCoord.top + this.clientTop;

    //Найдем ограничители для бегунка 
    const thumbList = (this.querySelectorAll("[class*=thumb]"));
    const nextThumb = [].filter.call(thumbList, (item: Element) => item != e.target)[0];

    let cosA = Math.cos(slider.dataset.angle / 180 * Math.PI);
    let sinA = Math.sin(slider.dataset.angle / 180 * Math.PI);

    let leftLimit = 0;
    let rightLimit = slider.clientWidth - thumb.offsetWidth;
    let nextThumbStyle = getComputedStyle(nextThumb);

    if (nextThumb && nextThumb.className.includes('left')) {
        leftLimit = parseFloat(nextThumbStyle.left) + nextThumb.offsetWidth;
    }

    if (nextThumb && nextThumb.className.includes('right')) {
        rightLimit = parseFloat(nextThumbStyle.left) - thumb.offsetWidth;
    }

    let shiftX = e.clientX - thumbCoords.left;
    let shiftY = e.clientY - thumbCoords.top;

    thumb.classList.add(`${slider.className}__thumb_moving`); //Если строчку написать раньше, то неверно будут определяться координаты

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    function onMouseMove(e: MouseEvent): void {
        e.preventDefault();
        thumb.style.zIndex = 1000;

        let newLeftX = e.clientX - startX - shiftX;
        let newLeftY = e.clientY - startY - shiftY;
        let newLeft = newLeftX * cosA + newLeftY * sinA;

        newLeft = Math.max(leftLimit, newLeft);
        newLeft = Math.min(newLeft, rightLimit);

        thumb.style.left = newLeft + 'px';
    }

    function onMouseUp(e: MouseEvent): void {
        thumb.classList.remove(`${slider.className}__thumb_moving`);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }
}
