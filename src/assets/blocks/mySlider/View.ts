// import * as $ from "jquery";
import { EventObserver, ISubscriber, IViewOptions } from "./Helpers";

export class View implements ISubscriber {
    el: HTMLDivElement;
    event: EventObserver = new EventObserver();
    className: string;
    angle: number;
    step: number = 10;
    min: number = 0;
    max: number = 100;
    range: boolean;

    //как-то должно взаимодействовать с моделью, может быть через презентер.
    constructor(options: IViewOptions) {
        let { selector, className, angle, min, max, step, range } = options;
        Object.assign(this, { className, angle, min, max, step, range });

        this.el = document.querySelector(selector);
        this.el.className = className;
        this.step = step ? step : (this.max - this.min) / 100;
        this.render();
        this.addEventListeners();
    }

    update(eventType: string, data: any): void {
        const thumbList = (this.el.querySelectorAll("[class*=thumb]"));

        let leftThumb = <HTMLElement>thumbList[0];
        leftThumb.style.left = data.L.offset * (this.el.clientWidth - leftThumb.offsetWidth) + 'px';

        if (this.range) {
            let rightThumb = <HTMLElement>thumbList[1];
            rightThumb.style.left = data.R.offset * (this.el.clientWidth - rightThumb.offsetWidth) + 'px';
        }
    }

    addEventListeners(): void {
        this.el.addEventListener("mousedown", (e) => mouseDownThumbHandler.call(this.el, e, this));
    }

    render(): void {
        let [thumbLeft, thumbRight] = new Array(2).fill(1).map(item => document.createElement('div'));

        thumbLeft.className = `${this.el.className}__thumb-left`;
        if (this.range) {
            thumbRight.className = `${this.el.className}__thumb-right`;
        }

        this.el.append(thumbLeft, thumbRight);
        this.el.style.transform = `rotate(${this.angle}deg)`;
    }
}

function mouseDownThumbHandler(e: MouseEvent, self: View): void {
    //Применим всплытие, this - это элемент DOM, на котором навесили обработчик,
    // e.target - то, на котором сработало событие

    const thumb = <HTMLElement>e.target;
    if (!thumb.className.includes("thumb")) return;

    const slider = this;

    const thisCoord = this.getBoundingClientRect();
    const thumbCoords = thumb.getBoundingClientRect();

    const startX = thisCoord.left + this.clientLeft;
    const startY = thisCoord.top + this.clientTop;

    let cosA = Math.cos(self.angle / 180 * Math.PI);
    let sinA = Math.sin(self.angle / 180 * Math.PI);

    let pixelStep = self.step * (slider.clientWidth - thumb.offsetWidth) / self.max;

    //Найдем ограничители для бегунка 
    let leftLimit = 0;
    let rightLimit = slider.clientWidth - thumb.offsetWidth;

    let swapClassLimit: number | null; //Используется только при наличии второго бегунка

    if (self.range) {
        const thumbList = (this.querySelectorAll("[class*=thumb]"));
        const nextThumb = [].filter.call(thumbList, (item: Element) => item != e.target)[0];
        let nextThumbStyle = getComputedStyle(nextThumb);
        swapClassLimit = parseFloat(nextThumbStyle.left)
    }

    let shiftX = e.clientX - thumbCoords.left;
    let shiftY = e.clientY - thumbCoords.top;

    thumb.classList.add(`${slider.className}__thumb_moving`); //Если строчку написать раньше, то неверно будут определяться координаты

    let scaleInnerWidth = slider.clientWidth - thumb.offsetWidth; //for use in onMouseMove

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    function onMouseMove(e: MouseEvent): void {
        e.preventDefault();
        thumb.style.zIndex = "" + 1000;

        let newLeftX = e.clientX - startX - shiftX;
        let newLeftY = e.clientY - startY - shiftY;
        let newLeft = newLeftX * cosA + newLeftY * sinA;

        newLeft = Math.max(leftLimit, newLeft);
        newLeft = Math.min(newLeft, rightLimit);
        newLeft = takeStepIntoAccount(newLeft, pixelStep);

        thumb.style.left = newLeft + 'px';

        if (self.range) {
            if (thumb.className.includes("right")) {
                (newLeft < swapClassLimit) && swapThumbClasses();
            } else {
                (newLeft > swapClassLimit) && swapThumbClasses();
            }
        }

        self.event.broadcast("changeView", {
            el: thumb,
            offset: newLeft / scaleInnerWidth,
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

    function swapThumbClasses(): void {
        const left = (slider.querySelector("[class*=left]"));
        const right = (slider.querySelector("[class*=right]"));

        left.className = left.className.replace(/left/, "right");
        right.className = right.className.replace(/right/, "left");
    }
}
