import {Avatar, Spinner} from '@heroui/react';
import {ReactNode, useEffect, useState} from 'react';

import {APP_ICON_TRANSPARENT} from '../../../../../cross/CrossConstants';
import {TabInfo} from '../../../../../cross/CrossTypes';
import {AudioGeneration_Icon, Extensions_Icon, Extensions2_Icon} from '../../../assets/icons/SvgIcons/SvgIcons1';
import {Home_Icon, ImageGeneration_Icon, Info_Icon} from '../../../assets/icons/SvgIcons/SvgIcons2';
import {Terminal_Icon, TextGeneration_Icon, Web_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import {Slider_Icon} from '../../../assets/icons/SvgIcons/SvgIcons4';
import {GamePad_Icon, Rocket_Icon} from '../../../assets/icons/SvgIcons/SvgIcons5';
import {useCardsState} from '../../Redux/Reducer/CardsReducer';
import rendererIpc from '../../RendererIpc';
import {PageID} from '../../Utils/Constants';

type Props = {tab: TabInfo};

export default function TabItem_Icon({tab}: Props) {
  const runningCards = useCardsState('runningCard');
  const [icon, setIcon] = useState<ReactNode>();

  useEffect(() => {
    const setFavIcon = async () => {
      const {favIcon, pageID, id, title} = tab;
      const currentView = runningCards.find(card => card.tabId === id)?.currentView;
      const isValidFavIcon = await rendererIpc.utils.isResponseValid(favIcon.url);

      if (favIcon.show && isValidFavIcon) {
        setIcon(
          favIcon ? (
            <Avatar name={title} src={favIcon.url} className="size-full" />
          ) : (
            <Web_Icon className="size-full" />
          ),
        );
      } else if (currentView === 'browser') setIcon(<Web_Icon className="size-full" />);
      else if (pageID === PageID.home) setIcon(<Home_Icon className="size-full" />);
      else if (pageID === PageID.imageGen) setIcon(<ImageGeneration_Icon className="size-full" />);
      else if (pageID === PageID.textGen) setIcon(<TextGeneration_Icon className="size-full" />);
      else if (pageID === PageID.audioGen) setIcon(<AudioGeneration_Icon className="size-full" />);
      else if (pageID === PageID.games) setIcon(<GamePad_Icon className="size-full" />);
      else if (pageID === PageID.tools) setIcon(<Rocket_Icon className="size-full" />);
      else if (pageID === PageID.dashboard) setIcon(<Info_Icon className="size-full" />);
      else if (pageID === PageID.modules) setIcon(<Extensions2_Icon className="size-full" />);
      else if (pageID === PageID.extensions) setIcon(<Extensions_Icon className="size-full" />);
      else if (pageID === PageID.settings) setIcon(<Slider_Icon className="size-full" />);
      else setIcon(<Avatar radius="none" className="size-full" src={APP_ICON_TRANSPARENT} />);
    };

    setFavIcon();
  }, [tab]);

  return (
    <>
      {tab.isTerminal ? (
        <Terminal_Icon className="shrink-0 mb-0.5" />
      ) : tab.isLoading ? (
        <Spinner size="sm" color="primary" variant="simple" className="scale-80 mb-0.5" />
      ) : (
        <div className="shrink-0 size-4 content-center mb-0.5">{icon}</div>
      )}
    </>
  );
}
