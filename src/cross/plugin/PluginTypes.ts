import {OsPlatforms, SubscribeStages} from '../CrossTypes';

/**
 * Specifies the minimum required API versions for plugin compatibility.
 */
export type PluginEngines = {
  /**
   * Minimum required version of the core module API.
   * Used to ensure compatibility with the host application's module system.
   */
  moduleApi?: string;

  /**
   * Minimum required version of the extension API.
   * Ensures the plugin can interface correctly with extension-specific features.
   */
  extensionApi?: string;
};

/**
 * Represents a single changelog entry, which can be either:
 * - A plain string describing a change, or
 * - A nested object grouping related changes under semantic keys (e.g., "features", "fixes").
 */
export type ChangelogSubItem = string | Record<string, ChangelogSubItem[]>;

/**
 * A collection of changelog entries grouped under semantic categories.
 * Each key represents a category (e.g., "Added", "Fixed", "Changed"),
 * and its value is an array of changes or nested sub-items.
 */
export type ChangelogItem = Record<string, ChangelogSubItem[]>;

/**
 * Describes the changes introduced in a specific plugin version.
 */
export type PluginChangelog = {
  /**
   * Semantic version string (e.g., "1.2.3").
   */
  version: string;

  /**
   * ISO 8601 formatted release date (e.g., "2023-10-05").
   */
  date: string;

  /**
   * List of categorized changelog entries for this version.
   */
  items: ChangelogItem[];
};

/**
 * Complete changelog history for a plugin, ordered chronologically (typically newest first).
 */
export type PluginChanges = PluginChangelog[];

/**
 * Metadata for a specific released version of the plugin.
 */
export type VersionItem = {
  /**
   * Semantic version label (e.g., "2.1.0").
   */
  version: string;

  /**
   * Git commit hash or reference that corresponds to this release.
   * Used for precise version tracking and rollback capabilities.
   */
  commit: string;

  /**
   * Availability stages for this version.
   * - 'insider': Internal/testing builds
   * - 'early_access': Pre-release builds for select users
   * - 'public': Generally available release
   */
  stage: SubscribeStages[];

  /**
   * Required engine versions for compatibility with this plugin version.
   */
  engines: PluginEngines;
};

/**
 * Ordered list of all released plugin versions, typically sorted from newest to oldest.
 */
export type PluginVersions = VersionItem[];

/**
 * Comprehensive versioning information for a plugin,
 * including both release metadata and detailed changelogs.
 */
export type PluginVersioning = {
  /**
   * List of all released versions with their metadata.
   */
  versions: PluginVersions;

  /**
   * Full changelog history across all versions.
   */
  changes: PluginChanges;
};

/**
 * Core identifying and descriptive metadata for a plugin.
 */
export type PluginMetadata = {
  /**
   * Unique identifier for the plugin (e.g., "python_toolkit").
   * Used for installation, updates, and dependency management.
   */
  id: string;

  /**
   * Human-readable display name of the plugin.
   */
  title: string;

  /**
   * Concise summary of the plugin's functionality and purpose.
   */
  description: string;

  /**
   * Specifies the platforms this plugin is compatible with.
   * If omitted, the plugin is assumed to be cross-platform compatible.
   * Examples: ['windows', 'linux']
   */
  platforms?: OsPlatforms[];

  /**
   * Specifies the type of plugin.
   */
  type: 'module' | 'extension';
};

export type PluginUpdateList = {
  id: string;
  targetCommit: string;
};

export type InstalledPlugin = {dir: string; url: string; version: VersionItem; metadata: PluginMetadata};
export type PluginAvailableItem = {metadata: PluginMetadata; versioning: PluginVersioning; icon: string; url: string};

export type PluginAddresses = {type: 'module' | 'extension'; address: string}[];
export type ValidatedPlugins = {type: 'module' | 'extension'; folder: string}[];
