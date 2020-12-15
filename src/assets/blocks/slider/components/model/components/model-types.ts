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

export type ModelInitType =
{ min: number, max: number} |
{ alternativeRange: string[] };

export function isModelInitType(options: any): options is ModelInitType {
  const basicType = ('min' in options) && ('max' in options);
  const altType = ('alternativeRange' in options);

  return basicType || altType;
}
