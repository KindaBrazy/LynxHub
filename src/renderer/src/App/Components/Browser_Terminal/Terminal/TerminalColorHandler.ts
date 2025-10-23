const patterns = {
  errors: ['error', 'Error', 'ERROR', 'exception', 'Exception', 'failed', 'Failed', 'Traceback'],
  warnings: ['warning', 'Warning', 'WARN', 'deprecated', 'Deprecated', 'caution'],
  success: ['success', 'Success', 'completed', 'Completed', 'done', 'Done', 'installed', 'Installed'],
  info: ['info', 'Info', 'notice', 'Notice', 'running', 'Running', 'loading', 'Loading'],
  debug: ['debug', 'Debug', 'trace', 'Trace', 'verbose', 'Verbose'],
};

const colors = {
  red: '\x1b[31m', // Errors
  orange: '\x1b[38;5;214m', // Warnings
  green: '\x1b[38;5;46m', // Success
  blue: '\x1b[38;5;39m', // Info
  cyan: '\x1b[36m', // Debug
  reset: '\x1b[0m', // Reset color
};

// Pre-compile regexes for performance. This is done once when the module is loaded.
const compiledPatterns = {
  errors: new RegExp(patterns.errors.join('|'), 'i'),
  warnings: new RegExp(patterns.warnings.join('|'), 'i'),
  success: new RegExp(patterns.success.join('|'), 'i'),
  info: new RegExp(patterns.info.join('|'), 'i'),
  debug: new RegExp(patterns.debug.join('|'), 'i'),
};

const detectLineType = (line: string): string => {
  if (compiledPatterns.errors.test(line)) return 'error';
  if (compiledPatterns.warnings.test(line)) return 'warning';
  if (compiledPatterns.success.test(line)) return 'success';
  if (compiledPatterns.info.test(line)) return 'info';
  if (compiledPatterns.debug.test(line)) return 'debug';
  return 'default';
};

const getColorCode = (type: string): string => {
  switch (type) {
    case 'error':
      return colors.red;
    case 'warning':
      return colors.orange;
    case 'success':
      return colors.green;
    case 'info':
      return colors.blue;
    case 'debug':
      return colors.cyan;
    default:
      return '';
  }
};

/**
 * Parses terminal output text and applies colors based on keywords found in each line.
 * @param text - The raw string data from the terminal.
 * @returns The colorized text with ANSI escape codes.
 */
export default function parseTerminalColors(text: string): string {
  return text
    .split('\n')
    .map(line => {
      const type = detectLineType(line);
      const colorCode = getColorCode(type);

      if (colorCode && line.trim() !== '') {
        return `${colorCode}${line}${colors.reset}`;
      }
      return line;
    })
    .join('\n');
}
