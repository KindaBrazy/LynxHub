import {ProgressBar} from '@heroui/react';
import {UpdateDownloadProgress} from '@lynx_common/types';
import {formatSize} from '@lynx_common/utils';

import DescriptionGrid from '../../DescriptionGrid';

type Props = {progress: UpdateDownloadProgress | undefined};

/** Downloading update progress */
export default function Downloading({progress}: Props) {
  return (
    <div className="flex flex-col gap-6 py-4">
      <ProgressBar size="lg" value={progress?.percent || 0} aria-label="Downloading update">
        <ProgressBar.Output />
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>

      <DescriptionGrid
        items={[
          {key: 'percentage', content: `${Math.floor(progress?.percent || 0)}%`, label: 'Percentage'},
          {
            key: 'size',
            content: `${formatSize(progress?.transferred)} / ${formatSize(progress?.total)}`,
            label: 'Size',
          },
          {key: 'speed', content: `${formatSize(progress?.bytesPerSecond)}/s`, label: 'Speed'},
        ]}
        columns={3}
        itemClassName="bg-surface"
        className="bg-surface-secondary"
      />
    </div>
  );
}
