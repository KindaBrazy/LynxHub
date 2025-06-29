import {Button, Card, CardBody, Image, Tooltip} from '@heroui/react';
import {capitalize} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {formatWebAddress, getUrlName} from '../../../../../../cross/CrossUtils';
import {Trash_Icon, Web_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';

type Props = {
  recent: string;
  setRecentAddress: Dispatch<SetStateAction<string[]>>;
  type: 'recent' | 'favorite';
};

export default function EmptyPage_Item({recent, setRecentAddress, type}: Props) {
  const activeTab = useTabsState('activeTab');
  const [favIcon, setFavIcon] = useState<string>('');

  const dispatch = useDispatch<AppDispatch>();

  const openRecent = () => {
    dispatch(cardsActions.setRunningCardCustomAddress({tabId: activeTab, address: recent}));
  };

  const handleRemove = () => {
    if (type === 'recent') {
      rendererIpc.storageUtils.removeBrowserRecent(recent);
      rendererIpc.storage.get('browser').then(result => {
        setRecentAddress(result.recentAddress);
      });
    } else {
      rendererIpc.storageUtils.removeBrowserFavorite(recent);
      rendererIpc.storage.get('browser').then(result => {
        setRecentAddress(result.favoriteAddress);
      });
    }
  };

  useEffect(() => {
    rendererIpc.storage.get('browser').then(result => {
      const favItem = result.favIcons.find(fav => fav.url === formatWebAddress(recent || ''));
      if (favItem) {
        const setRawUrl = () => {
          setFavIcon(favItem.favIcon);
        };

        const cachedFav = localStorage.getItem(`favicon_${favItem.url}`);
        if (cachedFav) {
          setFavIcon(cachedFav);
        }

        rendererIpc.utils.isResponseValid(favItem.favIcon).then(isValid => {
          if (isValid) {
            rendererIpc.utils
              .getImageAsDataURL(favItem.favIcon)
              .then(result => {
                if (result) {
                  if (result !== cachedFav) {
                    localStorage.setItem(`favicon_${favItem.url}`, result);
                    setFavIcon(result);
                    return;
                  }
                }

                setRawUrl();
              })
              .catch(setRawUrl);
          }
        });
      }
    });
  }, [recent]);

  return (
    <Tooltip radius="sm" delay={300} content={recent} showArrow>
      <Card as="div" shadow="sm" onPress={openRecent} className="w-36 h-32" isPressable>
        <CardBody className={'flex-col gap-2 items-center text-center justify-center group dark:bg-foreground-100'}>
          {favIcon ? <Image radius="full" src={favIcon} className="size-8" /> : <Web_Icon className="size-8" />}
          <span className="truncate text-wrap w-full line-clamp-2 text-sm">{capitalize(getUrlName(recent))}</span>
          <Button
            size="sm"
            color="danger"
            variant="light"
            onPress={handleRemove}
            className="absolute top-1 right-1 cursor-default group-hover:opacity-100 opacity-0"
            isIconOnly>
            <Trash_Icon className="size-3.5" />
          </Button>
        </CardBody>
      </Card>
    </Tooltip>
  );
}
