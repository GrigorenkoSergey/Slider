import '../../slider.scss';

import { Obj, onChangeOpts } from '../../../helpers/types';
import EventObserver from '../../../helpers/event-observer';
import { ISubscriber } from '../../../helpers/interfaces';
import View from '../view/view';
import Model from '../model/model';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import debuggerPoint from '../../../helpers/debugger-point';

export class Presenter extends EventObserver implements ISubscriber {
 public view!: View;

 public model!: Model;

 constructor(options: Obj) {
   super();
   this.init(options);
 }

 private init(options: Obj) {
   const optionsCopy = { ...options };
   this.model = new Model(options);
   const { model } = this;

   const { step, max, min } = model.getOptions();
   optionsCopy.step = step / (max - min);
   this.view = new View(optionsCopy);
   const { view } = this;

   view.addSubscriber('angle', this);
   view.addSubscriber('thumbMousedown', this);
   view.addSubscriber('thumbMousemove', this);
   view.addSubscriber('thumbMouseup', this);
   view.addSubscriber('thumbProgramMove', this);
   view.addSubscriber('showScale', this);
   view.addSubscriber('hintAlwaysShow', this);
   view.addSubscriber('hintAboveThumb', this);

   view.scale.addSubscriber('rerenderScale', this);
   this.addSubscriber('rerenderScale', this.view);

   model.addSubscriber('partsNum', this);
   // model.addSubscriber('alternativeRange', this);
   // не требуется, т.к. автоматически меняются min, max
   model.addSubscriber('min', this);
   model.addSubscriber('max', this);
   model.addSubscriber('step', this);
   model.addSubscriber('thumbLeftPos', this);
   model.addSubscriber('thumbRightPos', this);
   model.addSubscriber('range', this);
   model.addSubscriber('precision', this);

   this.setOptions(options);
 }

 public setOptions(options: Obj) {
   const { model, view } = this;
   model.setOptions(options);

   const optionsCopy = { ...options };

   const updateStepOptions = ['min', 'max', 'step'];
   const shouldUpdateStep = updateStepOptions.some((option) => option in optionsCopy);

   if (shouldUpdateStep) {
     const { step, max, min } = model.getOptions();
     const viewStep = step / (max - min);
     optionsCopy.step = viewStep;
   }

   view.setOptions(optionsCopy);
   return this;
 }

 public getOptions() {
   const { model, view } = this;
   const res = { ...view.getOptions(), ...model.getOptions() };
   return res;
 }

 public getOffsets() {
   return {
     left: this.view.thumbs.thumbLeftOffset,
     right: this.view.thumbs.thumbRightOffset,
   };
 }

 public update(eventType: string, data: any) {
   const modelOptions = this.model.getOptions();

   if (eventType === 'thumbMousedown') {
     const thumb = data.el;
     const offset = this.model.findValue(data.offset);
     this.view.setHintValue(thumb, this.recountValue(offset));
   } else if (eventType === 'thumbMousemove') {
     const thumb = data.el;
     const offset = this.model.findValue(data.offset);
     this.view.setHintValue(thumb, this.recountValue(offset));

     if (thumb === this.view.thumbs.thumbLeft) {
       this.model.setThumbsPos({ left: offset });
     } else {
       this.model.setThumbsPos({ right: offset });
     }
   } else if (eventType === 'min' || eventType === 'max') {
     const { thumbLeft } = this.view.thumbs;
     this.view.moveThumbToPos(
       thumbLeft,
       this.model.findArgument(modelOptions.thumbLeftPos),
     );

     if (this.model.getOptions().range) {
       const { thumbRight } = this.view.thumbs;
       this.view.moveThumbToPos(thumbRight, this.model.findArgument(modelOptions.thumbRightPos));
     }
     this.scaleValues();
   } else if (eventType === 'step') {
     const step = modelOptions.step / (modelOptions.max - modelOptions.min);
     this.view.setOptions({ step });
   } else if (eventType === 'partsNum') {
     this.view.setOptions({ partsNum: modelOptions.partsNum });
   } else if (eventType === 'thumbLeftPos') {
     if (data.method === 'setThumbsPos') {
       this.broadcast(eventType, data);
       return;
     }

     const { thumbLeft } = this.view.thumbs;
     this.view.moveThumbToPos(thumbLeft, this.model.findArgument(data.value));
   } else if (eventType === 'thumbRightPos') {
     if (data.method === 'setThumbsPos') {
       this.broadcast(eventType, data);
       return;
     }

     const { thumbRight } = this.view.thumbs;
     if (modelOptions.thumbRightPos === Infinity) return;
     this.view.moveThumbToPos(thumbRight, this.model.findArgument(data.value));
   } else if (eventType === 'range') {
     this.view.setOptions({ range: data.value });
   } else if (eventType === 'thumbProgramMove') {
     let handledData = null;

     if ('left' in data) {
       handledData = { left: this.model.findValue(data.left) };
     } else {
       handledData = { right: this.model.findValue(data.right) };
     }

     this.model.setThumbsPos(handledData);
     this.scaleValues();
   } else {
     this.scaleValues();
   }

   this.broadcast(eventType, data);
   this.broadcast('changeSlider', eventType);
 }

 public onChange(opts: onChangeOpts) {
   const {
     el,
     callback = (eventType: string, data: any) => console.log(data),
   } = opts;

   const elemSubscriber = {
     update: callback,
     el,
   };

   this.addSubscriber('changeSlider', elemSubscriber);
   this.broadcast('changeSlider', 'onChangeInit');
   return elemSubscriber;
 }

 private scaleValues() {
   const { view, model } = this;
   const modelOptions = model.getOptions();

   view.setHintValue(
     view.thumbs.thumbLeft,
     this.recountValue(modelOptions.thumbLeftPos),
   );

   view.setHintValue(
     view.thumbs.thumbRight,
     this.recountValue(modelOptions.thumbRightPos),
   );

   const { precision } = modelOptions;
   const anchorValues = this.view.scale.parts.map((value) => {
     const result = this.recountValue(Number(model.findValue(value).toFixed(precision)));
     return result;
   });

   view.setAnchorValues(anchorValues);
 }

 private recountValue(val: number) {
   const { model } = this;
   let result;

   const { alternativeRange } = model.getOptions();
   if (alternativeRange.length) {
     result = alternativeRange[Math.round(val)];
   } else {
     result = String(val);
   }
   return result;
 }
}
