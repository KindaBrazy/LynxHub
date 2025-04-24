import {Button, Card, CardBody, Image, Tooltip} from '@heroui/react';
import {capitalize} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {getUrlName} from '../../../../../../cross/CrossUtils';
import {BrowserRecent} from '../../../../../../cross/IpcChannelAndTypes';
import {Trash_Icon, Web_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons3';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';

type Props = {recent: BrowserRecent; setRecentAddress: Dispatch<SetStateAction<BrowserRecent[]>>};

export default function EmptyPage_Item({recent, setRecentAddress}: Props) {
  const activeTab = useTabsState('activeTab');
  const [favIcon, setFavIcon] = useState<string>('');

  const dispatch = useDispatch<AppDispatch>();

  const openRecent = () => {
    dispatch(cardsActions.setRunningCardCustomAddress({tabId: activeTab, address: recent.url}));
  };

  const handleRemove = () => {
    rendererIpc.storageUtils.removeBrowserRecent(recent.url);
    rendererIpc.storageUtils.getBrowserRecent().then(setRecentAddress);
  };

  useEffect(() => {
    rendererIpc.utils.isResponseValid(recent.favIcon).then(isValid => {
      setFavIcon(isValid ? recent.favIcon : '');
    });
  }, [recent]);

  return (
    <Tooltip radius="sm" delay={300} content={recent.url} showArrow>
      <Card shadow="sm" onPress={openRecent} className="w-36 h-32" isPressable>
        <CardBody className={'flex-col gap-2 items-center text-center justify-center group dark:bg-foreground-100'}>
          {favIcon ? <Image radius="full" src={favIcon} className="size-8" /> : <Web_Icon className="size-8" />}
          <span className="truncate text-wrap w-full line-clamp-2 text-sm">{capitalize(getUrlName(recent.url))}</span>
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
