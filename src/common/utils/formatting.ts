import {StorageUnit} from '../types';

/**
 * Formatting utilities.
 */

/**
 * Formats the total size into a human-readable format (MB or GB).
 *
 * @param {number} size - The total size in bytes.
 * @returns {string} The formatted size with the appropriate unit (MB or GB).
 */
export function formatSize(size: number | undefined): string {
  if (!size) return '0KB';
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

/**
 * Formats the total size in KB into a human-readable format (KB, MB, or GB).
 *
 * @param {number} sizeKB - The total size in kilobytes.
 * @returns {string} The formatted size with the appropriate unit (KB, MB, or GB).
 */
export function formatSizeKB(sizeKB: number | undefined): string {
  if (!sizeKB) return '0 KB';
  if (sizeKB < 1024) {
    return `${sizeKB.toFixed(2)} KB`;
  } else if (sizeKB < 1024 * 1024) {
    return `${(sizeKB / 1024).toFixed(2)} MB`;
  } else {
    return `${(sizeKB / (1024 * 1024)).toFixed(2)} GB`;
  }
}

/**
 * Formats bytes to human readable string (B, KB, MB, GB).
 * @param {number} bytes - The number of bytes.
 * @returns {string} The formatted string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Gets a numerical value from a string, converts it based on the initial unit,
 * and then converts it to the specified target unit.
 *
 * @param {string} valueString - The string containing the value (e.g., "1024", "2.5").
 * @param {StorageUnit} initialUnit - The unit of the provided value.
 * @param {StorageUnit} targetUnit - The unit to convert the final value to.
 * @returns {number | null} The converted numerical value, or null if parsing fails.
 */
export function convertStorageUnit(
  valueString: string,
  initialUnit: StorageUnit,
  targetUnit: StorageUnit,
): number | null {
  // 1. Define the conversion factor relative to the smallest common unit (Bytes)
  const UNIT_FACTORS: {[key: string]: number} = {
    // Standard Binary Prefixes (base 1024)
    b: 1, // Bytes
    kb: 1024, // Kilobytes
    mb: 1024 * 1024, // Megabytes
    gb: 1024 * 1024 * 1024, // Gigabytes
    tb: 1024 * 1024 * 1024 * 1024, // Terabytes
    pb: 1024 * 1024 * 1024 * 1024 * 1024, // Petabytes
  };

  // Helper function to standardize unit keys to lowercase for internal lookup
  const standardizeUnit = (unit: string): string => unit.toLowerCase().trim();

  // Standardize the units
  const initialKey = standardizeUnit(initialUnit);
  const targetKey = standardizeUnit(targetUnit);

  // 2. Validate units
  if (!UNIT_FACTORS[initialKey] || !UNIT_FACTORS[targetKey]) {
    console.error(`Internal error: Unit factor missing for Initial: ${initialUnit} or Target: ${targetUnit}`);
    return null;
  }

  // 3. Extract the numerical value from the string
  const match = valueString.match(/(\d+\.?\d*)/);
  if (!match) {
    console.error(`Could not parse numerical value from string: ${valueString}`);
    return null;
  }

  const numericValue = parseFloat(match[0]);
  if (isNaN(numericValue)) {
    console.error(`Parsed value is not a number: ${match[0]}`);
    return null;
  }

  // 4. Conversion Logic
  const initialFactor = UNIT_FACTORS[initialKey];
  const valueInBytes = numericValue * initialFactor;

  const targetFactor = UNIT_FACTORS[targetKey];

  return valueInBytes / targetFactor;
}
