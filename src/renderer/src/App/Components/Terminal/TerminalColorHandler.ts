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
  magenta: '\x1b[35m', // Special messages
  reset: '\x1b[0m', // Reset color
};

const detectType = (text: string) => {
  if (patterns.errors.some(pattern => text.includes(pattern))) {
    return 'error';
  }
  if (patterns.warnings.some(pattern => text.includes(pattern))) {
    return 'warning';
  }
  if (patterns.success.some(pattern => text.includes(pattern))) {
    return 'success';
  }
  if (patterns.info.some(pattern => text.includes(pattern))) {
    return 'info';
  }
  if (patterns.debug.some(pattern => text.includes(pattern))) {
    return 'debug';
  }
  return 'default';
};

const getColor = (type: string) => {
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

export default function parseTerminalColors(text: string) {
  const type = detectType(text);
  const color = getColor(type);

  if (color) {
    return `${color}${text}${colors.reset}`;
  } else {
    return text;
  }
}
