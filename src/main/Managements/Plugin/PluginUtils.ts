import {SubscribeStages} from '../../../cross/CrossTypes';
import {PluginVersions, VersionItem} from '../../../cross/plugin/PluginTypes';
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

export async function isUpdateAvailable(id: string, currentCommit: string, stage: SubscribeStages) {
  const {versions} = await staticManager.getPluginVersioningById(id);
  const targetCommit = getTargetCommit(versions, stage);

  return currentCommit !== targetCommit;
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
