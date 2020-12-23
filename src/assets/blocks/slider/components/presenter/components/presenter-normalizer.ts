import { ModelOptions } from '../../model/components/model-types';
import { ViewOptions } from '../../view/components/view-types';
import { PresenterOptions } from './presenter-types';

type NumberProps = 'max' | 'min' | 'step' | 'partsNum' | 'thumbLeftPos' |
  'thumbRightPos' | 'precision' | 'angle';

type BooleanProps = 'range' | 'hintAlwaysShow' | 'hintAboveThumb' | 'showScale';
type StringProps = 'className' | 'selector';
type StringArrayProps = 'alternativeRange';

export class PresenterNormalizer {
  normalizeModelOptions(opts: ModelOptions): ModelOptions {
    const result: ModelOptions = {};

    if (opts.max !== undefined) {
      result.max = this.handleNumberTypeProp('max', opts);
    }
    if (opts.min !== undefined) {
      result.min = this.handleNumberTypeProp('min', opts);
    }
    if (opts.step !== undefined) {
      result.step = this.handleNumberTypeProp('step', opts);
    }
    if (opts.partsNum !== undefined) {
      result.partsNum = this.handleNumberTypeProp('partsNum', opts);
    }
    if (opts.thumbLeftPos !== undefined) {
      result.thumbLeftPos = this.handleNumberTypeProp('thumbLeftPos', opts);
    }
    if (opts.thumbRightPos !== undefined) {
      result.thumbRightPos = this.handleNumberTypeProp('thumbRightPos', opts);
    }
    if (opts.precision !== undefined) {
      result.precision = this.handleNumberTypeProp('precision', opts);
    }
    if (opts.range !== undefined) {
      result.range = this.handleBooleanTypeProp('range', opts);
    }
    if (opts.alternativeRange !== undefined) {
      result.alternativeRange = this.handleStringArrayTypeProp('alternativeRange', opts);
    }

    return result;
  }

  normalizeViewOptions(opts: ViewOptions): ViewOptions {
    const result: ViewOptions = {};

    if (opts.className !== undefined) {
      result.className = this.handleStringTypeProp('className', opts);
    }
    if (opts.selector !== undefined) {
      result.selector = this.handleStringTypeProp('selector', opts);
    }
    if (opts.step !== undefined) {
      result.step = this.handleNumberTypeProp('step', opts);
    }
    if (opts.partsNum !== undefined) {
      result.partsNum = this.handleNumberTypeProp('partsNum', opts);
    }
    if (opts.angle !== undefined) {
      result.angle = this.handleNumberTypeProp('angle', opts);
    }
    if (opts.hintAboveThumb !== undefined) {
      result.hintAboveThumb = this.handleBooleanTypeProp('hintAboveThumb', opts);
    }
    if (opts.hintAlwaysShow !== undefined) {
      result.hintAlwaysShow = this.handleBooleanTypeProp('hintAlwaysShow', opts);
    }
    if (opts.showScale !== undefined) {
      result.showScale = this.handleBooleanTypeProp('showScale', opts);
    }
    if (opts.range !== undefined) {
      result.range = this.handleBooleanTypeProp('range', opts);
    }

    return result;
  }

  private handleNumberTypeProp(prop: NumberProps, obj: PresenterOptions): number {
    let value = obj[prop];
    value = Number(value);

    if (!Number.isFinite(value)) {
      throw new Error(`"${prop}" should be a number!`);
    }
    return value;
  }

  private handleStringTypeProp(prop: StringProps, obj: PresenterOptions): string {
    const value = obj[prop];
    if (typeof value !== 'string') {
      throw new Error(`"${prop}" should be a string!`);
    }
    return value;
  }

  private handleBooleanTypeProp(prop: BooleanProps, obj: PresenterOptions): boolean {
    const value = obj[prop];
    if (typeof value !== 'boolean') {
      throw new Error(`"${prop}" should be a boolean!`);
    }
    return value;
  }

  private handleStringArrayTypeProp(prop: StringArrayProps, obj: PresenterOptions): string[] {
    const value = obj[prop];

    if (!(Array.isArray(value))) {
      throw new Error(`Prop "${prop}" is not an array`);
    } else if (value.some((item) => typeof item !== 'string')) {
      throw new Error(`Prop "${prop}" is not a string array`);
    } else if (value === undefined) {
      throw new Error(`Prop "${prop} should not be undefined`);
    }
    return value;
  }
}
