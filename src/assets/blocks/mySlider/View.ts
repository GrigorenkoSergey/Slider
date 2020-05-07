import { EventObserver, ISubscriber, IViewOptions, debuggerPoint } from "./Helpers";

type Obj = { [key: string]: any };
type ViewUpdateDataFormat = {
    "L": { x: number, offset: number },
    "R": { x: number, offset: number }
};

export class View implements ISubscriber {
    el: HTMLDivElement;
    observer: EventObserver = new EventObserver();
    className: string = "slider";
    angle: number = 0;
    step: number = 10;
    min: number = 0;
    max: number = 100;
    range: boolean = true;
    selector: string = "";
    hintAboveThumb = false;
    hintEl: HTMLDivElement;
    thumbLeft: HTMLElement;
    thumbRight: HTMLElement;

    constructor(options: IViewOptions) {
        this.setOptions.call(this, options);

        let wrapper = document.querySelector(this.selector);
        [this.el, this.hintEl, this.thumbLeft, this.thumbRight] = new Array(4).fill(1).map(item => document.createElement('div'));
        wrapper.append(this.el);

        this.el.classList.add(this.className);
        if (!("step" in options) || this.step === 0) this.step = (this.max - this.min) / 100; //На будущее можно вынести в отдельный объект с дефолтными настройками.
    }

    setOptions(options: { [key: string]: any }) {
        let expectant: Obj = {};
        Object.keys(options).filter(prop => prop in this)
            .forEach(prop => expectant[prop] = options[prop])

        this._validateOptions(expectant) && Object.assign(this, expectant);
    }

    update(eventType: string, data: ViewUpdateDataFormat): void {
        this.thumbLeft.style.left =
            data.L.offset * (this.el.clientWidth - this.thumbLeft.offsetWidth) + 'px';

        if (this.range) {
            this.el.append(this.thumbRight);
            this.thumbRight.style.left = data.R.offset * (this.el.clientWidth - this.thumbRight.offsetWidth) + 'px';
        } else {
            this.thumbRight.remove();
        }

        this.el.style.transform = `rotate(${this.angle}deg)`;
    }

    render(): void {
        let { thumbLeft, thumbRight } = this;

        this.hintEl.className = `${this.className}__hint`;
        this.hintEl.textContent = "HINT!";

        thumbLeft.className = `${this.className}__thumb-left`;
        thumbRight.className = `${this.className}__thumb-right`;

        this.el.append(thumbLeft);
        this.range && this.el.append(thumbRight);

        this.el.style.transform = `rotate(${this.angle}deg)`;
        this._addEventListeners();
    }

    private _addEventListeners(): void {
        this.el.addEventListener("mousedown", (e) => mouseDownThumbHandler.call(this.el, e, this));
    }

    private _validateOptions(expectant: Obj): never | true {
        let obj: Obj = Object.assign({}, this);
        Object.assign(obj, expectant);

        let shouldBeNumbers: string[] = ["max", "min", "step", "angle"];
        shouldBeNumbers.forEach(key => obj[key] = Number(obj[key]));

        let { min, max, step, angle } = obj;

        if (!isFinite(min)) throw new Error("min should be a number!");
        if (!isFinite(max)) throw new Error("max should be a number");
        if (!isFinite(step)) throw new Error("step should be a number!");
        if (angle && !isFinite(angle)) throw new Error("angle should be a number!");

        if (max < min) throw new Error("max should be greater then min!");
        if ((max - min) % step) this.max = min + Math.floor((max - min) / step) * step;
        if (angle && angle < 0 || angle > 90) throw new Error("angle should be >= 0 and <= 90");

        return true;
    }
}

function mouseDownThumbHandler(e: MouseEvent, self: View): void {
    //Применим всплытие, this - это элемент DOM, на котором навесили обработчик,
    // e.target - то, на котором сработало событие
    e.preventDefault();

    const thumb = <HTMLElement>e.target;
    if (!thumb.className.includes("thumb")) return;

    const slider: HTMLDivElement = this;
    const thisCoord: DOMRect = this.getBoundingClientRect();
    const thumbCoords: DOMRect = thumb.getBoundingClientRect();

    const startX: number = thisCoord.left + this.clientLeft;
    const startY: number = thisCoord.top + this.clientTop;

    let cosA: number = Math.cos(self.angle / 180 * Math.PI);
    let sinA: number = Math.sin(self.angle / 180 * Math.PI);

    let pixelStep: number = self.step * (slider.clientWidth - thumb.offsetWidth) / self.max;

    //Найдем ограничители для бегунка 
    let leftLimit: number = 0;
    let rightLimit: number = slider.clientWidth - thumb.offsetWidth;

    let swapClassLimit: number | null; //Используется только при наличии второго бегунка

    if (self.range) {
        const thumbList = (this.querySelectorAll("[class*=thumb]"));
        const nextThumb = [].filter.call(thumbList, (item: Element) => item != e.target)[0];
        let nextThumbStyle = getComputedStyle(nextThumb);
        swapClassLimit = parseFloat(nextThumbStyle.left)
    }

    let shiftX: number = e.clientX - thumbCoords.left;
    let shiftY: number = e.clientY - thumbCoords.top;

    if (self.hintAboveThumb) {
        thumb.append(self.hintEl);
    }
    thumb.classList.add(`${self.className}__thumb_moving`); //Если строчку написать раньше, то неверно будут определяться координаты


    let scaleInnerWidth = slider.clientWidth - thumb.offsetWidth; //for use in onMouseMove
    self.observer.broadcast("changeView", { //при любом событии элементы впредь будут пищать о нем ))
        el: thumb,
        offset: parseFloat(getComputedStyle(thumb).left) / scaleInnerWidth,
    });

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    function onMouseMove(e: MouseEvent): void {
        e.preventDefault();
        thumb.style.zIndex = "" + 1000;

        let newLeftX: number = e.clientX - startX - shiftX;
        let newLeftY: number = e.clientY - startY - shiftY;
        let newLeft: number = newLeftX * cosA + newLeftY * sinA;

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

        self.observer.broadcast("changeView", {
            el: thumb,
            offset: newLeft / scaleInnerWidth,
        });
    }

    function onMouseUp(e: MouseEvent): void {
        thumb.classList.remove(`${self.className}__thumb_moving`);
        self.hintEl.remove();
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    function takeStepIntoAccount(x: number, step: number): number {
        return Math.round(x / step) * step;
    }

    function swapThumbClasses(): void {
        [self.thumbLeft, self.thumbRight] = [self.thumbRight, self.thumbLeft];
        self.thumbRight.className = self.thumbRight.className.replace(/left/, "right");
        self.thumbLeft.className = self.thumbLeft.className.replace(/right/, "left");
    }
}