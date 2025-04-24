import {Button, Card, CardBody, Image, Tooltip} from '@heroui/react';
import {capitalize} from 'lodash';
import {Dispatch, SetStateAction} from 'react';
import {useDispatch} from 'react-redux';

import {getFavIconUrl, getUrlName} from '../../../../../../cross/CrossUtils';
import {Trash_Icon, Web_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons3';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {useCachedImageUrl} from '../../../Utils/LocalStorage';

type Props = {url: string; setRecentAddress: Dispatch<SetStateAction<string[]>>};

export default function EmptyPage_Item({url, setRecentAddress}: Props) {
  const activeTab = useTabsState('activeTab');

  const dispatch = useDispatch<AppDispatch>();

  const openRecent = (address: string) => {
    dispatch(cardsActions.setRunningCardCustomAddress({tabId: activeTab, address}));
  };

  const handleRemove = (url: string) => {
    rendererIpc.storageUtils.removeBrowserRecent(url);
    rendererIpc.storageUtils.getBrowserRecent().then(setRecentAddress);
  };

  const favIcon = useCachedImageUrl(`${url}_favicon`, getFavIconUrl(url));

  return (
    <Tooltip radius="sm" delay={300} content={url} showArrow>
      <Card shadow="sm" className="w-36 h-32" onPress={() => openRecent(url)} isPressable>
        <CardBody className={'flex-col gap-2 items-center text-center justify-center group dark:bg-foreground-100'}>
          {favIcon ? <Image radius="full" src={favIcon} className="size-8" /> : <Web_Icon className="size-8" />}
          <span className="truncate text-wrap w-full line-clamp-2 text-sm">{capitalize(getUrlName(url))}</span>
          <Button
            size="sm"
            color="danger"
            variant="light"
            onPress={() => handleRemove(url)}
            className="absolute top-1 right-1 cursor-default group-hover:opacity-100 opacity-0"
            isIconOnly>
            <Trash_Icon className="size-3.5" />
          </Button>
        </CardBody>
      </Card>
    </Tooltip>
  );
}
