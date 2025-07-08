import {Button, Spinner} from '@heroui/react';
import {Empty} from 'antd';
import {AnimatePresence, motion, stagger, Variants} from 'framer-motion';
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
  gradient: string;
  iconBg: string;
};

// Enhanced animation variants
const containerVariants: Variants = {
  hidden: {opacity: 0, y: 20},
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      delayChildren: stagger(0.1),
    },
  },
};

const itemVariants: Variants = {
  hidden: {opacity: 0, scale: 0.9},
  visible: {
    opacity: 1,
    scale: 1,
    transition: {duration: 0.4, ease: 'easeOut'},
  },
};

const cardVariants: Variants = {
  hidden: {opacity: 0, y: 30},
  visible: {
    opacity: 1,
    y: 0,
    transition: {duration: 0.5, ease: 'easeOut'},
  },
  hover: {
    scale: 1.02,
    transition: {duration: 0.2},
  },
};

export default function EmptyPage({type}: Props) {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();
  const [recentAddress, setRecentAddress] = useState<string[]>([]);
  const [favoriteAddress, setFavoriteAddress] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced styles with modern glassmorphism and gradients
  const containerStyles =
    'w-full lg:max-w-6xl md:max-w-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5' +
    ' dark:from-gray-900/20 dark:to-gray-800/10 rounded-3xl p-6 shadow-2xl border border-white/20' +
    ' dark:border-gray-700/30';
  const emptyStyles =
    'w-full lg:max-w-6xl md:max-w-2xl p-12 backdrop-blur-xl bg-gradient-to-br from-gray-50/50 ' +
    'to-white/30 dark:from-gray-900/30 dark:to-gray-800/20 rounded-3xl border border-gray-200/30' +
    ' dark:border-gray-700/30';
  const headerStyles = 'flex flex-row items-center gap-x-4 mb-10';
  const gridStyles = 'flex flex-row flex-wrap gap-4';

  const switchToTerminal = () => {
    dispatch(cardsActions.setRunningCardView({tabId: activeTab, view: 'terminal'}));
  };

  useEffect(() => {
    setIsLoading(true);
    rendererIpc.storage.get('browser').then(result => {
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
    iconBg,
  }: SectionConfig) => {
    if (data.length > 0) {
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={cardVariants}
          className={containerStyles}>
          <div className={headerStyles}>
            <motion.div
              transition={{duration: 0.2}}
              whileHover={{scale: 1.1, rotate: 5}}
              className={`p-3 rounded-2xl ${iconBg} shadow-lg`}>
              {icon}
            </motion.div>
            <div>
              <span
                className={
                  'text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white' +
                  ' dark:to-gray-300 bg-clip-text text-transparent'
                }>
                {title}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
            </div>
          </div>

          <motion.div initial="hidden" animate="visible" className={gridStyles} variants={containerVariants}>
            {data.slice(0, 8).map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <EmptyPage_Item recent={item} type={itemType} setRecentAddress={setData} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      );
    }

    return (
      <motion.div transition={{duration: 0.5}} animate={{opacity: 1, scale: 1}} initial={{opacity: 0, scale: 0.9}}>
        <Empty
          description={
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{emptyTitle}</h3>
              <p className="text-gray-500 dark:text-gray-400">{emptyDescription}</p>
            </div>
          }
          image={
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex justify-center mb-6">
              <div className="scale-[2]">{icon}</div>
            </motion.div>
          }
          className={emptyStyles}
        />
      </motion.div>
    );
  };

  const sections: SectionConfig[] = [
    {
      title: 'Favorites',
      subtitle: 'Quick access to your favorite sites',
      icon: <Star_Icon className="text-yellow-400 size-8" />,
      emptyTitle: 'No favorites yet',
      emptyDescription: 'Star some sites to see them here',
      data: favoriteAddress,
      setData: setFavoriteAddress,
      itemType: 'favorite',
      gradient: 'from-yellow-400/20 to-orange-400/20',
      iconBg: 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border border-yellow-400/30',
    },
    {
      title: 'Recent',
      subtitle: 'Places you visited recently',
      icon: <History_Color_Icon className="size-8" id="empty_page_history" />,
      emptyTitle: 'Nothing here yet',
      emptyDescription: 'Your recent visits will show up here',
      data: recentAddress,
      setData: setRecentAddress,
      itemType: 'recent',
      gradient: 'from-blue-400/20 to-purple-400/20',
      iconBg: 'bg-gradient-to-br from-blue-400/20 to-purple-400/20 border border-blue-400/30',
    },
  ];

  if (isLoading) {
    return (
      <div className="size-full p-1">
        <LynxScroll className="size-full">
          <div className="flex flex-col gap-y-6 items-center justify-center p-6 min-h-full">
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col items-center gap-4">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-3xl bg-gray-300 dark:bg-gray-700 h-32 w-96"></div>
              </div>
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-3xl bg-gray-300 dark:bg-gray-700 h-32 w-96"></div>
              </div>
            </motion.div>
          </div>
        </LynxScroll>
      </div>
    );
  }

  return (
    <div className="size-full p-1">
      <LynxScroll className="size-full">
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.8}}
          className="flex flex-col gap-y-8 items-center justify-center p-8 min-h-full">
          <AnimatePresence>
            {type === 'both' && (
              <motion.div
                transition={{duration: 0.6}}
                exit={{opacity: 0, scale: 0.8}}
                animate={{opacity: 1, scale: 1}}
                initial={{opacity: 0, scale: 0.8}}
                className="mb-8 flex flex-col items-center">
                <motion.div
                  animate={{y: [0, -5, 0]}}
                  className="mb-8 flex flex-col items-center"
                  transition={{duration: 2, repeat: Infinity, ease: 'easeInOut'}}>
                  <Spinner
                    classNames={{
                      label:
                        'mt-4 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600' +
                        ' bg-clip-text text-transparent',
                    }}
                    size="lg"
                    variant="wave"
                    color="secondary">
                    🚀 Waiting for terminal to print address...
                  </Spinner>
                  <p className="mt-3 text-gray-600 dark:text-gray-400 text-center max-w-md">
                    Please wait to capture the web interface address
                  </p>
                </motion.div>

                <motion.div className="w-full" whileTap={{scale: 0.95}} whileHover={{scale: 1.05}}>
                  <Button
                    className={
                      'w-full h-auto flex-col shadow-2xl p-4 ' +
                      'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600' +
                      ' hover:to-purple-700 text-white font-semibold'
                    }
                    variant="flat"
                    color="primary"
                    onPress={switchToTerminal}>
                    <Terminal_Icon className="size-8 shrink-0" />
                    <span className="text-lg">Switch to Terminal</span>
                    <span className="text-xs opacity-80">Continue in terminal mode</span>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full max-w-6xl flex flex-col gap-8">
            {sections.map((section, index) => (
              <motion.div key={index} variants={itemVariants}>
                {renderSection(section)}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </LynxScroll>
    </div>
  );
}
