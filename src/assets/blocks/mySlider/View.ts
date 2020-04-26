import { EventObserver, ISubscriber, IViewOptions, debuggerPoint } from "./Helpers";

export class View implements ISubscriber {
    el: HTMLDivElement;
    event: EventObserver = new EventObserver();
    className: string = "";
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

        this.el = document.querySelector(this.selector);
        this.hintEl = document.createElement('div');
        [this.thumbLeft, this.thumbRight] = new Array(2).fill(1).map(item => document.createElement('div'));

        this.el.classList.add(this.className);
        this.step = this.step ? this.step : (this.max - this.min) / 100;
    }

    setOptions(options) {
        let expectant = {};
        Object.keys(options).filter(prop => prop in this)
            .forEach(prop => expectant[prop] = options[prop])

        this._validateOptions(expectant) && Object.assign(this, expectant);
    }

    update(eventType: string, data: any): void {
        this.thumbLeft.style.left =
            data.L.offset * (this.el.clientWidth - this.thumbLeft.offsetWidth) + 'px';

        if (this.range) {
            this.thumbRight.style.left = data.R.offset * (this.el.clientWidth - this.thumbRight.offsetWidth) + 'px';
            this.el.append(this.thumbRight);
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

    _addEventListeners(): void {
        this.el.addEventListener("mousedown", (e) => mouseDownThumbHandler.call(this.el, e, this));
    }

    _validateOptions(expactant) {
        let obj = Object.assign({}, this);
        Object.assign(obj, expactant);

        let shouldBeNumbers = ["max", "min", "step", "angle"];
        shouldBeNumbers.forEach(key => obj[key] = Number(obj[key]));

        let { min, max, step, angle } = obj;
        // if (debuggerPoint.start) debugger;

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

    if (self.hintAboveThumb) {
        thumb.append(self.hintEl);
    }
    thumb.classList.add(`${self.className}__thumb_moving`); //Если строчку написать раньше, то неверно будут определяться координаты


    let scaleInnerWidth = slider.clientWidth - thumb.offsetWidth; //for use in onMouseMove

    self.event.broadcast("changeView", { //при любом событии элементы впредь будут пищать о нем ))
        el: thumb,
        offset: parseFloat(getComputedStyle(thumb).left) / scaleInnerWidth,
    });

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
        thumb.classList.remove(`${self.className}__thumb_moving`);
        self.hintEl.remove();
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    function takeStepIntoAccount(x: number, step: number) {
        return Math.round(x / step) * step;
    }

    function swapThumbClasses(): void {
        // const left = (slider.querySelector("[class*=left]"));
        // const right = (slider.querySelector("[class*=right]"));

        [self.thumbLeft, self.thumbRight] = [self.thumbRight, self.thumbLeft];
        // left.className = left.className.replace(/left/, "right");
        // left.className = left.className
        self.thumbRight.className = self.thumbRight.className.replace(/left/, "right");
        self.thumbLeft.className = self.thumbLeft.className.replace(/right/, "left");
        // right.className = right.className.replace(/right/, "left");
    }
}