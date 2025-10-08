import {OsPlatforms, SubscribeStages} from '../CrossTypes';

export type PluginEngines = {moduleApi?: string; extensionApi?: string};

export type ChangelogSubItem = string | Record<string, ChangelogSubItem[]>;
export type ChangelogItem = Record<string, ChangelogSubItem[]>;
export type PluginChangelog = {version: string; date: string; items: ChangelogItem[]};
export type PluginChanges = PluginChangelog[];

export type VersionItem = {
  version: string;
  commit: string;
  stage: SubscribeStages;
  engines: PluginEngines;
  platforms: OsPlatforms[];
};
export type PluginVersions = VersionItem[];
export type PluginVersioning = {versions: PluginVersions; changes: PluginChanges};

export type PluginMetadata = {
  id: string;
  title: string;
  description: string;
  type: 'module' | 'extension';
};

type PluginCompatibility = {
  isCompatible: boolean;
  incompatibleReason?: string;
};
export type VersionItemValidated = Omit<VersionItem, 'engines'> & PluginCompatibility;
export type PluginItem = {
  url: string;
  metadata: PluginMetadata;
  versions: VersionItemValidated[];
  changes: PluginChanges;
} & PluginCompatibility;

export type PluginSyncItem = {id: string; type: 'downgrade' | 'upgrade'; version: string; commit: string};
export type PluginInstalledItem = {id: string; url: string; version: string};
export type UnloadedPlugins = {id: string; message: string};
export type PluginFilter = Set<'installed' | 'modules' | 'extensions'> | 'all';
export type ValidatedPlugins = {type: 'module' | 'extension'; folder: string}[];
export type PluginAddresses = {type: 'module' | 'extension'; address: string}[];
