import {Button, Spinner} from '@heroui/react';
import {Empty} from 'antd';
import {AnimatePresence, motion} from 'framer-motion';
import {ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {FavIcons} from '../../../../../../cross/IpcChannelAndTypes';
import {Star_Icon, Terminal_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {History_Color_Icon} from '../../../../assets/icons/SvgIcons/SvgIconsColor';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import LynxScroll from '../../Reusable/LynxScroll';
import EmptyPage_Item from './EmptyPage_Item';

type Props = {type: 'browser' | 'terminal' | 'both'};

type SectionConfig = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  data: string[];
  itemType: 'favorite' | 'recent';
};

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

const itemFade = {
  hidden: {opacity: 0, y: 6},
  visible: {opacity: 1, y: 0, transition: {duration: 0.2}},
};

// Cache for browser history data to avoid repeated IPC calls
let cachedHistoryData: {favoriteAddress: string[]; recentAddress: string[]; favIcons: FavIcons[]} | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5000; // 5 seconds cache

async function getCachedHistoryData() {
  const now = Date.now();
  if (cachedHistoryData && now - cacheTimestamp < CACHE_TTL) {
    return cachedHistoryData;
  }
  cachedHistoryData = await rendererIpc.storageUtils.getBrowserHistoryData();
  cacheTimestamp = now;
  return cachedHistoryData;
}

// Export for EmptyPage_Item to use
export function invalidateHistoryCache() {
  cachedHistoryData = null;
  cacheTimestamp = 0;
}

export {getCachedHistoryData};

export default function EmptyPage({type}: Props) {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();
  const [recentAddress, setRecentAddress] = useState<string[]>([]);
  const [favoriteAddress, setFavoriteAddress] = useState<string[]>([]);
  const [favIcons, setFavIcons] = useState<FavIcons[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  const switchToTerminal = () => {
    dispatch(cardsActions.setRunningCardView({tabId: activeTab, view: 'terminal'}));
  };

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);

    getCachedHistoryData().then(result => {
      if (!mountedRef.current) return;
      setFavoriteAddress(result.favoriteAddress);
      setRecentAddress(result.recentAddress);
      setFavIcons(result.favIcons);
      setIsLoading(false);
    });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Create a map for quick favicon lookup
  const favIconMap = useMemo(() => {
    const map = new Map<string, FavIcons>();
    for (const fav of favIcons) {
      map.set(fav.url, fav);
    }
    return map;
  }, [favIcons]);

  const renderSection = ({title, subtitle, icon, emptyTitle, emptyDescription, data, itemType}: SectionConfig) => {
    if (data.length > 0) {
      return (
        <motion.section variants={fadeIn} className="w-full">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-foreground-100/80 dark:bg-foreground-50/50">{icon}</div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="text-xs text-foreground-500">{subtitle}</p>
            </div>
          </div>

          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-wrap gap-4">
            {data.slice(0, 12).map((item, index) => (
              <motion.div variants={itemFade} key={`${itemType}-${index}`}>
                <EmptyPage_Item
                  onDataChange={() => {
                    invalidateHistoryCache();
                    getCachedHistoryData().then(result => {
                      setFavoriteAddress(result.favoriteAddress);
                      setRecentAddress(result.recentAddress);
                      setFavIcons(result.favIcons);
                    });
                  }}
                  recent={item}
                  type={itemType}
                  favIconMap={favIconMap}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      );
    }

    return (
      <motion.div variants={fadeIn}>
        <Empty
          className={
            'py-12 px-6 rounded-2xl bg-foreground-50/50 dark:bg-foreground-50/30 border' +
            ' border-foreground-200/50 dark:border-foreground-100/20'
          }
          description={
            <div className="text-center space-y-1">
              <h3 className="text-base font-medium text-foreground-600">{emptyTitle}</h3>
              <p className="text-sm text-foreground-400">{emptyDescription}</p>
            </div>
          }
          image={<div className="flex justify-center mb-4 opacity-60">{icon}</div>}
        />
      </motion.div>
    );
  };

  const sections: SectionConfig[] = [
    {
      title: 'Favorites',
      subtitle: 'Quick access to your bookmarked sites',
      icon: <Star_Icon className="text-amber-500 size-6" />,
      emptyTitle: 'No favorites yet',
      emptyDescription: 'Star sites to add them here',
      data: favoriteAddress,
      itemType: 'favorite',
    },
    {
      title: 'Recent',
      subtitle: 'Your browsing history',
      icon: <History_Color_Icon className="size-6" id="empty_page_history" />,
      emptyTitle: 'No recent visits',
      emptyDescription: 'Your history will appear here',
      data: recentAddress,
      itemType: 'recent',
    },
  ];

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
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
          className="flex flex-col gap-5 p-5 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence>
            {type === 'both' && (
              <motion.div
                className={
                  'flex flex-col items-center text-center py-8 px-6 rounded-2xl' +
                  ' bg-foreground-50/50 dark:bg-foreground-50/30 border' +
                  ' border-foreground-200/50 dark:border-foreground-100/20'
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

                <p className="text-sm text-foreground-500 mb-6 max-w-sm">
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

          {sections.map((section, index) => (
            <div key={index}>{renderSection(section)}</div>
          ))}
        </motion.div>
      </LynxScroll>
    </div>
  );
}
