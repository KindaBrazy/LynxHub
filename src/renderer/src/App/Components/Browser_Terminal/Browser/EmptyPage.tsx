import {Button, Spinner} from '@heroui/react';
import {Empty} from 'antd';
import {AnimatePresence, motion} from 'framer-motion';
import {Dispatch, ReactNode, SetStateAction, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

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
  setData: Dispatch<SetStateAction<string[]>>;
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
  visible: {opacity: 1, y: 0, transition: {duration: 0.15}},
};

export default function EmptyPage({type}: Props) {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();
  const [recentAddress, setRecentAddress] = useState<string[]>([]);
  const [favoriteAddress, setFavoriteAddress] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const switchToTerminal = () => {
    dispatch(cardsActions.setRunningCardView({tabId: activeTab, view: 'terminal'}));
  };

  useEffect(() => {
    setIsLoading(true);
    rendererIpc.storageUtils.getBrowserHistoryData().then(result => {
      setFavoriteAddress(result.favoriteAddress);
      setRecentAddress(result.recentAddress);
      setIsLoading(false);
    });
  }, []);

  const renderSection = ({
    title,
    subtitle,
    icon,
    emptyTitle,
    emptyDescription,
    data,
    setData,
    itemType,
  }: SectionConfig) => {
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
                <EmptyPage_Item recent={item} type={itemType} setRecentAddress={setData} />
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
      setData: setFavoriteAddress,
      itemType: 'favorite',
    },
    {
      title: 'Recent',
      subtitle: 'Your browsing history',
      icon: <History_Color_Icon className="size-6" id="empty_page_history" />,
      emptyTitle: 'No recent visits',
      emptyDescription: 'Your history will appear here',
      data: recentAddress,
      setData: setRecentAddress,
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
