import {Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Progress, Tooltip} from '@heroui/react';
import {DownloadItemInfo} from '@lynx_common/types/downloadManager';
import downloadManagerIpc from '@lynx_shared/ipc/downloadManager';
import {Pause, Play, Restart} from '@solar-icons/react-perf/Bold';
import {FileDownload, FolderOpen, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {X} from 'lucide-react';
import {memo, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {contextActions} from '../../redux/reducer';
import {formatBytes, formatETA, formatSpeed, getProgress, getStatusColor} from './utils';

type DownloadItemProps = {
  item: DownloadItemInfo;
};

/**
 * DownloadItem component displays a single download item with progress and actions.
 */
const DownloadItem = memo(({item}: DownloadItemProps) => {
  const dispatch = useDispatch();

  const handleAction = useCallback(
    (name: string, action: 'pause' | 'resume' | 'cancel' | 'open' | 'openFolder' | 'clear') => {
      switch (action) {
        case 'open':
        case 'openFolder':
          downloadManagerIpc.send.openItem(name, action);
          break;
        case 'clear':
          dispatch(contextActions.removeDownload(name));
          downloadManagerIpc.send.clear(name);
          break;
        case 'pause':
          downloadManagerIpc.send.pause(name);
          dispatch(contextActions.updateDownloadProgress({name, status: 'paused', bytesPerSecond: 0}));
          break;
        case 'resume':
          downloadManagerIpc.send.resume(name);
          dispatch(contextActions.updateDownloadProgress({name, status: 'downloading', bytesPerSecond: 524288})); // Why 524288?
          break;
        case 'cancel':
          downloadManagerIpc.send.cancel(name);
          dispatch(contextActions.updateDownloadProgress({name, status: 'cancelled', bytesPerSecond: 0}));
          break;
      }
    },
    [dispatch],
  );

  const onOpen = useCallback(() => handleAction(item.name, 'open'), [item.name, handleAction]);
  const onOpenFolder = useCallback(() => handleAction(item.name, 'openFolder'), [item.name, handleAction]);
  const onClear = useCallback(() => handleAction(item.name, 'clear'), [item.name, handleAction]);
  const onPause = useCallback(() => handleAction(item.name, 'pause'), [item.name, handleAction]);
  const onResume = useCallback(() => handleAction(item.name, 'resume'), [item.name, handleAction]);
  const onCancel = useCallback(() => handleAction(item.name, 'cancel'), [item.name, handleAction]);

  return (
    <Card as="div" className="cursor-default bg-foreground-100 shadow-sm shrink-0" fullWidth isPressable>
      <CardHeader className="pb-1">
        {/* Item Header */}
        <div className="flex items-start justify-between w-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <Tooltip size="sm" delay={300} content={item.name} className="max-w-[90%]" showArrow>
                <span className="font-medium text-sm truncate">{item.name}</span>
              </Tooltip>
              {item.status === 'completed' && (
                <span className="font-medium text-xs truncate shrink-0 ml-2">{formatBytes(item.totalBytes)}</span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {item.status !== 'completed' && (
        <CardBody className="py-1">
          {/* Progress Bar */}
          <Progress
            label={
              <div className="flex flex-row gap-x-2 items-center">
                <span>
                  {formatBytes(item.receivedBytes)} / {formatBytes(item.totalBytes)}
                </span>
                {item.status === 'downloading' && (
                  <>
                    <span>|</span>
                    {formatSpeed(item.bytesPerSecond)}

                    <span>|</span>
                    {formatETA(item.totalBytes, item.receivedBytes, item.bytesPerSecond)}
                  </>
                )}
              </div>
            }
            size="sm"
            aria-label="Downloading..."
            color={getStatusColor(item.status)}
            classNames={{label: 'text-xs', value: 'text-xs'}}
            value={getProgress(item.receivedBytes, item.totalBytes)}
            showValueLabel
          />
        </CardBody>
      )}

      <CardFooter className="pt-1 pb-2">
        {/* Action Buttons */}
        <ButtonGroup size="sm" variant="flat" className="flex" fullWidth>
          {item.status === 'completed' ? (
            <>
              <Button color="success" onPress={onOpen} startContent={<FileDownload className="size-3.5" />} fullWidth>
                Open File
              </Button>

              <Button
                color="success"
                onPress={onOpenFolder}
                startContent={<FolderOpen className="size-3.5" />}
                fullWidth>
                Open Path
              </Button>

              <Button color="default" onPress={onClear} startContent={<TrashBin2 className="size-3.5" />} fullWidth>
                Clear
              </Button>
            </>
          ) : (
            <>
              {item.status === 'downloading' ? (
                <Button color="warning" onPress={onPause} startContent={<Pause className="size-3.5" />}>
                  Pause
                </Button>
              ) : item.status === 'paused' ? (
                <Button color="primary" onPress={onResume} startContent={<Play className="size-3.5" />}>
                  Resume
                </Button>
              ) : null}

              {item.status === 'cancelled' && item.receivedBytes > 0 ? (
                // Show both clear and retry for cancelled downloads with partial progress
                <>
                  <Button color="primary" onPress={onResume} startContent={<Restart className="size-3.5" />} fullWidth>
                    Retry
                  </Button>
                  <Button color="default" onPress={onClear} startContent={<TrashBin2 className="size-3.5" />} fullWidth>
                    Clear
                  </Button>
                </>
              ) : item.status === 'cancelled' ? (
                <Button color="default" onPress={onClear} startContent={<TrashBin2 className="size-3.5" />} fullWidth>
                  Clear
                </Button>
              ) : (
                <Button
                  color="danger"
                  onPress={onCancel}
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
});

export default DownloadItem;
