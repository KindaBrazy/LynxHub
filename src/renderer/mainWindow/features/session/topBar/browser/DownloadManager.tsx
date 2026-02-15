import {Badge, Button} from '@heroui/react';
import downloadManagerIpc from '@lynx_shared/ipc/downloadManager';
import {DownloadMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
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
        <DownloadMinimalistic className="size-4" />
      </Button>
    </Badge>
  );
}
