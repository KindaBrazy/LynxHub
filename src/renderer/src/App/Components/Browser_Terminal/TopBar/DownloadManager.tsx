import {Badge, Button} from '@heroui/react';
import {useEffect, useState} from 'react';

import {DownloadDuo_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../RendererIpc';

export default function DownloadManager() {
  const [itemCount, setItemCount] = useState<number>(0);

  useEffect(() => {
    const offDownloadCount = rendererIpc.downloadManager.onDownloadCount((_, count) => {
      setItemCount(count);
    });

    return () => offDownloadCount();
  }, []);

  const openDownloadsWindow = () => rendererIpc.downloadManager.openMenu();

  if (itemCount === 0) return null;

  return (
    <Badge
      size="sm"
      color="success"
      variant="solid"
      content={itemCount}
      placement="bottom-right"
      className="border-0 mr-1.5 mb-1.5 scale-75">
      <Button size="sm" variant="light" className="cursor-default" onPress={openDownloadsWindow} isIconOnly>
        <DownloadDuo_Icon className="-rotate-901 size-4" />
      </Button>
    </Badge>
  );
}
