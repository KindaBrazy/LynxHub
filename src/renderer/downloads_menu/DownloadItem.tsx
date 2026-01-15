import {Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Progress} from '@heroui/react';
import {Pause, Play, Restart} from '@solar-icons/react-perf/Bold';
import {ClockCircle, FileDownload, FolderOpen, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {X} from 'lucide-react';
import {Dispatch, SetStateAction} from 'react';

import {DownloadItemInfo} from '../../cross/DownloadManagerTypes';
import rendererIpc from '../src/App/RendererIpc';
import {formatBytes, formatETA, formatSpeed, getProgress, getStatusColor} from './UtilMethods';

type Props = {
  item: DownloadItemInfo;
  setItems: Dispatch<SetStateAction<DownloadItemInfo[]>>;
};

export default function DownloadItem({item, setItems}: Props) {
  const handleAction = (name: string, action: 'pause' | 'resume' | 'cancel' | 'open' | 'openFolder' | 'clear') => {
    if (action === 'open' || action === 'openFolder') {
      rendererIpc.downloadManager.openItem(name, action);
    } else if (action === 'clear') {
      setItems(prev => prev.filter(download => download.name !== name));
      rendererIpc.downloadManager.clear(name);
    } else {
      setItems(prev =>
        prev.map(download => {
          if (download.name === name) {
            switch (action) {
              case 'pause':
                rendererIpc.downloadManager.pause(name);
                return {...download, status: 'paused' as const, bytesPerSecond: 0};
              case 'resume':
                rendererIpc.downloadManager.resume(name);
                return {...download, status: 'downloading' as const, bytesPerSecond: 524288};
              case 'cancel':
                rendererIpc.downloadManager.cancel(name);
                return {...download, status: 'cancelled' as const, bytesPerSecond: 0};
              default:
                return download;
            }
          }
          return download;
        }),
      );
    }
  };

  return (
    <Card as="div" className="cursor-default mb-3 bg-foreground-100" fullWidth isPressable>
      <CardHeader className={'pb-1'}>
        {/* Item Header */}
        <div className="flex items-start justify-between w-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>
                {formatBytes(item.receivedBytes)} / {formatBytes(item.totalBytes)}
              </span>
              {item.status === 'downloading' && (
                <>
                  <span>|</span>
                  <span className="flex items-center gap-1">
                    <ClockCircle className="size-3.5" />
                    {formatETA(item.totalBytes, item.receivedBytes, item.bytesPerSecond)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className="py-1">
        {/* Progress Bar */}
        <Progress
          size="sm"
          aria-label={'Downloading...'}
          color={getStatusColor(item.status)}
          classNames={{label: 'text-xs', value: 'text-xs'}}
          value={getProgress(item.receivedBytes, item.totalBytes)}
          label={item.status === 'downloading' && formatSpeed(item.bytesPerSecond)}
          showValueLabel
        />
      </CardBody>

      <CardFooter className="py-2">
        {/* Action Buttons */}
        <ButtonGroup size="sm" variant="flat" className="flex" fullWidth>
          {item.status === 'completed' ? (
            <>
              <Button
                onPress={() => {
                  handleAction(item.name, 'open');
                }}
                color="success"
                startContent={<FileDownload className="size-3.5" />}
                fullWidth>
                Open File
              </Button>

              <Button
                onPress={() => {
                  handleAction(item.name, 'openFolder');
                }}
                color="success"
                startContent={<FolderOpen className="size-3.5" />}
                fullWidth>
                Open Path
              </Button>

              <Button
                onPress={() => {
                  handleAction(item.name, 'clear');
                }}
                color="default"
                startContent={<TrashBin2 className="size-3.5" />}
                fullWidth>
                Clear
              </Button>
            </>
          ) : (
            <>
              {item.status === 'downloading' ? (
                <Button
                  onPress={() => {
                    handleAction(item.name, 'pause');
                  }}
                  color="warning"
                  startContent={<Pause className="size-3.5" />}>
                  Pause
                </Button>
              ) : item.status === 'paused' ? (
                <Button
                  onPress={() => {
                    handleAction(item.name, 'resume');
                  }}
                  color="primary"
                  startContent={<Play className="size-3.5" />}>
                  Resume
                </Button>
              ) : null}

              {item.status === 'cancelled' && item.receivedBytes > 0 ? (
                // Show both clear and retry for cancelled downloads with partial progress
                <>
                  <Button
                    onPress={() => {
                      handleAction(item.name, 'resume');
                    }}
                    color="primary"
                    startContent={<Restart className="size-3.5" />}
                    fullWidth>
                    Retry
                  </Button>
                  <Button
                    onPress={() => {
                      handleAction(item.name, 'clear');
                    }}
                    color="default"
                    startContent={<TrashBin2 className="size-3.5" />}
                    fullWidth>
                    Clear
                  </Button>
                </>
              ) : item.status === 'cancelled' ? (
                <Button
                  onPress={() => {
                    handleAction(item.name, 'clear');
                  }}
                  color="default"
                  startContent={<TrashBin2 className="size-3.5" />}
                  fullWidth>
                  Clear
                </Button>
              ) : (
                <Button
                  onPress={() => {
                    handleAction(item.name, 'cancel');
                  }}
                  color="danger"
                  startContent={<X className="size-3.5" />}
                  className={`${(item.status === 'downloading' || item.status === 'paused') && 'max-w-24'}`}>
                  Cancel
                </Button>
              )}
            </>
          )}
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
