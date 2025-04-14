import {Button, Image, Spinner, Tooltip} from '@heroui/react';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {getFavIconUrl, getUrlName} from '../../../../../../cross/CrossUtils';
import {Terminal_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons3';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';

type Props = {type: 'browser' | 'terminal' | 'both'};

export default function EmptyPage({type}: Props) {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();
  const [recentAddress, setRecentAddress] = useState<string[]>([]);

  const switchToTerminal = () => {
    dispatch(cardsActions.setRunningCardView({tabId: activeTab, view: 'terminal'}));
  };

  useEffect(() => {
    rendererIpc.storageUtils.getBrowserRecent().then(setRecentAddress);
  }, []);

  const openRecent = (address: string) => {
    dispatch(cardsActions.setRunningCardCustomAddress({tabId: activeTab, address}));
  };

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

        {recentAddress.length > 0 && (
          <div className="w-full mt-4">
            <h2 className="text-lg font-medium mb-3 mt-8">Recent Addresses</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {recentAddress.slice(0, 8).map((url, index) => (
                <Tooltip radius="sm" key={index} delay={300} content={url} showArrow>
                  <Button variant="flat" onPress={() => openRecent(url)} className="flex-col size-full py-4 shadow-md">
                    <Image radius="full" className="size-8" src={getFavIconUrl(url)} />
                    <span className="truncate text-wrap w-full">{getUrlName(url)}</span>
                  </Button>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
