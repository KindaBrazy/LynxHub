import {Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Progress} from '@heroui/react';
import {Dispatch, SetStateAction} from 'react';

import {DownloadItemInfo} from '../../cross/DownloadManagerTypes';
import rendererIpc from '../src/App/RendererIpc';
import {
  Clock_Icon,
  CloseSimple_Icon,
  File_Icon,
  OpenFolder_Icon,
  Pause_Icon,
  Play_Icon,
} from '../src/assets/icons/SvgIcons/SvgIcons';
import {formatBytes, formatETA, formatSpeed, getProgress, getStatusColor, getStatusIcon} from './UtilMethods';

type Props = {
  item: DownloadItemInfo;
  setItems: Dispatch<SetStateAction<DownloadItemInfo[]>>;
};

export default function DownloadItem({item, setItems}: Props) {
  const handleAction = (name: string, action: 'pause' | 'resume' | 'cancel' | 'open' | 'openFolder') => {
    if (action === 'open' || action === 'openFolder') {
      rendererIpc.downloadManager.openItem(name, action);
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
            <div className="flex items-center gap-2 mb-1 justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</h3>
              {getStatusIcon(item.status)}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>
                {formatBytes(item.receivedBytes)} / {formatBytes(item.totalBytes)}
              </span>
              {item.status === 'downloading' && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock_Icon className="w-3 h-3" />
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
                startContent={<File_Icon className="size-3" />}
                fullWidth>
                Open File
              </Button>

              <Button
                onPress={() => {
                  handleAction(item.name, 'openFolder');
                }}
                color="success"
                startContent={<OpenFolder_Icon className="size-3" />}
                fullWidth>
                Open Path
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
                  startContent={<Pause_Icon className="size-3" />}>
                  Pause
                </Button>
              ) : item.status === 'paused' ? (
                <Button
                  onPress={() => {
                    handleAction(item.name, 'resume');
                  }}
                  color="primary"
                  startContent={<Play_Icon className="size-3" />}>
                  Resume
                </Button>
              ) : null}

              <Button
                onPress={() => {
                  handleAction(item.name, 'cancel');
                }}
                color="danger"
                startContent={<CloseSimple_Icon className="size-3" />}
                className={`${(item.status === 'downloading' || item.status === 'paused') && 'max-w-24'}`}>
                Cancel
              </Button>
            </>
          )}
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
