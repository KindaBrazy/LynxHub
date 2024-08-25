import {Descriptions, DescriptionsProps} from 'antd';
import {useCallback, useMemo} from 'react';

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
      {
        key: 'installPath',
        label: 'Installation Path',
        children: installDir ? (
          <span onClick={openDir} className="cursor-pointer transition-colors duration-300 hover:text-secondary-500">
            {installDir}
          </span>
        ) : (
          progressElem('')
        ),
      },
    ];

    if (supportExtensions) {
      items.splice(1, 0, {
        key: 'extensionsSize',
        label: 'Extensions Size',
        children: extensionsSize ? <span>{extensionsSize}</span> : progressElem('Calculating...'),
      });
    }

    return items;
  }, [totalSize, installDir, extensionsSize, supportExtensions, openDir]);

  return <Descriptions column={2} size="small" items={diskUsage} layout="vertical" title="Disk Usage" />;
}
