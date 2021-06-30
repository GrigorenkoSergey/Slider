export function isIncreasingSequence(arr: number[] | string[]): boolean {
  let prev = Number(arr[0]);
  const arrSliced = arr.slice(1);
  let result = true;

  arrSliced.forEach((item: number | string) => {
    const isGreater = Number(item) > prev;
    prev = Number(item);

    if (!isGreater) result = false;
  });

  return result;
}
