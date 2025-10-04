import {SubscribeStages} from '../../../cross/CrossTypes';
import {PluginUpdateList, PluginVersions, VersionItem} from '../../../cross/plugin/PluginTypes';
import {staticManager} from '../../index';

export function getTargetCommit(versions: PluginVersions, stage: SubscribeStages) {
  const findVersionByStage = (requiredStage: SubscribeStages): VersionItem | undefined => {
    return versions.find(v => v.stage.includes(requiredStage));
  };

  let versionItem: VersionItem | undefined = undefined;

  switch (stage) {
    case 'insider': {
      versionItem = findVersionByStage('insider');

      if (!versionItem) {
        versionItem = findVersionByStage('early_access');
      }

      if (!versionItem) {
        versionItem = findVersionByStage('public');
      }
      break;
    }

    case 'early_access': {
      versionItem = findVersionByStage('early_access');

      if (!versionItem) {
        versionItem = findVersionByStage('public');
      }
      break;
    }

    case 'public': {
      versionItem = findVersionByStage('public');
      break;
    }
  }

  if (versionItem) {
    return versionItem.commit;
  } else {
    return versions[0].commit;
  }
}

export async function getVersionByCommit(id: string, commit: string) {
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
export async function isUpdateAvailable(
  id: string,
  currentCommit: string,
  stage: SubscribeStages,
): Promise<PluginUpdateList | undefined> {
  const {versions} = await staticManager.getPluginVersioningById(id);
  const targetCommit = getTargetCommit(versions, stage);

  if (currentCommit === targetCommit) {
    return undefined;
  }

  const currentCommitIndex = versions.findIndex(v => v.commit === currentCommit);
  const targetCommitIndex = versions.findIndex(v => v.commit === targetCommit);

  // If one of the commits isn't found, we treat it as an upgrade for safety,
  // unless we can't find the target, in which case we return undefined.
  if (targetCommitIndex === -1) {
    return undefined;
  }

  let type: 'downgrade' | 'upgrade';

  if (currentCommitIndex === -1) {
    // The current commit is unknown, treat as upgrade.
    type = 'upgrade';
  } else if (targetCommitIndex < currentCommitIndex) {
    // Target commit is closer to index 0 (newer) than the current commit.
    type = 'upgrade';
  } else {
    // Target commit is further from index 0 (older) than the current commit.
    type = 'downgrade';
  }

  return {
    id,
    type,
    targetCommit,
  };
}

export async function getCommitByStage(id: string, stage: SubscribeStages) {
  const {versions} = await staticManager.getPluginVersioningById(id);
  return getTargetCommit(versions, stage);
}

export async function getCommitByAppStage(id: string) {
  const {versions} = await staticManager.getPluginVersioningById(id);
  const stage = await staticManager.getCurrentAppState();

  return getTargetCommit(versions, stage);
}
