import { PresenterOptions } from './presenter-types';
import { isModelOptionsKey, ModelOptions } from '../../model/components/model-types';
import { isViewOptionsKey, ViewOptions } from '../../view/components/view-types';
import { isObjKey } from '../../../../helpers/functions/is-obj-key';
import { setOption } from '../../../../helpers/functions/set-option';
import { isStringArray } from '../../../../helpers/functions/is-string-array';

export class PresenterNormalizer {
  normalizeModelOptions(opts: ModelOptions): ModelOptions {
    let result: ModelOptions = {};

    Object.keys(opts).forEach((key) => {
      if (!(isModelOptionsKey(key))) return;
      if (key === 'alternativeRange') {
        result.alternativeRange = this.handleStringArrayTypeProp('alternativeRange', opts);
      } else if (key === 'range') {
        result.range = this.handleBooleanTypeProp('range', opts);
      } else {
        const value = this.handleNumberTypeProp(key, opts);
        result = setOption(result, key, value);
      }
    });

    return result;
  }

  normalizeViewOptions(opts: ViewOptions): ViewOptions {
    let result: ViewOptions = {};

    Object.keys(opts).forEach((key) => {
      if (!isViewOptionsKey(key)) return;

      let val;
      switch (key) {
        case 'className':
        case 'selector':
          val = this.handleStringTypeProp(key, opts);
          break;
        case 'step':
        case 'partsNum':
        case 'angle':
          val = this.handleNumberTypeProp(key, opts);
          break;
        default:
          val = this.handleBooleanTypeProp(key, opts);
          break;
      }
      result = setOption(result, key, val);
    });
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
    if (!(isStringArray(value))) {
      throw new Error(`"${prop}" should be a string[]!`);
    }
    return value;
  }
}
