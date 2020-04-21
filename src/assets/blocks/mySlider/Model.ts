import { EventObserver, IModel, ISubscriber } from "./Helpers";

export class Model implements IModel, ISubscriber {
    event = new EventObserver();
    min = 0;
    max = 100;
    thumbLeftPos = 0;
    thumbRightPos = 0;
    step = 10;
    ticks = { [this.max]: this.max };
    angle = 0;
    range = false;
    hintAboveThumb = false;

    _totalItems = this.max;
    _offsetLeft: number = 0;
    _offsetRight: number = 1;
    _ticksRange: number[];
    _ticksValues: number[];

    constructor(options: IModel = {}) {
        Object.assign(this, options);
        this.ticks = options.ticks ? options.ticks : { [this.max]: this.max };

        this._totalItems = Object.values(this.ticks).pop();
        this._ticksRange = Object.keys(this.ticks).map(item => Number(item));
        this._ticksValues = Object.values(this.ticks);
        this._offsetLeft = this._findOffset(this.thumbLeftPos);
        this._offsetRight = options.thumbRightPos ? this._findOffset(this.thumbRightPos) : 1;
    }

    update(eventType: string, data: any) {
        let x = this._intempolate(data.offset);
        x = this._takeStepIntoAccount(x);

        if (data.el[0] == 'R') {
            this.thumbRightPos = x;
            this._offsetRight = data.offset;
        } else {
            this.thumbLeftPos = x;
            this._offsetLeft = data.offset;
        }

        this.event.broadcast("changeModel", this._response());
    }

    getThumbsOffset() {
        return this.event.broadcast("changeModel", this._response());
    }

    _takeStepIntoAccount(x: number) {
        return Math.floor(x / this.step) * this.step;
    }

    _response() {
        return {
            "L": { x: this.thumbLeftPos, "offset": this._offsetLeft },
            "R": { x: this.thumbRightPos, "offset": this._offsetRight },
        }
    }

    _intempolate(offset: number): number {
        let ticksRange = this._ticksRange;
        let ticksValue = this._ticksValues;

        for (let i = 0; i < ticksRange.length; i++) {
            //немного бизнес-логики (просто интерполяция)
            if (ticksValue[i] / this._totalItems >= offset) {
                let a = ticksRange[i - 1] ? ticksValue[i - 1] : 0;
                a /= this._totalItems;
                let b = ticksValue[i];
                b /= this._totalItems;

                let fnA = ticksRange[i - 1] ? ticksRange[i - 1] : this.min;
                let fnB = ticksRange[i];

                return (offset - a) * (fnB - fnA) / (b - a) + fnA;
            }
        }
    }

    _findOffset(x: number): number {
        let ticksRange = this._ticksRange;
        let ticksValue = this._ticksValues;

        this.range && this._validateTicks(ticksRange, ticksValue);

        for (let i = 0; i < ticksRange.length; i++) {
            if (ticksRange[i] >= x) {
                let a = ticksRange[i - 1] ? this._ticksValues[i - 1] : 0;
                a /= this._totalItems;
                let b = ticksValue[i];
                b /= this._totalItems;

                let fnA = ticksRange[i - 1] ? ticksRange[i - 1] : this.min;
                let fnB = ticksRange[i];

                return (x - fnA) * (b - a) / (fnB - fnA) + a;
            }
        }
    }

    _validateTicks(ticksRange: string[] | number[], ticksValue: string[] | number[]) {

        if (+ticksRange[ticksRange.length - 1] != this.max) {
            throw new Error("last key of ticks should be equal to max!");
        } else if (+ticksRange[0] < this.min) {
            throw new Error("First key of ticks should be greater then min!");
        } else if (!isIncreasing(ticksRange) || !isIncreasing(ticksValue)) {
            throw new Error("Both keys and values of ticks must be increasing sequenses!")
        }

        return true;
    }
}

function isIncreasing(arr: number[] | string[]) {
    let prev = +arr[0];
    arr = arr.slice(1);

    for (let i = 0; i < arr.length; i++) {
        if (+arr[i] <= prev) return false;
        prev = +arr[i];
    }
    return true;
}
