/**
 * Configuration for plugin folder structures and entry points.
 * Defines the standard paths for modules and extensions within the plugin system.
 */
export const pluginFolders = {
  module: {
    oldFolder: 'Modules',
    mainScript: 'scripts/main.mjs',
    rendererScript: 'scripts/renderer.mjs',
  },
  extension: {
    oldFolder: 'Extensions',
    mainScript: 'scripts/main/mainEntry.cjs',
    rendererScript: 'scripts/renderer/rendererEntry.mjs',
  },
};
