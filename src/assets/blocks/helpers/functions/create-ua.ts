export function createUA<T extends string>(arr: T[]): T[] {
  // createUnionArray Не придумал более описательного имени...
  type arrType = typeof arr[number];
  const a: arrType[] = arr.slice();
  return a;
}
