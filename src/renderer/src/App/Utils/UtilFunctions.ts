import {isEmpty} from 'lodash';

/**
 * Formats a number with K, M, B, T suffixes for thousands, millions, billions, and trillions.
 * @param num - The number to format
 * @returns Formatted string representation of the number
 */
export function formatNumber(num: number): string {
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const magnitude = Math.floor(Math.log10(Math.abs(num)) / 3);
  if (magnitude === 0 || !Number.isFinite(num)) return num.toString();
  const scaled = num / Math.pow(10, magnitude * 3);
  return `${scaled.toFixed(1).replace(/\.0$/, '')}${suffixes[magnitude]}`;
}

/**
 * Converts a Blob to a data URL.
 * @param blob - The Blob to convert
 * @returns Promise resolving to the data URL
 */
export function convertBlobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Converts an array of strings to an array of objects with a 'name' property.
 * @param arr - Array of strings
 * @returns Array of objects with 'name' property
 */
export const convertArrToObject = (arr: string[]): {name: string}[] => arr.map(name => ({name}));

/**
 * Checks if WebGL2 is supported in the current environment.
 * @returns Boolean indicating WebGL2 support
 */
export function isWebgl2Supported(): boolean {
  if (!window.WebGL2RenderingContext) return false;
  const canvas = document.createElement('canvas');
  return canvas.getContext('webgl2', {depth: false, antialias: false}) instanceof WebGL2RenderingContext;
}

/**
 * Searches for words within an array of strings.
 * @param searchText - The text to search for
 * @param targetTexts - Array of strings to search within
 * @returns Boolean indicating if all search words are found
 */
export function searchInStrings(searchText: string, targetTexts: (string | undefined)[] | undefined): boolean {
  if (isEmpty(searchText) || !targetTexts) return true;

  const searchWords = searchText.toLowerCase().split(/\s+/);
  const lowerTargetTexts = (targetTexts.filter(Boolean) as string[]).map(text => text.toLowerCase());

  return searchWords.every(word => lowerTargetTexts.some(text => text.includes(word)));
}
