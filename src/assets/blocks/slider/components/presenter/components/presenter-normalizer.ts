import { PresenterOptions } from './presenter-types';
import { ModelOptions } from '../../model/components/model-types';
import { ViewOptions } from '../../view/components/view-types';
import { isObjKey } from '../../../../helpers/functions/is-obj-key';

export class PresenterNormalizer {
  normalizeModelOptions(opts: PresenterOptions): ModelOptions {
    const result: ModelOptions = {};

    if ('min' in opts) {
      result.min = this.handleNumberTypeProp('min', opts);
    }
    if ('max' in opts) {
      result.max = this.handleNumberTypeProp('max', opts);
    }
    if ('step' in opts) {
      result.step = this.handleNumberTypeProp('step', opts);
    }
    if ('partsNum' in opts) {
      result.partsNum = this.handleNumberTypeProp('partsNum', opts);
    }
    if ('thumbLeftPos' in opts) {
      result.thumbLeftPos = this.handleNumberTypeProp('thumbLeftPos', opts);
    }
    if ('thumbRightPos' in opts) {
      result.thumbRightPos = this.handleNumberTypeProp('thumbRightPos', opts);
    }
    if ('range' in opts) {
      result.range = this.handleBooleanTypeProp('range', opts);
    }
    if ('precision' in opts) {
      result.precision = this.handleNumberTypeProp('precision', opts);
    }
    if ('alternativeRange' in opts) {
      result.alternativeRange = this.handleStringArrayTypeProp('alternativeRange', opts);
    }

    return result;
  }

  normalizeViewOptions(opts: PresenterOptions): ViewOptions {
    const result: ViewOptions = {};

    if ('className' in opts) {
      result.className = this.handleStringTypeProp('className', opts);
    }
    if ('selector' in opts) {
      result.selector = this.handleStringTypeProp('selector', opts);
    }
    if ('angle' in opts) {
      result.angle = this.handleNumberTypeProp('angle', opts);
    }
    if ('step' in opts) {
      result.step = this.handleNumberTypeProp('step', opts);
    }
    if ('range' in opts) {
      result.range = this.handleBooleanTypeProp('range', opts);
    }
    if ('hintAboveThumb' in opts) {
      result.hintAboveThumb = this.handleBooleanTypeProp('hintAboveThumb', opts);
    }
    if ('hintAlwaysShow' in opts) {
      result.hintAlwaysShow = this.handleBooleanTypeProp('hintAlwaysShow', opts);
    }
    if ('showScale' in opts) {
      result.showScale = this.handleBooleanTypeProp('showScale', opts);
    }
    if ('partsNum' in opts) {
      result.partsNum = this.handleNumberTypeProp('partsNum', opts);
    }
    return result;
  }

  private handleNumberTypeProp(prop: string, obj: PresenterOptions): number {
    if (!isObjKey(obj, prop)) {
      throw new Error();
    }

    let value = obj[prop];
    value = Number(value);

    if (!Number.isFinite(value)) {
      throw new Error(`"${prop}" should be a number!`);
    }
    return value;
  }

  private handleStringTypeProp(prop: string, obj: PresenterOptions): string {
    if (!isObjKey(obj, prop)) {
      throw new Error();
    }
    const value = obj[prop];
    if (typeof value !== 'string') {
      throw new Error(`"${prop}" should be a string!`);
    }
    return value;
  }

  private handleBooleanTypeProp(prop: string, obj: PresenterOptions): boolean {
    if (!isObjKey(obj, prop)) {
      throw new Error();
    }
    const value = obj[prop];
    if (typeof value !== 'boolean') {
      throw new Error(`"${prop}" should be a boolean!`);
    }
    return value;
  }

  private handleStringArrayTypeProp(prop: string, obj: PresenterOptions): string[] {
    if (!isObjKey(obj, prop)) {
      throw new Error();
    }
    const value = obj[prop];
    if (!(Array.isArray(value))) {
      throw new Error(`"${prop}" should be a string[]!`);
    }

    const stringArray = value.every((item: any) => typeof item === 'string');
    if (!stringArray) {
      throw new Error('alternativeRange should be a string[]!');
    }
    return value;
  }
}
