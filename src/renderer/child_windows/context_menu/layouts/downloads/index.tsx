import {Button, Chip} from '@heroui/react';
import {DownloadItemInfo} from '@lynx_cross/types/download_manager';
import downloadManagerIpc from '@lynx_shared/ipc/download_manager';
import {Broom, DownloadMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useEffect, useState} from 'react';

import DownloadItem from './Item';

const DownloadMenu = memo(() => {
  const [downloads, setDownloads] = useState<DownloadItemInfo[]>([]);

  const handleClearAll = () => {
    setDownloads([]);
    downloadManagerIpc.send.clearAll();
  };

  useEffect(() => {
    const offDlStart = downloadManagerIpc.on.dlStart(info => {
      const newItem: DownloadItemInfo = {
        ...info,
        bytesPerSecond: 0,
        etaSecond: 0,
        percent: 0,
        receivedBytes: 0,
        status: 'downloading',
      };
      setDownloads(prevState => [newItem, ...prevState]);
    });
    const offProgress = downloadManagerIpc.on.progress(info => {
      setDownloads(prevState =>
        prevState.map(item =>
          item.name !== info.name
            ? item
            : {
                ...item,
                ...info,
              },
        ),
      );
    });
    const offDone = downloadManagerIpc.on.done(info => {
      setDownloads(prevState =>
        prevState.map(item =>
          item.name !== info.name
            ? item
            : {
                ...item,
                status: info.state === 'interrupted' ? 'cancelled' : info.state,
              },
        ),
      );
    });

    return () => {
      offDlStart();
      offProgress();
      offDone();
    };
  }, []);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <DownloadMinimalistic className="size-5" />
          Downloads
        </h2>
        <div className="flex items-center gap-3">
          <Chip size="sm" variant="flat">
            {downloads.length} {downloads.length > 1 ? 'items' : 'item'}
          </Chip>
          {downloads.length > 0 && (
            <Button size="sm" color="danger" variant="flat" startContent={<Broom />} onPress={handleClearAll}>
              Cancel & Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Download List */}
      <div className={'px-3 py-1 pb-4 gap-y-2 flex flex-col justify-start max-h-200 overflow-y-auto overflow-x-hidden'}>
        {downloads.map(item => (
          <DownloadItem item={item} key={item.name} setItems={setDownloads} />
        ))}
      </div>
    </div>
  );
});

export default DownloadMenu;
