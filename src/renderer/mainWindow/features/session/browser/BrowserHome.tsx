import {Button, Spinner} from '@heroui/react';
import LynxScroll from '@lynx/components/LynxScroll';
import {cardsActions} from '@lynx/redux/reducers/cards';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {Terminal_Icon} from '@lynx_assets/icons';
import {History_Color_Icon} from '@lynx_assets/icons/Icons_Colorful';
import {FavIcons} from '@lynx_common/types/ipc';
import {Star} from '@solar-icons/react-perf/Bold';
import {AnimatePresence, motion} from 'framer-motion';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {triggerActions, useTriggerState} from '../../../redux/reducers/triggers';
import HistorySection from './HistorySection';
import {getCachedHistoryData} from './utils';

type Props = {type: 'browser' | 'terminal' | 'both'};

const fadeIn = {
  hidden: {opacity: 0},
  visible: {opacity: 1, transition: {duration: 0.2}},
};

const staggerContainer = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {staggerChildren: 0.03, delayChildren: 0.05},
  },
};

export default function BrowserHome({type}: Props) {
  const activeTab = useTabsState('activeTab');
  const reloadBrowserHomePage = useTriggerState('reloadBrowserHomePage');
  const dispatch = useDispatch<AppDispatch>();

  const [recentAddress, setRecentAddress] = useState<string[]>([]);
  const [favoriteAddress, setFavoriteAddress] = useState<string[]>([]);
  const [favIcons, setFavIcons] = useState<FavIcons[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  const switchToTerminal = useCallback(() => {
    dispatch(cardsActions.setRunningCardView({tabId: activeTab, view: 'terminal'}));
  }, [dispatch, activeTab]);

  const handleDataRefresh = useCallback(
    (result: {favoriteAddress: string[]; recentAddress: string[]; favIcons: FavIcons[]}) => {
      if (!mountedRef.current) return;
      setFavoriteAddress(result.favoriteAddress);
      setRecentAddress(result.recentAddress);
      setFavIcons(result.favIcons);
    },
    [],
  );

  const reloadPage = useCallback(() => {
    setIsLoading(true);

    getCachedHistoryData().then(result => {
      handleDataRefresh(result);
      setIsLoading(false);
    });
  }, [handleDataRefresh]);

  useEffect(() => {
    if (reloadBrowserHomePage) {
      reloadPage();
      dispatch(triggerActions.clear('reloadBrowserHomePage'));
    }
  }, [reloadBrowserHomePage, reloadPage]);

  useEffect(() => {
    mountedRef.current = true;
    reloadPage();

    return () => {
      mountedRef.current = false;
    };
  }, [reloadPage]);

  // Create a map for quick favicon lookup
  const favIconMap = useMemo(() => {
    const map = new Map<string, FavIcons>();
    for (const fav of favIcons) {
      map.set(fav.url, fav);
    }
    return map;
  }, [favIcons]);

  if (isLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <Spinner size="lg" color="default" />
      </div>
    );
  }

  return (
    <div className="size-full">
      <LynxScroll className="size-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto flex max-w-7xl flex-col gap-5 p-5 md:p-6 lg:p-8">
          <AnimatePresence>
            {type === 'both' && (
              <motion.div
                className={
                  'flex flex-col items-center rounded-2xl border border-foreground-200/50 bg-foreground-50/50 px-6' +
                  ' py-8 text-center dark:border-foreground-100/20 dark:bg-foreground-50/30'
                }
                variants={fadeIn}
                exit={{opacity: 0}}>
                <div className="mb-6">
                  <Spinner
                    size="lg"
                    color="secondary"
                    classNames={{label: 'mt-4 text-base font-medium text-foreground-600'}}>
                    Waiting for address...
                  </Spinner>
                </div>

                <p className="mb-6 max-w-sm text-sm text-foreground-500">
                  The terminal will capture the web interface address automatically
                </p>

                <Button
                  size="md"
                  variant="flat"
                  color="default"
                  className="font-medium"
                  onPress={switchToTerminal}
                  startContent={<Terminal_Icon className="size-4" />}>
                  Switch to Terminal
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <HistorySection
            title="Favorites"
            itemType="favorite"
            data={favoriteAddress}
            favIconMap={favIconMap}
            emptyTitle="No favorites yet"
            onRefresh={handleDataRefresh}
            emptyDescription="Star sites to add them here"
            subtitle="Quick access to your bookmarked sites"
            icon={<Star className="size-10 text-amber-500" />}
          />

          <HistorySection
            title="Recent"
            itemType="recent"
            data={recentAddress}
            favIconMap={favIconMap}
            emptyTitle="No recent visits"
            onRefresh={handleDataRefresh}
            subtitle="Your browsing history"
            emptyDescription="Your history will appear here"
            icon={<History_Color_Icon className="size-10" id="empty_page_history" />}
          />
        </motion.div>
      </LynxScroll>
    </div>
  );
}
