export type ViewOptions = {
  className?: string,
  selector?: string,
  angle?: number,
  step?: number,
  range?: boolean,
  hintAboveThumb?: boolean,
  hintAlwaysShow?: boolean,
  showScale?: boolean,
  partsNum?: number,
}

export type ViewInitType = {
  selector: string;
}

export function isViewInitType(options: any): options is ViewInitType {
  if (!('selector' in options)) return false;

  return typeof options.selector === 'string';
}
