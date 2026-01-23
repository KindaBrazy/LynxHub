import {Badge, Button} from '@heroui/react';
import {DownloadDuo_Icon} from '@lynx_assets/icons';
import downloadManagerIpc from '@lynx_shared/ipc/download_manager';
import {useEffect, useState} from 'react';

export default function DownloadManager() {
  const [itemCount, setItemCount] = useState<number>(0);

  useEffect(() => {
    const offDownloadCount = downloadManagerIpc.on.downloadCount(count => {
      setItemCount(count);
    });

    return () => offDownloadCount();
  }, []);

  const openDownloadsWindow = () => downloadManagerIpc.send.openMenu();

  if (itemCount === 0) return null;

  return (
    <Badge
      size="sm"
      color="success"
      variant="solid"
      content={itemCount}
      placement="bottom-right"
      className="border-0 mr-1.5 mb-1.5 scale-75 pointer-events-none">
      <Button size="sm" variant="light" className="cursor-default" onPress={openDownloadsWindow} isIconOnly>
        <DownloadDuo_Icon className="size-4" />
      </Button>
    </Badge>
  );
}
