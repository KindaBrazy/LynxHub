
import {AudioState} from '@lynx_common/types/ipc';
import BrowserManager from '@lynx_main/managers/browser';

/**
 * Sets the volume for a specific browser view.
 * @param browserManager - The browser manager instance.
 * @param id - The ID of the browser view.
 * @param volume - The volume level (0-100).
 */
export async function handleSetVolume(browserManager: BrowserManager, id: string, volume: number): Promise<void> {
  try {
    // Validate volume range
    if (typeof volume !== 'number' || isNaN(volume)) {
      throw new Error(`Invalid volume value: ${volume}. Volume must be a valid number.`);
    }

    // Clamp volume to valid range
    const clampedVolume = Math.max(0, Math.min(100, volume));

    await browserManager.setVolume(id, clampedVolume);
  } catch (error) {
    console.error(`Error in handleSetVolume for id ${id}:`, error);
    throw error;
  }
}

/**
 * Sets the muted state for a specific browser view.
 * @param browserManager - The browser manager instance.
 * @param id - The ID of the browser view.
 * @param muted - Whether to mute the audio.
 */
export function handleSetMuted(browserManager: BrowserManager, id: string, muted: boolean): void {
  try {
    // Validate muted parameter
    if (typeof muted !== 'boolean') {
      throw new Error(`Invalid muted value: ${muted}. Muted must be a boolean.`);
    }

    browserManager.setMuted(id, muted);
  } catch (error) {
    console.error(`Error in handleSetMuted for id ${id}:`, error);
    throw error;
  }
}

/**
 * Retrieves the audio state for a specific browser view.
 * @param browserManager - The browser manager instance.
 * @param id - The ID of the browser view.
 * @returns The audio state or null if retrieval failed.
 */
export function handleGetAudioState(browserManager: BrowserManager, id: string): AudioState | null {
  try {
    return browserManager.getAudioState(id);
  } catch (error) {
    console.error(`Error in handleGetAudioState for id ${id}:`, error);
    return null;
  }
}
