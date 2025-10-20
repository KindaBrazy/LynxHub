import {AnimatePresence, motion} from 'framer-motion';
import {memo, MouseEvent, ReactNode, useCallback, useRef, useState, WheelEvent} from 'react';
import {useDispatch} from 'react-redux';

import AddBreadcrumb_Renderer from '../../../../Breadcrumbs';
import {useAppState} from '../../Redux/Reducer/AppReducer';
import {tabsActions, useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import Tooltip from './NavTooltip';

export type NavItem = {
  title: string;
  icon: ReactNode;
  badge?: ReactNode | boolean;
  path: string;
};

type Props = {
  items: NavItem[];
  /** Maximum number of items to display before scrolling is enabled. */
  maxItems?: number;
};

const ScrollArrow = memo(
  ({direction, onClick, isDark}: {direction: 'up' | 'down'; onClick: () => void; isDark: boolean}) => {
    const mutedText = isDark ? '#9ca3af' : '#6b7280';
    const hoverBg = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    return (
      <motion.button
        onClick={onClick}
        style={{color: mutedText}}
        whileHover={{backgroundColor: hoverBg, color: isDark ? '#e5e7eb' : '#1f2937'}}
        className="flex items-center justify-center w-full py-2 rounded-xl cursor-pointer pointer-events-auto">
        {direction === 'up' ? (
          <svg
            fill="none"
            strokeWidth={2.5}
            className="size-4"
            viewBox="0 0 24 24"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
          </svg>
        ) : (
          <svg
            fill="none"
            strokeWidth={2.5}
            className="size-4"
            viewBox="0 0 24 24"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </motion.button>
    );
  },
);

const NavigationDock = memo(({items, maxItems = 7}: Props) => {
  const isDark = useAppState('darkMode');
  const activePage = useTabsState('activePage');

  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
  const [isHoveringDock, setIsHoveringDock] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  const [startIndex, setStartIndex] = useState(0);
  const lastScrollTime = useRef(0);

  const primaryColor = isDark ? '#0050EF' : '#00A9FF';

  const totalItems = items.length;
  const showScrollControls = maxItems && totalItems > maxItems;
  const canScrollUp = startIndex > 0;
  const canScrollDown = startIndex + maxItems < totalItems;

  // Constants for calculating scroll position
  const ITEM_HEIGHT = 48; // from size-12 (3rem = 48px)
  const GAP = 2; // from gap-y-0.5 (0.125rem = 2px)
  const ITEM_TOTAL_HEIGHT = ITEM_HEIGHT + GAP;

  const handleScrollUp = useCallback(() => {
    setStartIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleScrollDown = useCallback(() => {
    if (!maxItems) return;
    setStartIndex(prev => Math.min(totalItems - maxItems, prev + 1));
  }, [totalItems, maxItems]);

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (!showScrollControls) return;

      const now = Date.now();
      if (now - lastScrollTime.current < 150) {
        return;
      }
      lastScrollTime.current = now;

      if (e.deltaY > 0 && canScrollDown) {
        handleScrollDown();
      } else if (e.deltaY < 0 && canScrollUp) {
        handleScrollUp();
      }
    },
    [showScrollControls, canScrollUp, canScrollDown, handleScrollUp, handleScrollDown],
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientY - rect.top,
      y: e.clientX - rect.left,
    });
  };

  const listContent = (
    <motion.div
      className="flex flex-col gap-y-0.5"
      transition={{type: 'spring', stiffness: 400, damping: 40}}
      animate={{y: showScrollControls ? -startIndex * ITEM_TOTAL_HEIGHT : 0}}>
      {items.map(item => (
        <RenderItem item={item} isDark={isDark} activePage={activePage} key={`${item.title}_nav`} />
      ))}
    </motion.div>
  );

  return (
    <motion.div
      onMouseLeave={() => {
        setIsHoveringDock(false);
      }}
      ref={dockRef}
      animate={{opacity: 1, x: 0}}
      onMouseMove={handleMouseMove}
      initial={{opacity: 0, x: -50}}
      onMouseEnter={() => setIsHoveringDock(true)}
      className="relative backdrop-blur-xl rounded-2xl p-1 shadow-2xl dark:bg-LynxRaisinBlack bg-white">
      {/* Animated border gradient following cursor */}
      <AnimatePresence>
        {isHoveringDock && (
          <motion.div
            style={{
              background:
                `radial-gradient(300px circle at ${mousePosition.y}px` +
                ` ${mousePosition.x}px, ${primaryColor}${isDark ? '40' : '25'}, transparent 40%)`,
            }}
            exit={{opacity: 0}}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="absolute inset-0 rounded-2xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Animated border line following cursor */}
      <AnimatePresence>
        {isHoveringDock && (
          <motion.div
            style={{
              inset: '-1px',
              padding: '2px',
              background:
                `radial-gradient(100px circle at ${mousePosition.y}px` +
                ` ${mousePosition.x}px, ${primaryColor}${isDark ? '' : '80'}, transparent 70%)`,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
            exit={{opacity: 0}}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="absolute rounded-2xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* --- MODIFICATION START --- */}
      <div className="relative">
        {/* Viewport for list items */}
        {showScrollControls ? (
          <div
            style={{
              height: maxItems * ITEM_TOTAL_HEIGHT - GAP,
            }}
            onWheel={handleWheel}
            className="overflow-hidden">
            {listContent}
          </div>
        ) : (
          listContent
        )}

        {/* Scroll Up Arrow Overlay */}
        <AnimatePresence>
          {showScrollControls && canScrollUp && (
            <motion.div
              style={{
                background: `linear-gradient(to bottom, ${isDark ? '#121217' : '#FFFFFF'} 20%, transparent)`,
              }}
              exit={{opacity: 0}}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{duration: 0.2}}
              className="absolute top-0 left-0 right-0 pointer-events-none rounded-xl">
              <ScrollArrow direction="up" isDark={isDark} onClick={handleScrollUp} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll Down Arrow Overlay */}
        <AnimatePresence>
          {showScrollControls && canScrollDown && (
            <motion.div
              style={{
                background: `linear-gradient(to top, ${isDark ? '#121217' : '#FFFFFF'} 20%, transparent)`,
              }}
              exit={{opacity: 0}}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{duration: 0.2}}
              className="absolute bottom-0 left-0 right-0 pointer-events-none rounded-xl">
              <ScrollArrow isDark={isDark} direction="down" onClick={handleScrollDown} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* --- MODIFICATION END --- */}
    </motion.div>
  );
});

type ItemProp = {item: NavItem; activePage: string; isDark: boolean};
const RenderItem = memo(function RenderItem({item, activePage, isDark}: ItemProp) {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleClick = useCallback(() => {
    const {title, path} = item;
    if (activePage === item.path) return;
    AddBreadcrumb_Renderer(`Nav Button: pageId:${path}, title:${title}`);
    dispatch(
      tabsActions.setActivePage({
        pageID: path,
        title: title || '',
        isTerminal: false,
      }),
    );
  }, [item, activePage, dispatch]);

  const textColor = isDark ? '#e5e7eb' : '#1f2937';
  const mutedText = isDark ? '#9ca3af' : '#6b7280';

  return (
    <Tooltip key={item.path} isDark={isDark} content={item.title}>
      <motion.button
        onClick={handleClick}
        whileTap={{scale: 0.95}}
        className="relative group"
        onHoverEnd={() => setIsHovered(false)}
        onHoverStart={() => setIsHovered(true)}>
        {/* Active indicator */}
        <AnimatePresence>
          {activePage === item.path && (
            <motion.div
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
              initial={false}
              layoutId="activeIndicator"
              className="absolute inset-0 rounded-xl shadow-lg bg-primary"
            />
          )}
        </AnimatePresence>

        {/* Icon container */}
        <motion.div
          style={{
            color: activePage === item.path ? '#ffffff' : mutedText,
          }}
          animate={{
            scale: isHovered ? 1.15 : 1,
            y: isHovered ? -2 : 0,
          }}
          whileHover={{color: textColor}}
          transition={{type: 'spring', stiffness: 400, damping: 25}}
          className="relative flex items-center justify-center size-12 rounded-xl">
          {/* Hover background glow */}
          <AnimatePresence>
            {isHovered && activePage !== item.path && (
              <motion.div
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }}
                transition={{duration: 0.2}}
                exit={{opacity: 0, scale: 0.8}}
                animate={{opacity: 1, scale: 0.9}}
                initial={{opacity: 0, scale: 0.8}}
                className="absolute inset-0 rounded-xl"
              />
            )}
          </AnimatePresence>

          <motion.div
            animate={{
              scale: isHovered ? [1, 1.1, 1] : 1,
            }}
            className="size-5"
            transition={{duration: 0.3}}>
            {item.icon}
          </motion.div>

          {/* Badge */}
          {item.badge && (
            <motion.div
              initial={{scale: 0}}
              animate={{scale: 1}}
              className={`absolute ${typeof item.badge === 'boolean' ? 'top-1 right-1' : 'top-0 right-0'}`}>
              {typeof item.badge === 'boolean' ? (
                <div className="size-2 bg-success rounded-full" />
              ) : (
                <div
                  className={
                    'px-1.5 py-0.5 bg-success text-white text-xs font-bold rounded-full' +
                    ' min-w-[1.25rem] flex items-center justify-center'
                  }>
                  {item.badge}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Tooltip is now handled by the Tooltip component */}
      </motion.button>
    </Tooltip>
  );
});

export default NavigationDock;
