import {Avatar, Spinner} from '@heroui/react';
import {memo, ReactNode, useEffect, useState} from 'react';

import {APP_ICON_TRANSPARENT, PageID} from '../../../../../cross/CrossConstants';
import {TabInfo} from '../../../../../cross/CrossTypes';
import {
  AudioGeneration_Icon,
  GamePad_Icon,
  Home_Icon,
  ImageGeneration_Icon,
  Info_Icon,
  Plugins_Icon,
  Rocket_Icon,
  Slider_Icon,
  Terminal_Icon,
  TextGeneration_Icon,
  Web_Icon,
} from '../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../RendererIpc';

type Props = {tab: TabInfo; currentView: 'browser' | 'terminal' | undefined};

const TabItem_Icon = memo(({tab, currentView}: Props) => {
  const [icon, setIcon] = useState<ReactNode>();

  useEffect(() => {
    const setFavIcon = async () => {
      const {favIcon, pageID, title} = tab;
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
      else if (pageID === PageID.plugins) setIcon(<Plugins_Icon className="size-full" />);
      else if (pageID === PageID.settings) setIcon(<Slider_Icon className="size-full" />);
      else setIcon(<Avatar radius="none" className="size-full" src={APP_ICON_TRANSPARENT} />);
    };

    setFavIcon();
  }, [tab]);

  return (
    <>
      {tab.isTerminal && currentView === 'terminal' ? (
        <Terminal_Icon className="shrink-0 mb-0.5" />
      ) : tab.isLoading ? (
        <Spinner size="sm" color="primary" variant="simple" className="scale-80 mb-0.5" />
      ) : (
        <div className="shrink-0 size-4 content-center mb-0.5">{icon}</div>
      )}
    </>
  );
});

export default TabItem_Icon;
