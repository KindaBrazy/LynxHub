import {SubscribeStages} from '../CrossTypes';
import {extractGitUrl} from '../CrossUtils';
import {PluginVersions, VersionItem, VersionItemValidated} from './PluginTypes';

export function getTargetVersion(versions: VersionItemValidated[] | PluginVersions, stage: SubscribeStages) {
  const findVersionByStage = (requiredStage: SubscribeStages) => {
    return versions.find(v => v.stage === requiredStage);
  };

  let versionItem: VersionItemValidated | VersionItem | undefined = undefined;

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

export function getUpdateType(versions: PluginVersions, currentCommit: string, targetCommit: string) {
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

  return type;
}

export function getTargetCommit(versions: VersionItemValidated[] | PluginVersions, stage: SubscribeStages) {
  return getTargetVersion(versions, stage).commit;
}

export function getPluginReadme(repoUrl: string) {
  try {
    const {owner, repo} = extractGitUrl(repoUrl);

    if (owner && repo) {
      return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/source/README.md`;
    }
  } catch (error) {
    console.error('Failed to parse repository URL:', repoUrl, error);
    return undefined;
  }
}
