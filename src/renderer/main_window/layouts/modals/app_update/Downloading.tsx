import {Progress} from '@heroui/react';
import {UpdateDownloadProgress} from '@lynx_cross/types';
import {formatSize} from '@lynx_cross/utils';
import {Descriptions} from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';

type Props = {progress: UpdateDownloadProgress | undefined};

/** Downloading update progress */
export default function Downloading({progress}: Props) {
  return (
    <div className="flex flex-col gap-y-2">
      <Progress color="secondary" value={progress?.percent || 0} aria-label="Download Progress" />

      <Descriptions size="small" layout="vertical">
        <DescriptionsItem label="Percentage">{`${Math.floor(progress?.percent || 0)}%`}</DescriptionsItem>
        <DescriptionsItem label="Size">
          {`${formatSize(progress?.transferred)}` + `/${formatSize(progress?.total)}`}
        </DescriptionsItem>
        <DescriptionsItem label="Speed">{formatSize(progress?.bytesPerSecond)}</DescriptionsItem>
      </Descriptions>
    </div>
  );
}
