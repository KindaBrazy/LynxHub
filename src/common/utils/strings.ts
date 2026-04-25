/**
 * Removes all but the last occurrence of `targetString` from the end of `sourceString`.
 * If the `sourceString` ends with multiple instances of `targetString`, only one will be kept.
 * If it ends with one or none, the original string is returned.
 *
 * @param source - The original string to be processed.
 * @param target - The string to check and remove from the end of the source.
 * @returns A new string with extra trailing `target` instances removed, or the original if no changes.
 */
export function removeExtraEndings(source: string, target: string): string {
  if (target.length === 0) {
    return source; // Avoid infinite loop if target is empty
  }

  let count = 0;
  let currentSource = source;
  const targetLength = target.length;

  // Remove trailing occurrences of targetString
  while (currentSource.endsWith(target)) {
    count++;
    currentSource = currentSource.slice(0, -targetLength);
  }

  // If more than one occurrence was found, reconstruct the string with one
  if (count > 1) {
    return currentSource + target;
  } else {
    return source;
  }
}

export function getFallbackString(value: string) {
  return value
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map(item => item.slice(0, 1).toUpperCase())
    .join('');
}
