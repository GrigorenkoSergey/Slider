import { EventObserver, ISubscriber, IViewOptions, debuggerPoint } from "./Helpers";

type Obj = { [key: string]: any };
type ViewUpdateDataFormat = {
    "L": { x: number, offset: number },
    "R": { x: number, offset: number }
};

export class View extends EventObserver implements ISubscriber {
    el: HTMLDivElement;
    className: string = "slider";
    angle: number = 0;
    step: number = 10;
    min: number = 0;
    max: number = 100;
    range: boolean = true;
    selector: string = "";
    hintAboveThumb = true;
    hintEl: HTMLDivElement;
    thumbLeft: HTMLDivElement;
    thumbRight: HTMLDivElement;

    scale: Scale;
    showScale: boolean = true;
    rangeValue: any[] = [];

    constructor(options: Obj) {
        super();
        let argsRequire = ["min", "max", "selector"];

        if (!argsRequire.every(key => key in options)) {
            throw new Error(`Not enough values. Should be at least "${argsRequire.join('", "')}" in options`);
        }

        this.setOptions.call(this, options);

        let wrapper = document.querySelector(this.selector);
        [this.el, this.hintEl, this.thumbLeft, this.thumbRight] = new Array(4).fill(1).map(item => document.createElement('div'));
        wrapper.append(this.el);
        this.scale = new Scale({ view: this });


        this.el.classList.add(this.className);
        if (!("step" in options) || this.step === 0) this.step = (this.max - this.min) / 100; //На будущее можно вынести в отдельный объект с дефолтными настройками.

        this.render(true);
    }

    setOptions(options: { [key: string]: any }) {
        let expectant: Obj = {};
        Object.keys(options).filter(prop => prop in this)
            .forEach(prop => expectant[prop] = options[prop])

        //ATTENTION: _validateOptions is dirty function!
        this._validateOptions(expectant) && Object.assign(this, expectant);

        this.scale && this.scale.update("", null);
        return this;
    }

    getOptions() {
        let publicOtions = ["min", "max", "range", "step",
            "className", "selector", "hintAboveThumb", "el", "angle", "showScale", "rangeValue"];
        let obj: Obj = {}
        publicOtions.forEach(key => obj[key] = this[<keyof this>key]);
        return obj;
    }

    update(eventType: string, data: ViewUpdateDataFormat): this {
        this.thumbLeft.style.left =
            data.L.offset * (this.el.clientWidth - this.thumbLeft.offsetWidth) + 'px';

        if (this.range) {
            this.el.append(this.thumbRight);
            this.thumbRight.style.left = data.R.offset * (this.el.clientWidth - this.thumbRight.offsetWidth) + 'px';
        } else {
            this.thumbRight.remove();
        }

        this.el.style.transform = `rotate(${this.angle}deg)`;
        return this;
    }

    render(firstTime?: true): this {
        let { thumbLeft, thumbRight } = this;

        this.hintEl.className = `${this.className}__hint`;
        this.hintEl.textContent = "HINT!";

        thumbLeft.className = `${this.className}__thumb-left`;
        thumbRight.className = `${this.className}__thumb-right`;

        this.el.append(thumbLeft);

        if (this.range) {
            this.el.append(thumbRight);
        } else {
            thumbRight.remove();
        }

        this.el.style.transform = `rotate(${this.angle}deg)`;
        firstTime && this._addEventListeners();

        let scaleWidth = this.el.clientWidth - thumbLeft.offsetWidth;
        this.scale.width = scaleWidth;
        this.scale.renderAnchors();
        return this;
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
        if (!isFinite(max)) throw new Error("max should be a number!");
        if (!isFinite(step)) throw new Error("step should be a number!");
        if (!isFinite(angle)) throw new Error("angle should be a number!");

        if (max < min) throw new Error("max should be greater then min!");
        if (angle < 0 || angle > 90) throw new Error("angle should be >= 0 and <= 90");
        Object.assign(expectant, obj);

        return true;
    }

}

function mouseDownThumbHandler(e: MouseEvent, self: View): void {
    //Не фига создавать новый класс Thumb!!!!
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
    let sinA: number = Math.sin(self.getOptions().angle / 180 * Math.PI);

    let pixelStep: number = self.getOptions().step * (slider.clientWidth - thumb.offsetWidth) / (self.max - self.min);

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
    self.broadcast("changeView", { //при любом событии элементы впредь будут пищать о нем ))
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

        newLeft = takeStepIntoAccount(newLeft, pixelStep);
        newLeft = Math.max(leftLimit, newLeft);
        newLeft = Math.min(newLeft, rightLimit);

        thumb.style.left = newLeft + 'px';

        if (self.range) {
            if (thumb.className.includes("right")) {
                (newLeft < swapClassLimit) && swapThumbClasses();
            } else {
                (newLeft > swapClassLimit) && swapThumbClasses();
            }
        }

        self.broadcast("changeView", {
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

class Scale extends EventObserver {
    width: number = 0;
    view: View | null = null;

    el: HTMLDivElement;
    points: number[] = [0, 1];
    range: number[];

    constructor(options: Obj) {
        super();
        Object.keys(options).forEach(key => {
            if (key in this) this[<keyof this>key] = options[key];
        });

        this.range = [this.view.min, this.view.max];
        this.view.addSubscriber("changeView", this);
    }

    update(eventType: string, data: boolean) {
        if (!this.view.showScale) {
            this.el.style.display = "none";
            return;
        } else {
            this.el.style.display = "";
        }

        this.range = [this.view.min, this.view.max];

        let left = this.el.querySelector("[data-side=L]")
        let right: HTMLDivElement = this.el.querySelector("[data-side=R]");

        if (this.view.rangeValue.length) {
            left.textContent = this.view.rangeValue[0] + '';
            right.textContent = this.view.rangeValue[1] + '';
        } else {
            left.textContent = this.range[0] + '';
            right.textContent = this.range[1] + '';
        }

        right.style.left = this.view.el.clientWidth - right.offsetWidth + "px";
    }

    renderAnchors() {
        let scaleDiv = document.createElement('div');
        scaleDiv.className = this.view.el.className + "__scale"
        this.view.el.append(scaleDiv);
        this.el = scaleDiv;

        for (let i = 0; i < this.points.length; i++) {
            let div = document.createElement('div');

            div.dataset.side = i == 0 ? "L" : "R";
            div.className = this.view.el.className + "__scale-points";
            scaleDiv.append(div);

            div.style.left = this.points[i] * this.width + "px";
            div.textContent = this.range[i] + "";

            div.addEventListener("click", this._onMouseClick.bind(this));
        }
        this.update("", null);
    }

    _onMouseClick(e: MouseEvent) {
        let target: HTMLDivElement = <HTMLDivElement>e.target;
        let closestThumb: HTMLDivElement = this.view.el.querySelector("[class*=left]");

        if (target.dataset.side === "R") {
            let rightThumb: HTMLDivElement | null = this.view.el.querySelector("[class*=right]");
            closestThumb = rightThumb ? rightThumb : closestThumb;
        }

        let data = {
            el: closestThumb,
            offset: target.dataset.side === "L" ? 0 : 1,
        }

        this._moveThumbToOffset(data.el, data.offset);
        this.view.broadcast("changeView", data);
    }

    _moveThumbToOffset(thumb: HTMLDivElement, offset: number): void {
        thumb.style.left = offset * this.width + "px";
    }
}