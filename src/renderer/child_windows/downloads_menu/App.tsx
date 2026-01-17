import {Button, Chip} from '@heroui/react';
import {DownloadItemInfo} from '@lynx_cross/types/download_manager';
import {Broom, DownloadMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useEffect, useState} from 'react';

import rendererIpc from '../../main_window/ipc';
import DownloadItem from './Item';

export default function DownloadMenu() {
  const [downloads, setDownloads] = useState<DownloadItemInfo[]>([]);

  const handleClearAll = () => {
    setDownloads([]);
    rendererIpc.downloadManager.clearAll();
  };

  useEffect(() => {
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
      offDlStart();
      offProgress();
      offDone();
    };
  }, []);

  return (
    <div className="dark:bg-LynxRaisinBlack bg-white absolute inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative px-4 py-4 flex flex-row items-center justify-between">
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
      <OverlayScrollbarsComponent
        options={{
          overflow: {x: 'hidden', y: 'scroll'},
          scrollbars: {
            autoHide: 'leave',
            theme: 'os-theme-light',
          },
        }}
        className="px-4 py-1 gap-y-2 flex flex-col">
        {downloads.map(item => (
          <DownloadItem item={item} key={item.name} setItems={setDownloads} />
        ))}
      </OverlayScrollbarsComponent>
    </div>
  );
}
