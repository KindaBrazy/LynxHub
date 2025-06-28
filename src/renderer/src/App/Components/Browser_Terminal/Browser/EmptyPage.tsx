import {Button, Spinner} from '@heroui/react';
import {Empty} from 'antd';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {BrowserRecent} from '../../../../../../cross/IpcChannelAndTypes';
import {Star_Icon, Terminal_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {History_Color_Icon} from '../../../../assets/icons/SvgIcons/SvgIconsColor';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import EmptyPage_Item from './EmptyPage_Item';

type Props = {type: 'browser' | 'terminal' | 'both'};

export default function EmptyPage({type}: Props) {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();
  const [recentAddress, setRecentAddress] = useState<BrowserRecent[]>([]);
  const [favoriteAddress, setFavoriteAddress] = useState<BrowserRecent[]>([]);

  const switchToTerminal = () => {
    dispatch(cardsActions.setRunningCardView({tabId: activeTab, view: 'terminal'}));
  };

  useEffect(() => {
    rendererIpc.storageUtils.getBrowserRecent().then(setRecentAddress);
    rendererIpc.storage.get('browser').then(result => {
      setFavoriteAddress(result.favoriteAddress);
    });
  }, []);

  return (
    <div className="size-full flex items-center justify-center overflow-scroll scrollbar-hide">
      <div className="max-w-2xl w-full px-6 flex flex-col items-center">
        {type === 'both' && (
          <>
            <div className="mb-10 flex flex-col items-center mt-16">
              <Spinner size="lg" variant="wave" color="secondary" classNames={{label: 'mt-2 text-xl font-bold'}}>
                Waiting for terminal to catch webui address...
              </Spinner>
            </div>

            <Button
              variant="flat"
              color="primary"
              onPress={switchToTerminal}
              className="size-full h-24 transition duration-500 flex-col shadow-lg">
              <Terminal_Icon className="size-6" />
              Switch to Terminal
            </Button>
          </>
        )}

        {favoriteAddress.length > 0 ? (
          <div className="w-full mt-4">
            <div className="flex flex-row items-center mb-3 mt-8 gap-x-2">
              <Star_Icon className="text-yellow-400" />
              <h2 className="text-lg font-medium">Favorites</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {favoriteAddress.slice(0, 8).map((recent, index) => (
                <EmptyPage_Item key={index} recent={recent} type="favorite" setRecentAddress={setFavoriteAddress} />
              ))}
            </div>
          </div>
        ) : (
          <Empty className="w-full" description="No Favorites" />
        )}

        {recentAddress.length > 0 ? (
          <div className="w-full mt-4">
            <div className="flex flex-row items-center mb-3 mt-8 gap-x-2">
              <History_Color_Icon />
              <h2 className="text-lg font-medium">Recent Addresses</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {recentAddress.slice(0, 8).map((recent, index) => (
                <EmptyPage_Item key={index} type="recent" recent={recent} setRecentAddress={setRecentAddress} />
              ))}
            </div>
          </div>
        ) : (
          <Empty className="w-full" description="No recent addresses" />
        )}
      </div>
    </div>
  );
}
