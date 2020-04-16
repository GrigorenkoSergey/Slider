class Slider {
    constructor(options = {}) {
        this.min = options.min || 0;
        this.max = options.max || 100;
        this.thumbLeftPos = options.thumbLeftPos || 0;
        this.thumbRightPos = options.thumbRightPos || 0;
        this.step = options.step || 10;
        this.ticks = options.ticks || [this.min, this.max];
        this.angle = options.angle || 0;
        this.bifurcation = options.bifurcation || false;
        this.hintAboveThumb = options.hintAboveThumb || false;
    }

}

Slider.prototype.Model = function() {
this.recieveDataFromController = (data) => {
    Object.assign(this, data);    
}
}
Slider.prototype.Controller = function() {

}

Slider.prototype.View = function() {

}

let slider = new Slider();
console.log(slider);
