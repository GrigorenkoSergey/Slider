/* eslint-disable @typescript-eslint/no-unused-vars */
export function isKey<O>(str: string): str is Extract<keyof O, string> {
  return true;
}
