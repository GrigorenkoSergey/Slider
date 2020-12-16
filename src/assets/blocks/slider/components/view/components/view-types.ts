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

export function isViewOptionsType(options: Object): options is ViewOptions {
  const example: ViewOptions = {
    className: '',
    selector: '',
    angle: 0,
    step: 0,
    range: true,
    hintAboveThumb: true,
    hintAlwaysShow: true,
    showScale: true,
    partsNum: 0,
  };

  return Object.keys(options).some((key) => key in example);
}
