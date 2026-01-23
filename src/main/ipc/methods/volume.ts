import {AudioState} from '../../../common/types/ipc';
import BrowserManager from '../../core/browser';

export async function handleSetVolume(browserManager: BrowserManager, id: string, volume: number): Promise<void> {
  try {
    // Validate volume range
    if (typeof volume !== 'number' || isNaN(volume)) {
      console.error('Invalid volume value:', volume);
      throw new Error('Volume must be a valid number');
    }

    // Clamp volume to valid range
    const clampedVolume = Math.max(0, Math.min(100, volume));

    await browserManager.setVolume(id, clampedVolume);
  } catch (error) {
    console.error('Error in handleSetVolume:', error);
    throw error;
  }
}

export function handleSetMuted(browserManager: BrowserManager, id: string, muted: boolean): void {
  try {
    // Validate muted parameter
    if (typeof muted !== 'boolean') {
      console.error('Invalid muted value:', muted);
      throw new Error('Muted must be a boolean');
    }

    browserManager.setMuted(id, muted);
  } catch (error) {
    console.error('Error in handleSetMuted:', error);
    throw error;
  }
}

export function handleGetAudioState(browserManager: BrowserManager, id: string): AudioState | null {
  try {
    return browserManager.getAudioState(id);
  } catch (error) {
    console.error('Error in handleGetAudioState:', error);
    return null;
  }
}
