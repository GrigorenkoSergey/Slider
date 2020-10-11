type Obj = {[key: string]: any};

type modelResponse = {
  L: {x: number, offset: number},
  R: {x: number, offset: number}
}

type ViewUpdateDataFormat = {
  'L': {x: number, offset: number},
  'R': {x: number, offset: number}
};

type response = {
  L: {x: number, offset: number},
  R: {x: number, offset: number}
}

type fnResType = (elem: HTMLElement, leftX: number, scaledLeftX: number,
  rightX: number, scaledRightX: number, data: any) => void;
