import {Button} from '@nextui-org/react';
import {Descriptions, DescriptionsProps} from 'antd';
import {useCallback, useMemo} from 'react';

import {ExternalLink_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons1';
import {OpenFolder_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons4';
import {HardDrive_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons5';
import rendererIpc from '../../../RendererIpc';
import {progressElem} from './CardInfo-Modal';

type Props = {
  installDir: string;
  totalSize: string;
  extensionsSize: string;
  supportExtensions: boolean;
};

/** Disk usage information. */
export default function CardInfoDisk({extensionsSize, installDir, totalSize, supportExtensions = false}: Props) {
  const openDir = useCallback(() => {
    rendererIpc.file.openPath(installDir);
  }, [installDir]);

  const diskUsage = useMemo<DescriptionsProps['items']>(() => {
    const items: DescriptionsProps['items'] = [
      {
        key: 'totalSize',
        label: 'Total Size',
        children: totalSize ? <span>{totalSize}</span> : progressElem('Calculating...'),
      },
    ];

    if (supportExtensions) {
      items.push({
        key: 'extensionsSize',
        label: 'Extensions Size',
        children: extensionsSize ? <span>{extensionsSize}</span> : progressElem('Calculating...'),
      });
    }

    return items;
  }, [totalSize, installDir, extensionsSize, supportExtensions]);

  return (
    <>
      <Descriptions
        title={
          <div className="flex flex-row items-center gap-x-2">
            <div>
              <HardDrive_Icon />
            </div>
            <span>Disk Usage</span>
          </div>
        }
        column={2}
        size="small"
        items={diskUsage}
        layout="vertical"
      />
      <Button
        variant="faded"
        onPress={openDir}
        className="my-4 justify-between"
        startContent={<OpenFolder_Icon />}
        endContent={<ExternalLink_Icon />}
        fullWidth>
        {installDir}
      </Button>
    </>
  );
}
