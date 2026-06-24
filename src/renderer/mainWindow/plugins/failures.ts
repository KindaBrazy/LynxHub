import {UnloadedPlugins} from '@lynx_common/types/plugins';

const rendererFailures: UnloadedPlugins[] = [];

/**
 * Records a plugin load failure that occurred in the renderer process.
 */
export function addRendererFailure(id: string, message: string): void {
  if (!rendererFailures.some(f => f.id === id)) {
    rendererFailures.push({id, message});
  }
}

/**
 * Gets the list of registered renderer-process load failures.
 */
export function getRendererFailures(): UnloadedPlugins[] {
  return rendererFailures;
}
