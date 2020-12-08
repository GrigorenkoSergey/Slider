export type Obj = {[key: string]: any};

export type onChangeOpts = {
  el: any,
  callback?: <T>(eventType: string, data: T) => any,
};
