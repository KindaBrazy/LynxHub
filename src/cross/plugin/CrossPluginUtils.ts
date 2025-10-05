import {SubscribeStages} from '../CrossTypes';
import {VersionItemValidated} from './PluginTypes';

export function getTargetVersion(versions: VersionItemValidated[], stage: SubscribeStages) {
  const findVersionByStage = (requiredStage: SubscribeStages): VersionItemValidated | undefined => {
    return versions.find(v => v.stage === requiredStage);
  };

  let versionItem: VersionItemValidated | undefined = undefined;

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
    return versionItem;
  } else {
    return versions[0];
  }
}

export function getTargetCommit(versions: VersionItemValidated[], stage: SubscribeStages) {
  return getTargetVersion(versions, stage).commit;
}
