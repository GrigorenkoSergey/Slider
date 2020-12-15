export function setOption<O, K extends keyof O>(o: O, key: K, val: O[K]) {
  const copy = { ...o };
  copy[key] = val;
  return copy;
}
