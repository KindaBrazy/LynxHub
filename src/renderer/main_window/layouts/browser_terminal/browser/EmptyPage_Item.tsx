import {Button, Card, CardBody, Image, Tooltip} from '@heroui/react';
import {FavIcons} from '@lynx_cross/types/ipc';
import {formatWebAddress, getCacheUrl, getUrlName} from '@lynx_cross/utils';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Web_Icon} from '../../../../shared/assets/icons';
import {cardsActions} from '../../../redux/reducers/cards';
import {useTabsState} from '../../../redux/reducers/tabs';
import {AppDispatch} from '../../../redux/store';

type Props = {
  recent: string;
  type: 'recent' | 'favorite';
  favIconMap: Map<string, FavIcons>;
  onDataChange: () => void;
};

export default function EmptyPage_Item({recent, type, favIconMap, onDataChange}: Props) {
  const activeTab = useTabsState('activeTab');
  const [imgError, setImgError] = useState(false);

  // Get favicon from the map passed by parent (no IPC call needed)
  const favItem = useMemo(() => favIconMap.get(formatWebAddress(recent)), [favIconMap, recent]);

  const favIcon = getCacheUrl(favItem?.favIcon);
  const displayName = favItem?.title || getUrlName(recent);

  const dispatch = useDispatch<AppDispatch>();

  const openRecent = () => {
    dispatch(cardsActions.setRunningCardCustomAddress({tabId: activeTab, address: recent}));
  };

  const handleRemove = () => {
    if (type === 'recent') {
      storageUtilsIpc.send.removeBrowserRecent(recent);
    } else {
      storageUtilsIpc.send.removeBrowserFavorite(recent);
    }
    // Notify parent to refresh data (single IPC call for all items)
    onDataChange();
  };

  return (
    <Tooltip radius="sm" delay={300} content={favItem?.title || recent} showArrow>
      <Card as="div" shadow="sm" onPress={openRecent} className="w-36 h-32" isPressable>
        <CardBody
          className={
            'flex-col gap-2 items-center text-center justify-center transition-colors duration-300' +
            ' group dark:bg-foreground-100 hover:dark:bg-foreground-100/50 shrink-0 hover:bg-foreground-100/50'
          }>
          {favIcon && !imgError ? (
            <Image alt="" radius="full" src={favIcon} className="size-8" onError={() => setImgError(true)} />
          ) : (
            <Web_Icon className="size-8" />
          )}
          <span className="truncate text-wrap w-full line-clamp-2 text-sm">{displayName}</span>
          <Button
            size="sm"
            color="danger"
            variant="light"
            onPress={handleRemove}
            className="absolute top-1 right-1 cursor-default group-hover:opacity-100 opacity-0"
            isIconOnly>
            <TrashBin2 className="size-3.5" />
          </Button>
        </CardBody>
      </Card>
    </Tooltip>
  );
}
