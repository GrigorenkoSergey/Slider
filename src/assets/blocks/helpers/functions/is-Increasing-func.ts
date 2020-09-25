function isIncreasing(arr: number[] | string[]): boolean {
  let prev = +arr[0];
  arr = arr.slice(1);

  for (let i = 0; i < arr.length; i++) {
    if (+arr[i] <= prev) return false;
    prev = +arr[i];
  }

  return true;
}

export default isIncreasing;