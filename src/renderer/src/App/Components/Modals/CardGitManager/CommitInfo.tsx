import {RepositoryInfo} from '../../../../../../cross/CrossTypes';

type Props = {repoInfo: RepositoryInfo};
export default function CommitInfo({repoInfo}: Props) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="flex flex-col">
        <span className="font-semibold">Current Branch: </span>
        <span className="text-foreground-500">{repoInfo.currentBranch}</span>
      </div>
      <div className="flex flex-col overflow-hidden ">
        <span className="font-semibold">Last Commit Hash: </span>
        <span className="text-foreground-500 break-words">{repoInfo.lastCommitHash}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">Last Commit Message: </span>
        <span className="text-foreground-500 flex">{repoInfo.lastCommitMessage}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">Last Commit Time: </span>
        <span className="text-foreground-500 flex">{repoInfo.lastCommitTime}</span>
      </div>
    </div>
  );
}
