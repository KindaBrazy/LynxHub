import {Button, Card, CardBody, Image, Tooltip} from '@heroui/react';
import {cardsActions} from '@lynx/redux/reducers/cards';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {FavIcons} from '@lynx_common/types/ipc';
import {formatWebAddress, getCacheUrl, getUrlName} from '@lynx_common/utils';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {Earth, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useCallback, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

type Props = {
  recent: string;
  type: 'recent' | 'favorite';
  favIconMap: Map<string, FavIcons>;
  onDataChange: () => void;
};

const HistoryItem = memo(({recent, type, favIconMap, onDataChange}: Props) => {
  const activeTab = useTabsState('activeTab');
  const [imgError, setImgError] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // Get favicon from the map passed by parent (no IPC call needed)
  const favItem = useMemo(() => favIconMap.get(formatWebAddress(recent)), [favIconMap, recent]);

  const favIcon = getCacheUrl(favItem?.favIcon);
  const displayName = favItem?.title || getUrlName(recent);

  const openRecent = useCallback(() => {
    dispatch(cardsActions.setRunningCardCustomAddress({tabId: activeTab, address: recent}));
  }, [dispatch, activeTab, recent]);

  const handleRemove = useCallback(() => {
    if (type === 'recent') {
      storageUtilsIpc.send.removeBrowserRecent(recent);
    } else {
      storageUtilsIpc.send.removeBrowserFavorite(recent);
    }
    // Notify parent to refresh data (single IPC call for all items)
    onDataChange();
  }, [type, recent, onDataChange]);

  return (
    <Tooltip radius="sm" delay={300} content={favItem?.title || recent} showArrow>
      <Card shadow="sm" onPress={openRecent} className="h-32 w-36" isPressable>
        <CardBody
          className={
            'group flex-col items-center justify-center gap-2 shrink-0 text-center transition-colors duration-300' +
            ' hover:bg-foreground-100/50 dark:bg-foreground-100 hover:dark:bg-foreground-100/50'
          }>
          {favIcon && !imgError ? (
            <Image alt="" radius="full" src={favIcon} className="size-8" onError={() => setImgError(true)} />
          ) : (
            <Earth className="size-8" />
          )}
          <span className="w-full truncate text-wrap line-clamp-2 text-sm">{displayName}</span>
          <Button
            size="sm"
            color="danger"
            variant="light"
            onPress={handleRemove}
            className="absolute top-1 right-1 cursor-default opacity-0 group-hover:opacity-100"
            isIconOnly>
            <TrashBin2 className="size-3.5" />
          </Button>
        </CardBody>
      </Card>
    </Tooltip>
  );
});

export default HistoryItem;
