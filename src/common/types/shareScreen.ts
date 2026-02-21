/**
 * Represents a source that can be shared (a window or a screen).
 * Mapped from Electron's DesktopCapturerSource.
 */
export type ScreenShareSources = {
  /** The icon of the window or screen (Data URL). */
  icon?: string;
  /** The unique ID of the window or screen source. */
  id?: string;
  /** The name of the window or screen. */
  name: string;
  /** The thumbnail image of the window or screen (Data URL). */
  thumbnail?: string;
  /** The display ID, if this is a screen source. */
  displayId?: string;
};

/**
 * Configuration for starting a screen share session.
 */
export type ScreenShareStart = {
  /** The ID of the source to share. */
  id: string;
  /** Whether to capture audio. */
  shareAudio: boolean;
  /** The type of source being shared. */
  type: 'windows' | 'screens';
};
