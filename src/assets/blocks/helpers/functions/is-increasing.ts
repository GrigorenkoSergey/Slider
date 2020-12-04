function isIncreasing(arr: number[] | string[]): boolean {
  let prev = Number(arr[0]);
  let arrSliced = arr.slice(1);
  let result = true;

  arrSliced.forEach((item: number | string) => {
    let isGreater = Number(item) > prev;
    prev = Number(item);

    if (!isGreater) result = false;
  });

  return result;
}

export default isIncreasing;