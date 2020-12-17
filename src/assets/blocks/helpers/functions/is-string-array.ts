export function isStringArray(obj: any): obj is string[] {
  let result = false;
  if (Array.isArray(obj)) {
    result = obj.every((value) => typeof value === 'string');
  }
  return result;
}
