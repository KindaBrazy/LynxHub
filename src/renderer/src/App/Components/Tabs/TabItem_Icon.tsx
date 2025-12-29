import {TRANSITION_EASINGS} from '@heroui/framer-utils';
import {Avatar, Spinner} from '@heroui/react';
import {AnimatePresence, motion} from 'framer-motion';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';

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

type Props = {tab: TabInfo; currentView: 'browser' | 'terminal' | undefined};

const iconTransition = {
  initial: {opacity: 0, scale: 0.6},
  animate: {opacity: 1, scale: 1},
  exit: {opacity: 0, scale: 0.6},
  transition: {duration: 0.15, ease: TRANSITION_EASINGS.easeOut},
};

/** Returns the cached favicon URL using lynxcache:// protocol */
const getCachedFavIconUrl = (url: string) => (url ? `lynxcache://fetch/${encodeURIComponent(url)}` : '');

const TabItem_Icon = memo(({tab, currentView}: Props) => {
  const [imgError, setImgError] = useState(false);
  const favIconUrl = tab.favIcon.url;

  // Reset error state when favicon URL changes
  useEffect(() => {
    setImgError(false);
  }, [favIconUrl]);

  const handleImgError = useCallback(() => setImgError(true), []);

  const icon = useMemo(() => {
    const {favIcon, pageID, title} = tab;

    // Use lynxcache:// protocol for favicon caching, fallback to Web_Icon on error
    if (favIcon.show && favIcon.url && !imgError) {
      return (
        <Avatar
          name={title}
          radius="none"
          className="size-full bg-transparent"
          src={getCachedFavIconUrl(favIcon.url)}
          ImgComponent={props => <img alt="" {...props} onError={handleImgError} />}
        />
      );
    }
    if (currentView === 'browser') return <Web_Icon className="size-full" />;
    if (pageID === PageID.home) return <Home_Icon className="size-full" />;
    if (pageID === PageID.imageGen) return <ImageGeneration_Icon className="size-full" />;
    if (pageID === PageID.textGen) return <TextGeneration_Icon className="size-full" />;
    if (pageID === PageID.audioGen) return <AudioGeneration_Icon className="size-full" />;
    if (pageID === PageID.agents) return <Robot_Icon className="size-full" />;
    if (pageID === PageID.others) return <MagicStickDuo_Icon className="size-full" />;
    if (pageID === PageID.games) return <GamePad_Icon className="size-full" />;
    if (pageID === PageID.tools) return <Rocket_Icon className="size-full" />;
    if (pageID === PageID.dashboard) return <Info_Icon className="size-full" />;
    if (pageID === PageID.plugins) return <Plugins_Icon className="size-full" />;
    if (pageID === PageID.settings) return <Slider_Icon className="size-full" />;
    return <Avatar radius="none" className="size-full" src={APP_ICON_TRANSPARENT} />;
  }, [tab, currentView, imgError, handleImgError]);

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
