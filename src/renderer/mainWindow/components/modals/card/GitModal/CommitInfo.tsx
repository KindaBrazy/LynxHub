import {RepositoryInfo} from '@lynx_common/types';
import {memo} from 'react';

interface CommitInfoProps {
  repoInfo: RepositoryInfo;
}

function CommitInfo({repoInfo}: CommitInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">Current Branch: </span>
        <span className="text-foreground-500">{repoInfo.currentBranch}</span>
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="font-semibold text-foreground">Last Commit Hash: </span>
        <span className="text-foreground-500 break-all">{repoInfo.lastCommitHash}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">Last Commit Message: </span>
        <span className="text-foreground-500 whitespace-pre-wrap">{repoInfo.lastCommitMessage}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">Last Commit Time: </span>
        <span className="text-foreground-500">{repoInfo.lastCommitTime}</span>
      </div>
    </div>
  );
}

export default memo(CommitInfo);
