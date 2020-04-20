import { EventObserver, IModel, ISubscriber } from "./Helpers";

export class Model implements IModel, ISubscriber {
    event = new EventObserver();
    min = 0;
    max = 100;
    thumbLeftPos = 0;
    thumbRightPos = 0;
    step = 10;
    ticks = { [this.max]: this.max };
    _totalItems = this.max;
    angle = 0;
    bifurcation = false;
    hintAboveThumb = false;

    constructor(options: IModel = {}) {
        Object.assign(this, options);
        this._totalItems = Object.values(this.ticks).pop();
    }

    update(eventType: string, data: any) {
        console.log(data);
        let x = this._intempolate(data.offset); 
        x = this._takeStepIntoAccount(x);

        let response = {x, "offset" : data.offset}
        this.event.broadcast("changeModel", response);
    }

    _takeStepIntoAccount(x: number) {
        return Math.floor(x / this.step) * this.step;
    }

    _intempolate(x: number) {
        let ticksRange = Object.keys(this.ticks).map(item => Number(item));
        let ticksValue = Object.values(this.ticks);

        this._validateTicks(ticksRange, ticksValue);
        
        for (let i = 0; i  < ticksRange.length; i++) {
            //немного бизнес-логики (просто интерполяция)
            if (ticksValue[i] / this._totalItems >= x) {
                let a = ticksRange[i - 1] ? ticksValue[i - 1]: 0;
                a /= this._totalItems;
                let b = ticksValue[i];
                b /= this._totalItems;

                let fnA = ticksRange[i - 1] ? ticksRange[i - 1] : this.min;
                let fnB = ticksRange[i];

                return  (x - a) * (fnB - fnA) / (b - a) + fnA;
            }
        }
    }

    _validateTicks(ticksRange: string[] | number[], ticksValue: string[] | number[]) {

        if (+ticksRange[ticksRange.length - 1] != this.max) {
                throw new Error("last key of ticks should be equal to max!");
        } else if (+ticksRange[0] < this.min) {
                throw new Error("First key of ticks should be greater then min!");
        }

        if (!isIncreasing(ticksRange) || !isIncreasing(ticksValue)) {
            throw new Error("Both keys and values of ticks must be increasing sequenses!")
        }

        return true;

        function isIncreasing(arr: number[] | string[]) {
            let prev = +arr[0];
            arr = arr.slice(1);

            for (let i = 0; i < arr.length; i++) {
                if (+arr[i] <= prev) return false;
                prev = +arr[i];
            }
            return true;
        }
    }
}
