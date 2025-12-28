import {TRANSITION_EASINGS} from '@heroui/framer-utils';
import {Avatar, Spinner} from '@heroui/react';
import {AnimatePresence, motion} from 'framer-motion';
import {memo, ReactNode, useEffect, useMemo, useState} from 'react';

import {APP_ICON_TRANSPARENT, PageID} from '../../../../../cross/CrossConstants';
import {TabInfo} from '../../../../../cross/CrossTypes';
import {
  AudioGeneration_Icon,
  GamePad_Icon,
  Home_Icon,
  ImageGeneration_Icon,
  Info_Icon,
  MagicStickDuo_Icon,
  Plugins_Icon,
  Robot_Icon,
  Rocket_Icon,
  Slider_Icon,
  Terminal_Icon,
  TextGeneration_Icon,
  Web_Icon,
} from '../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../RendererIpc';

type Props = {tab: TabInfo; currentView: 'browser' | 'terminal' | undefined};

const iconTransition = {
  initial: {opacity: 0, scale: 0.6},
  animate: {opacity: 1, scale: 1},
  exit: {opacity: 0, scale: 0.6},
  transition: {duration: 0.15, ease: TRANSITION_EASINGS.easeOut},
};

const TabItem_Icon = memo(({tab, currentView}: Props) => {
  const [icon, setIcon] = useState<ReactNode>();

  useEffect(() => {
    const setFavIcon = async () => {
      const {favIcon, pageID, title} = tab;
      const isValidFavIcon = await rendererIpc.utils.isResponseValid(favIcon.url);

      if (favIcon.show && isValidFavIcon) {
        setIcon(
          favIcon ? (
            <Avatar name={title} radius="none" src={favIcon.url} className="size-full bg-transparent" />
          ) : (
            <Web_Icon className="size-full" />
          ),
        );
      } else if (currentView === 'browser') setIcon(<Web_Icon className="size-full" />);
      else if (pageID === PageID.home) setIcon(<Home_Icon className="size-full" />);
      else if (pageID === PageID.imageGen) setIcon(<ImageGeneration_Icon className="size-full" />);
      else if (pageID === PageID.textGen) setIcon(<TextGeneration_Icon className="size-full" />);
      else if (pageID === PageID.audioGen) setIcon(<AudioGeneration_Icon className="size-full" />);
      else if (pageID === PageID.agents) setIcon(<Robot_Icon className="size-full" />);
      else if (pageID === PageID.others) setIcon(<MagicStickDuo_Icon className="size-full" />);
      else if (pageID === PageID.games) setIcon(<GamePad_Icon className="size-full" />);
      else if (pageID === PageID.tools) setIcon(<Rocket_Icon className="size-full" />);
      else if (pageID === PageID.dashboard) setIcon(<Info_Icon className="size-full" />);
      else if (pageID === PageID.plugins) setIcon(<Plugins_Icon className="size-full" />);
      else if (pageID === PageID.settings) setIcon(<Slider_Icon className="size-full" />);
      else setIcon(<Avatar radius="none" className="size-full" src={APP_ICON_TRANSPARENT} />);
    };

    setFavIcon();
  }, [tab]);

  const iconState = useMemo(() => {
    if (tab.isTerminal && currentView === 'terminal') return 'terminal';
    if (tab.isLoading) return 'loading';
    return 'icon';
  }, [tab.isTerminal, tab.isLoading, currentView]);

  return (
    <div className="relative shrink-0 size-4 mb-0.5">
      <AnimatePresence mode="popLayout">
        {iconState === 'terminal' && (
          <motion.div key="terminal" className="absolute inset-0 flex items-center justify-center" {...iconTransition}>
            <Terminal_Icon className="size-full" />
          </motion.div>
        )}
        {iconState === 'loading' && (
          <motion.div key="loading" className="absolute inset-0 flex items-center justify-center" {...iconTransition}>
            <Spinner size="sm" color="primary" variant="gradient" className="scale-80" />
          </motion.div>
        )}
        {iconState === 'icon' && (
          <motion.div key="icon" className="absolute inset-0 flex items-center justify-center" {...iconTransition}>
            {icon}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default TabItem_Icon;
