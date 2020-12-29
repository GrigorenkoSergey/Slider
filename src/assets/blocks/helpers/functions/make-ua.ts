export function makeUA<U>() {
  // makeUnionArray Не придумал более описательного имени...
  return function<T extends U> (...arg: T[]) {
    return arg;
  };
}

/*
  Using:
  type Union = 'a' | 'b' | 'c' | 'd' | 'e'
  const g = makeUA<Union>()('a', 'b', 'd'); // ('a' | 'b' | 'd')[]
*/
