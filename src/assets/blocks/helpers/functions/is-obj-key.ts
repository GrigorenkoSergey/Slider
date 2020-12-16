/* eslint-disable @typescript-eslint/no-unused-vars */
export function isObjKey<O>(obj: O, key: string): key is Extract<keyof O, string> {
  return key in obj;
}
