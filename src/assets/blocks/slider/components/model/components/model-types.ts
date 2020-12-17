export type ModelOptions = {
  min?: number,
  max?: number,
  step?: number,
  partsNum?: number,
  thumbLeftPos?: number,
  thumbRightPos?: number,
  range?: boolean,
  precision?: number,
  alternativeRange?: string[],
}

const modelOptionsDummy: Required<ModelOptions> = {
  min: 0,
  max: 0,
  step: 0,
  partsNum: 0,
  thumbLeftPos: 0,
  thumbRightPos: 0,
  range: true,
  precision: 0,
  alternativeRange: [],
};

export type ModelInitType =
{ min: number, max: number} |
{ alternativeRange: string[] };

export function isModelInitType(options: Object): options is ModelInitType {
  const basicType = ('min' in options) && ('max' in options);
  const altType = ('alternativeRange' in options);

  return basicType || altType;
}

export function isModelOptionsType(options: Object): options is ModelOptions {
  const modelOptionsExample: Required<ModelOptions> = {
    min: 0,
    max: 0,
    step: 0,
    partsNum: 0,
    thumbLeftPos: 0,
    thumbRightPos: 0,
    range: true,
    precision: 0,
    alternativeRange: [],
  };

  return Object.keys(options).some((key) => key in modelOptionsExample);
}

export function isModelOptionsKey(key: string): key is Extract<keyof ModelOptions, string> {
  return key in modelOptionsDummy;
}
