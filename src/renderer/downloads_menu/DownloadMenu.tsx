import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useEffect, useState} from 'react';

import {DownloadItemInfo} from '../../cross/DownloadManagerTypes';
import rendererIpc from '../src/App/RendererIpc';
import {DownloadDuo_Icon} from '../src/assets/icons/SvgIcons/SvgIcons';
import DownloadItem from './DownloadItem';

export default function DownloadMenu() {
  const [downloads, setDownloads] = useState<DownloadItemInfo[]>([]);

  useEffect(() => {
    rendererIpc.downloadManager.onDlStart((_, info) => {
      const newItem: DownloadItemInfo = {
        ...info,
        bytesPerSecond: 0,
        etaSecond: 0,
        percent: 0,
        receivedBytes: 0,
        status: 'downloading',
      };
      setDownloads(prevState => [...prevState, newItem]);
    });
    rendererIpc.downloadManager.onProgress((_, info) => {
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
    rendererIpc.downloadManager.onDone((_, info) => {
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
      rendererIpc.downloadManager.offDlStart();
      rendererIpc.downloadManager.offProgress();
      rendererIpc.downloadManager.offDone();
    };
  }, []);

  return (
    <div className="bg-LynxRaisinBlack absolute inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative px-4 py-4 flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <DownloadDuo_Icon className="size-5" />
          Downloads
        </h2>
        <p className="text-sm">{downloads.length} items</p>
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
