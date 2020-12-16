export function isObject(o: any): o is Object {
  return Object.prototype.toString.call(o) === '[object Object]';
}
