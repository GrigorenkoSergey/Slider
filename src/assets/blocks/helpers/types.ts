type Obj = {[key: string]: any};

type onChangeOpts = {
  el: any,
  callback?: (eventType: string, data: any) => any,
};

export {Obj, onChangeOpts};
