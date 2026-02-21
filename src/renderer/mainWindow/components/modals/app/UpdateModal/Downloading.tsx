import {Progress} from '@heroui/react';
import {UpdateDownloadProgress} from '@lynx_common/types';
import {formatSize} from '@lynx_common/utils';

type Props = {progress: UpdateDownloadProgress | undefined};

/** Downloading update progress */
export default function Downloading({progress}: Props) {
  return (
    <div className="flex flex-col gap-6 py-4">
      <Progress 
        color="secondary" 
        value={progress?.percent || 0} 
        aria-label="Download Progress" 
        size="lg"
        showValueLabel
      />

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="flex flex-col gap-1">
          <span className="text-small text-default-500">Percentage</span>
          <span className="font-mono text-medium">{Math.floor(progress?.percent || 0)}%</span>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-small text-default-500">Size</span>
          <span className="font-mono text-medium">
            {`${formatSize(progress?.transferred)} / ${formatSize(progress?.total)}`}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-small text-default-500">Speed</span>
          <span className="font-mono text-medium">
            {formatSize(progress?.bytesPerSecond)}/s
          </span>
        </div>
      </div>
    </div>
  );
}
