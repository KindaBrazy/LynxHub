import {execSync} from 'node:child_process';
import {platform} from 'node:os';
import {resolve} from 'node:path';

import {promises} from 'graceful-fs';
import {satisfies} from 'semver';

import {EXTENSION_API_VERSION, MODULE_API_VERSION} from '../../../cross/CrossConstants';
import {SubscribeStages} from '../../../cross/CrossTypes';
import {getTargetCommit, getTargetVersion, getUpdateType} from '../../../cross/plugin/CrossPluginUtils';
import {
  PluginEngines,
  PluginItem,
  PluginSyncItem,
  VersionItem,
  VersionItemValidated,
} from '../../../cross/plugin/PluginTypes';
import {staticManager} from '../../index';
import {RelaunchApp} from '../../Utilities/Utils';
import {getAppDataPath, selectNewAppDataFolder} from '../AppDataManager';
import GitManager from '../Git/GitManager';
import ShowToastWindow from '../ToastWindowManager';

export async function getVersionByCommit(id: string, commit: string) {
  const {versions} = await staticManager.getPluginVersioningById(id);
  return versions.find(v => v.commit === commit)?.version;
}
export async function getVersionItemByCommit(id: string, commit: string) {
  const {versions} = await staticManager.getPluginVersioningById(id);
  return versions.find(v => v.commit === commit);
}

/**
 * Checks if an update is available and determines if it's an upgrade or downgrade.
 * @param id Plugin ID.
 * @param currentCommit The commit hash currently installed.
 * @param stage The target subscription stage.
 * @returns A PluginUpdateList item if an update is available, otherwise undefined.
 */
export async function isSyncRequired(
  id: string,
  currentCommit: string,
  stage: SubscribeStages,
): Promise<PluginSyncItem | undefined> {
  const {versions} = await staticManager.getPluginVersioningById(id);
  const targetVersion = getTargetVersion(versions, stage);

  const version = targetVersion.version;
  const commit = targetVersion.commit;

  const type = getUpdateType(versions, currentCommit, commit);

  if (currentCommit === commit || !type) return undefined;

  return {
    id,
    type,
    version,
    commit,
  };
}

export async function getCommitByAppStage(id: string) {
  const {versions} = await staticManager.getPluginVersioningById(id);
  const stage = await staticManager.getCurrentAppState();

  return getTargetCommit(versions, stage);
}

export function showGitOwnershipToast() {
  ShowToastWindow(
    {
      buttons: ['exit'],
      customButtons: [
        {id: 'add_safe', color: 'warning', label: 'Add to Safe Directories'},
        {id: 'change_data_dir', color: 'success', label: 'Change Data Directory'},
      ],
      title: 'Git Ownership Warning',
      message:
        'Git has detected dubious ownership of the data directory. This can happen when the repository is owned by ' +
        "a different user. You can either add data directory to Git's safe directories or choose a different " +
        'location.',
      type: 'warning',
    },
    (id, window) => {
      if (id === 'add_safe') {
        const DataDirectory = getAppDataPath();
        execSync(`git config --global --add safe.directory '${DataDirectory}/*'`);
      } else if (id === 'change_data_dir') {
        selectNewAppDataFolder(window)
          .then(() => RelaunchApp(false))
          .catch(() => console.error('Error changing data directory'));
      }
    },
  );
}

export async function removeOldInstallations(folder: string) {
  const oldInstallations: string[] = [];

  // Store already installed plugins
  try {
    const entries = await promises.readdir(folder, {withFileTypes: true});

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subdirPath = resolve(folder, entry.name);
        try {
          const url = await GitManager.remoteUrlFromDir(subdirPath);
          if (url) oldInstallations.push(url);
        } catch (e) {
          // Ignore subdirectories that are not Git repositories or where the remote cannot be determined
          console.warn(`Could not determine remote URL for ${subdirPath}:`, e);
        }
      }
    }
  } catch (error) {
    console.error(`Failed to read plugin directory ${folder}:`, error);
  }

  // Remove old installations
  try {
    await promises.rm(folder, {recursive: true, force: true});
  } catch (error) {
    console.error(`Failed to clean directory ${folder}:`, error);
    throw error;
  }

  return oldInstallations;
}

export function isItemCompatible(
  version: VersionItem,
  type: 'module' | 'extension',
  currentStage: SubscribeStages,
): {compatible: boolean; reason: string | undefined} {
  // 1. Subscribe Stage Check
  switch (currentStage) {
    // Have access to all stages
    case 'insider':
      break;

    // Have access to public and early access stages
    case 'early_access':
      if (version.stage === 'insider') {
        return {
          compatible: false,
          reason:
            `Version ${version.version} is only available for Insider subscribers.\n` +
            `Please upgrade your plan to get access.`,
        };
      }
      break;

    // Have access to only the public stage
    case 'public':
      if (version.stage !== 'public') {
        const requiredStage = version.stage === 'insider' ? 'Insider' : 'Early Access';
        return {
          compatible: false,
          reason:
            `Version ${version.version} requires an ${requiredStage} or higher subscription.\n` +
            `Please upgrade your plan to get access.`,
        };
      }
      break;
  }

  const currentPlatform = platform();

  // 2. Platform Check
  const platforms = version.platforms;
  if (!platforms || !platforms.includes(currentPlatform)) {
    const supportedPlatforms = platforms?.join(', ') || 'none';
    return {
      compatible: false,
      reason:
        `Version ${version.version} is not compatible with your operating system\n` +
        `(${currentPlatform}). It only supports: ${supportedPlatforms}.`,
    };
  }

  // 3. Engines/API Check
  const engines = version.engines;
  if (engines && typeof engines === 'object') {
    const moduleCheck = {api: 'moduleApi', version: MODULE_API_VERSION, type: 'Module'};
    const extensionCheck = {api: 'extensionApi', version: EXTENSION_API_VERSION, type: 'Extension'};

    const targetCheck = type === 'extension' ? extensionCheck : moduleCheck;
    const requiredRange = engines[targetCheck.api as keyof PluginEngines];

    if (requiredRange) {
      if (!satisfies(targetCheck.version, requiredRange)) {
        return {
          compatible: false,
          reason:
            `Version ${version.version} requires a different application version.\n` +
            `It needs ${type} api version ${requiredRange}, but current version api is ${targetCheck.version}.`,
        };
      }
    } else {
      // This suggests the package itself is malformed or invalid.
      return {
        compatible: false,
        reason:
          `Could not verify compatibility for version ${version.version}.\n` +
          `The package metadata may be missing or corrupted.`,
      };
    }
  } else {
    // A fallback for the same reason as above.
    return {
      compatible: false,
      reason: `Could not find compatibility information for version ${version.version}.`,
    };
  }

  // If all checks pass, it's compatible.
  return {compatible: true, reason: undefined};
}

export async function getList(currentStage: SubscribeStages): Promise<PluginItem[]> {
  const list = await staticManager.getPluginsList();
  const validated: PluginItem[] = [];

  for (const item of list) {
    const versions: VersionItemValidated[] = [];

    for (const v of item.versioning.versions) {
      const {version, commit, stage, platforms} = v;
      const {compatible: isCompatible, reason: incompatibleReason} = isItemCompatible(
        v,
        item.metadata.type,
        currentStage,
      );
      versions.push({version, commit, stage, platforms, isCompatible, incompatibleReason});
    }

    const isCompatible: boolean = versions.some(v => v.isCompatible);
    const incompatibleReason: string | undefined = versions.find(v => !v.isCompatible)?.incompatibleReason;

    const {metadata, url, versioning} = item;

    validated.push({
      isCompatible,
      metadata,
      url,
      versions,
      incompatibleReason,
      changes: versioning.changes,
    });
  }

  return validated;
}
