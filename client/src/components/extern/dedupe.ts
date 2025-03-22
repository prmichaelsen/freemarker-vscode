export function deepEqual(a: any, b: any) {
  if (a === b) return true;
  
  if (a instanceof Date && b instanceof Date) 
    return a.getTime() === b.getTime();

  if (a instanceof Object && b instanceof Object) {
    for (const key in a) {
      if (!deepEqual(a[key], b[key])) return false;
    }

    for (const key in b) {
      if (!(key in a)) return false;
    }

    return true;
  }

  return false;
}

export function deepDedupe<T>(...arr: T[]): T[] {
  return arr.filter((obj, index) => {
    const duplicates = arr.slice(index + 1).filter(obj2 => deepEqual(obj, obj2));
    return duplicates.length === 0; 
  });
}