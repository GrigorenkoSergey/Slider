export function isStringArray(obj: unknown): obj is string[] {
  let result = false;
  if (Array.isArray(obj)) {
    result = obj.every((value) => typeof value === 'string');
  }
  return result;
}
