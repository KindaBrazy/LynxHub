/**
 * Standard error structure for file system operations.
 */
export type FileSystemError = {
  /** The error code (e.g., ENOENT). */
  code: string;
  /** The technical error message. */
  message: string;
  /** A user-friendly message describing the error. */
  userMessage: string;
};
