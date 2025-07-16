import '@sentry/electron/preload';

export function isPortable() {
  if (process.env.PORTABLE_EXECUTABLE_FILE) return 'win';
  if (process.env.APPIMAGE) return 'linux';
  return null;
}
