import {Button, Chip} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import {DownloadItemInfo} from '@lynx_cross/types/download_manager';
import {Broom, DownloadMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {useEffect, useState} from 'react';

import {MenuTypes} from '../../consts';
import {CommonProps} from '../../types';
import DownloadItem from './Item';

export default function DownloadMenu({setSelectedLayout, setWidthSize, show}: CommonProps) {
  const [downloads, setDownloads] = useState<DownloadItemInfo[]>([]);

  const handleClearAll = () => {
    setDownloads([]);
    rendererIpc.downloadManager.clearAll();
  };

  useEffect(() => {
    const OffDownloads = rendererIpc.contextMenu.onDownloads(() => {
      setWidthSize('lg');
      setSelectedLayout(MenuTypes.Downloads);

      rendererIpc.contextMenu.showWindow();
    });

    const offDlStart = rendererIpc.downloadManager.onDlStart((_, info) => {
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
    const offProgress = rendererIpc.downloadManager.onProgress((_, info) => {
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
    const offDone = rendererIpc.downloadManager.onDone((_, info) => {
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
      OffDownloads();
      offDlStart();
      offProgress();
      offDone();
    };
  }, []);

  if (!show) return null;

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
            {downloads.length} items
          </Chip>
          {downloads.length > 0 && (
            <Button size="sm" color="danger" variant="flat" startContent={<Broom />} onPress={handleClearAll}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Download List */}
      <div className={'px-3 py-1 gap-y-2 flex flex-col justify-start max-h-200 overflow-y-auto overflow-x-hidden'}>
        {downloads.map(item => (
          <DownloadItem item={item} key={item.name} setItems={setDownloads} />
        ))}
      </div>
    </div>
  );
}
