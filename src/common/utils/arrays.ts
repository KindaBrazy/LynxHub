export function isStringArray(array: any[]): boolean {
  return array.length === 0 || typeof array[0] === 'string';
}

export function isObjectArray(array: any[]): boolean {
  return array.length === 0 || (typeof array[0] === 'object' && array[0] !== null && !Array.isArray(array[0]));
}
