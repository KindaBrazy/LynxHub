import DescriptionGrid, {DescriptionGridItem} from '@lynx/components/DescriptionGrid';
import {RepositoryInfo} from '@lynx_common/types';
import {memo} from 'react';

interface CommitInfoProps {
  repoInfo: RepositoryInfo;
}

function CommitInfo({repoInfo}: CommitInfoProps) {
  const commitItems: DescriptionGridItem[] = [
    {key: 'branch', label: 'Current Branch', content: repoInfo.currentBranch},
    {
      key: 'hash',
      label: 'Last Commit Hash',
      content: <span className="break-all">{repoInfo.lastCommitHash}</span>,
    },
    {
      key: 'message',
      label: 'Last Commit Message',
      content: <span className="whitespace-pre-wrap">{repoInfo.lastCommitMessage}</span>,
    },
    {key: 'time', label: 'Last Commit Time', content: repoInfo.lastCommitTime},
  ];

  return (
    <DescriptionGrid
      columns={2}
      title="Commit Info"
      items={commitItems}
      itemClassName="bg-surface"
      className="bg-surface-secondary"
    />
  );
}

export default memo(CommitInfo);
