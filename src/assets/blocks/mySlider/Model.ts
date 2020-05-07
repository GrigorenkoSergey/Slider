import { EventObserver, IModel, ISubscriber, debuggerPoint } from "./Helpers";

type Obj = { [key: string]: any };
type modelResponse = { L: { x: number, offset: number }, R: { x: number, offset: number } }

export class Model implements IModel, ISubscriber {
    observer = new EventObserver();
    min = 0;
    max = 100;
    step = 1;
    thumbLeftPos = this.min;
    thumbRightPos = this.max;
    ticks = { [this.max]: this.max };
    angle = 0;
    range = false;

    private _totalItems: number;
    private _offsetLeft: number = 0;
    private _offsetRight: number = 1;
    private _ticksRange: number[];
    private _ticksValues: number[];

    constructor(options: Obj) {
        let argsRequire = ["min", "max"];

        if (!argsRequire.every(key => key in options)) {
            throw new Error(`Not enough values. Should be at least "${argsRequire.join('", "')}" in options`);
        }

        let defaultOptions: Obj = {
            step: () => (options.max - options.min) / 100,
            thumbLeftPos: () => options.min,
            thumbRightPos: () => options.max,
            ticks: () => { return { [options.max]: options.max } },
            angle: () => 0,
            range: () => false,
        };

        Object.keys(defaultOptions).forEach(key => {
            if (!(key in options)) options[key] = defaultOptions[key]();
        });

        this.setOptions(options);
    }

    update(eventType: string, data: { el: "L" | "R", offset: number }): void {
        let x = this._intempolate(data.offset);
        x = this._takeStepIntoAccount(x);
        x = Math.min(this.max, Math.max(this.min, x)); //Иногда так округляется, что выходим за пределы

        if (data.el[0] == 'R') {
            this.thumbRightPos = x;
            this._offsetRight = data.offset;
        } else {
            this.thumbLeftPos = x;
            this._offsetLeft = data.offset;
        }
    }

    getThumbsOffset(): modelResponse {
        return {
            "L": { x: this.thumbLeftPos, "offset": this._offsetLeft },
            "R": { x: this.thumbRightPos, "offset": this._offsetRight },
        }
    }

    setOptions(expectant: Obj): Model {
        let shouldBeNumbers: string[] = ["min", "max", "step", "thumbLeftPos",
            "thumbRightPos", "angle"];

        //Проигнорируем лишние свойства
        let commonKeys = Object.keys(expectant).filter((key: string) => key in this);
        let trimedObj: Obj = {};
        commonKeys.forEach(key => trimedObj[key] = expectant[key]);
        expectant = trimedObj;

        //Преобразуем необходимые значения в тип Number или выкинем ошибку при неудаче
        shouldBeNumbers.forEach(key => {
            if (key in expectant) {
                expectant[key] = Number(expectant[key])
                if (!isFinite(expectant[key])) {
                    throw new Error(key[0].toUpperCase().slice(1) + " should be a number!");
                }
            }
        });

        let obj = Object.assign({}, this);
        Object.assign(obj, expectant);

        // if (debuggerPoint.start == 5) debugger; //Для будущей отладки
        if (Object.keys(obj.ticks).length < 2) obj.ticks = { [obj.max]: obj.max };

        let { min, max, step, thumbLeftPos, thumbRightPos, angle, ticks } = obj;

        if (max < min) throw new Error("Max should be greater then min!");
        if (angle < 0 || angle > 90) throw new Error("Angle should be >= 0 and <= 90");
        if (step > (max - min)) throw new Error("To large step!");
        if (step === 0) obj.step = step = (max - min) / 100;

        if (!obj.range) {
            thumbRightPos = max;
        } else {
            thumbRightPos = Math.min(max, thumbRightPos);
        }
        thumbLeftPos = Math.max(min, thumbLeftPos);
        (thumbLeftPos == thumbRightPos) && (thumbRightPos = max); //Иногда бегунки сливаются. Нехорошо
        Object.assign(obj, { thumbLeftPos, thumbRightPos });

        obj._totalItems = Object.values(ticks).pop();
        obj._ticksRange = Object.keys(ticks).map(item => Number(item));;
        obj._ticksValues = Object.values(ticks);
        this._validateTicks.call(obj);

        obj._offsetLeft = this._findOffset.call(obj, thumbLeftPos);
        obj._offsetRight = this._findOffset.call(obj, thumbRightPos);

        Object.assign(this, obj);
        this.observer.broadcast("changeModel", this.getThumbsOffset());

        return this;
    }

    setThumbsPos(thumbLeftPos: number, thumbRightPos?: number): Model {
        if (thumbRightPos !== undefined && thumbLeftPos > thumbRightPos) {
            [thumbLeftPos, thumbRightPos] = [thumbRightPos, thumbLeftPos];
        }

        thumbLeftPos = this._takeStepIntoAccount(thumbLeftPos);
        if (thumbLeftPos < this.min) thumbLeftPos = this.min;
        this.thumbLeftPos = thumbLeftPos;

        this._offsetLeft = this._findOffset(thumbLeftPos);

        if (thumbRightPos !== undefined && this.range) {
            thumbRightPos = this._takeStepIntoAccount(thumbRightPos);
            if (thumbRightPos > this.max) thumbRightPos = this.max;
            this.thumbRightPos = thumbRightPos;

            this._offsetRight = this._findOffset(thumbRightPos);
        }

        this.observer.broadcast("changeModel", this.getThumbsOffset());
        return this;
    }

    private _takeStepIntoAccount(x: number): number {
        return Math.round(x / this.step) * this.step;
    }

    private _intempolate(offset: number): number {
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

    private _findOffset(x: number): number {
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

    private _validateTicks(): never | boolean {
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
    };
}

export function isIncreasing(arr: number[] | string[]): boolean {
    let prev = +arr[0];
    arr = arr.slice(1);

    for (let i = 0; i < arr.length; i++) {
        if (+arr[i] <= prev) return false;
        prev = +arr[i];
    }

    return true;
}