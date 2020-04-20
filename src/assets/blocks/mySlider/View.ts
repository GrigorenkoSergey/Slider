// import * as $ from "jquery";
import { EventObserver, ISubscriber, IViewOptions } from "./Helpers";

export class View implements ISubscriber {
    el: HTMLDivElement;
    event: EventObserver;
    className: string;
    angle: number;
    step: number = 10;
    min: number = 0;
    max: number = 100;
    //как-то должно взаимодействовать с моделью, может быть через презентер.
    constructor(options: IViewOptions) {
        let { div, className, angle, min, max, step } = options;
        this.el = document.querySelector(div);
        this.el.className = className;
        this.className = className;
        this.event = new EventObserver();
        this.angle = angle;
        this.step = step;
        this.max = max;
        this.min = min;
        this.render();
        this.addEventListeners();
    }

    update(eventType: string, data: any) {
        // console.log("updating View");
    }

    addEventListeners() {
        this.el.addEventListener("mousedown", (e) => mouseDownThumbHandler.call(this.el, e, this));
    }

    render() {
        let [thumbLeft, thumbRight] = new Array(2).fill(1).map(item => document.createElement('div'));

        thumbLeft.className = `${this.el.className}__thumb-left`;
        thumbRight.className = `${this.el.className}__thumb-right`;

        this.el.append(thumbLeft, thumbRight);
        this.el.style.transform = `rotate(${this.angle}deg)`;
    }
}

function mouseDownThumbHandler(e: any, self: View): void {
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

    let cosA = Math.cos(self.angle / 180 * Math.PI);
    let sinA = Math.sin(self.angle / 180 * Math.PI);

    let pixelStep = self.step * (slider.clientWidth - thumb.offsetWidth) / self.max;

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
        newLeft = takeStepIntoAccount(newLeft, pixelStep);

        thumb.style.left = newLeft + 'px';

        self.event.broadcast("changeView", {
            el: thumb,
            offset: newLeft / (slider.clientWidth - thumb.offsetWidth),
        });
    }

    function onMouseUp(e: MouseEvent): void {
        thumb.classList.remove(`${slider.className}__thumb_moving`);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    function takeStepIntoAccount(x: number, step: number) {
        return Math.floor(x / step) * step;
    }
}
