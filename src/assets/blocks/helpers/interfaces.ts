export interface ISubscriber {
  update: (data: SliderEvents) => void | this;
}

type ClassNameChange = {
  event: 'className',
  value: string,
}

type SelectorChange = {
  event: 'selector',
  value: string,
}
type AngleChange = {
  event: 'angle',
  value: number,
}

type StepChange = {
  event: 'step',
  value: number,
}

type PartsNumChange = {
  event: 'partsNum',
  value: number,
}

type HintAboveThumbChange = {
  event: 'hintAboveThumb',
  value: boolean,
}

type HintAlwaysShowChange = {
  event: 'hintAlwaysShow',
  value: boolean,
}

type RangeChange = {
  event: 'range',
  value: boolean,
}

type ShowScaleChange = {
  event: 'showScale',
  value: boolean,
}

type ThumbMouseDown = {
  event: 'thumbMouseDown',
  thumb: HTMLDivElement,
  offset: number,
}

type ThumbMouseMove = {
  event: 'thumbMouseMove',
  thumb: HTMLDivElement,
  offset: number,
}

type ThumbMouseUp = {
  event: 'thumbMouseUp',
  thumb: HTMLDivElement,
}

export type ThumbProgramMove = {
  event: 'thumbProgramMove',
  left?: number,
  right?: number,
  thumb?: HTMLElement,
  offset?: number,
}

type RerenderScale = {
  event: 'rerenderScale',
  anchors: HTMLDivElement[],
}

type AnchorClick = {
  event: 'anchorClick',
  offset: number,
}

// Only Model
type ThumbLeftPosChange = {
  event: 'thumbLeftPos',
  value: number,
  method: 'setThumbsPos' | 'setOptions'
}

type ThumbRightPosChange = {
  event: 'thumbRightPos',
  value: number,
  method: 'setThumbsPos' | 'setOptions'
}

type AlternativeRangeChange = {
  event: 'alternativeRange',
  value: string[],
}

type MinChange = {
  event: 'min',
  value: number,
}

type MaxChange = {
  event: 'max',
  value: number,
}

type PrecisionChange = {
  event: 'precision',
  value: number,
}

type OnChangeInitType = {
  event: 'changeSlider',
  cause: string,
}

export type SliderEvents = AngleChange | PartsNumChange | HintAboveThumbChange |
 RangeChange | HintAlwaysShowChange | ThumbMouseDown | ThumbMouseMove |
 ThumbMouseUp | ThumbProgramMove | RerenderScale | AnchorClick | StepChange |
  SelectorChange | ClassNameChange | ShowScaleChange | ThumbLeftPosChange |
  ThumbRightPosChange | AlternativeRangeChange | MinChange | MaxChange |
  PrecisionChange | OnChangeInitType
