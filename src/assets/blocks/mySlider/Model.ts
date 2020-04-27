import { EventObserver, IModel, ISubscriber, debuggerPoint } from "./Helpers";

export class Model implements IModel, ISubscriber {
    event = new EventObserver();
    min = 0;
    max = 100;
    thumbLeftPos = this.min;
    thumbRightPos = this.max;
    step = 10;
    ticks = { [this.max]: this.max };
    angle = 0;
    range = false;

    _totalItems = this.max;
    _offsetLeft: number = 0;
    _offsetRight: number = 1;
    _ticksRange: number[];
    _ticksValues: number[];

    constructor(options: IModel = {}) {
        this.setOptions(options);
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
    }

    getThumbsOffset() {
        return {
            "L": { x: this.thumbLeftPos, "offset": this._offsetLeft },
            "R": { x: this.thumbRightPos, "offset": this._offsetRight },
        }
    }

    setOptions(expactant) {
        // if (debuggerPoint.start == 3) debugger; //Для будущей отладки

        let shouldBeNumbers = ["min", "max", "step", "thumbLeftPos",
            "thumbRightPos", "angle"];

        shouldBeNumbers.forEach(key => {
            if (key in expactant) {
                expactant[key] = Number(expactant[key])
                if (!isFinite(expactant[key])) {
                    throw new Error(key[0].toUpperCase().slice(1) + " should be a number!");
                }
            }
        });

        let obj = Object.assign({}, this);
        Object.assign(obj, expactant);

        let { min, max, step, thumbLeftPos, thumbRightPos, angle, ticks } = obj;

        if (max < min) throw new Error("Max should be greater then min!");
        if (angle < 0 || angle > 90) throw new Error("Angle should be >= 0 and <= 90");
        if (step > (max - min)) throw new Error("To large step!");

        if ((max - min) % step) max = min + Math.floor((max - min) / step) * step;
        obj.max = max;

        if (thumbLeftPos > thumbRightPos) { //Числа вычисляются обычно по умолчанию, поэтому не стоит выкидывать ошибку
            [thumbLeftPos, thumbRightPos] = [thumbRightPos, thumbLeftPos];
        }
        thumbLeftPos = Math.max(min, thumbLeftPos);
        thumbRightPos = Math.min(max, thumbRightPos);
        (thumbLeftPos == thumbRightPos) && (thumbRightPos = max); //Иногда бегунки сливаются. Нехорошо
        Object.assign(obj, { thumbLeftPos, thumbRightPos });

        //а сейчас самое запутанное и неочевидное. Если положиться на ticks по умолчанию ({100: 100})
        //можно словить большие проблемы, поэтому его назначаем вручную.

        ticks = expactant.ticks ? expactant.ticks : { [obj.max]: obj.max };
        obj._totalItems = Object.values(ticks).pop();
        obj._ticksRange = Object.keys(ticks).map(item => Number(item));;
        obj._ticksValues = Object.values(ticks);
        this._validateTicks.call(obj);

        obj._offsetLeft = this._findOffset.call(obj, thumbLeftPos);
        obj._offsetRight = this._findOffset.call(obj, thumbRightPos);

        Object.assign(this, obj);
        this.event.broadcast("changeModel", this.getThumbsOffset());
    }

    setThumbsPos(thumbLeftPos: number, thumbRightPos: number) {
        if (thumbRightPos !== undefined && thumbLeftPos > thumbRightPos) {
            [thumbLeftPos, thumbRightPos] = [thumbRightPos, thumbLeftPos];
        }

        if (thumbLeftPos < this.min) return;
        this.thumbLeftPos = thumbLeftPos;
        this._offsetLeft = this._takeStepIntoAccount(this._offsetLeft);
        this._offsetLeft = this._findOffset(thumbLeftPos);

        if (thumbRightPos !== undefined && this.range) {
            if (thumbRightPos > this.max) return;
            this.thumbRightPos = thumbRightPos;
            this._offsetRight = this._takeStepIntoAccount(this._offsetRight);
            this._offsetRight = this._findOffset(thumbRightPos);
        }

        this.event.broadcast("changeModel", this.getThumbsOffset());
    }

    _takeStepIntoAccount(x: number) {
        return Math.round(x / this.step) * this.step;
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

    _validateTicks() {
        let ticksRange = this._ticksRange;
        let ticksValue = this._ticksValues;

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