import {AnimatePresence, motion} from 'framer-motion';
import {ReactNode, useCallback, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import AddBreadcrumb_Renderer from '../../../../Breadcrumbs';
import {useAppState} from '../../Redux/Reducer/AppReducer';
import {tabsActions, useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';

export type NavItem = {
  title: string;
  icon: ReactNode;
  badge?: ReactNode | boolean;
  path: string;
};

type Props = {items: NavItem[]};
export default function NavigationDock({items}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const isDark = useAppState('darkMode');

  const activePage = useTabsState('activePage');

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
  const [isHoveringDock, setIsHoveringDock] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  const primaryColor = isDark ? '#0050EF' : '#00A9FF';
  const textColor = isDark ? '#e5e7eb' : '#1f2937';
  const mutedText = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientY - rect.top,
      y: e.clientX - rect.left,
    });
  };

  const handleClick = useCallback(
    (item: NavItem) => {
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
    },
    [activePage],
  );

  return (
    <div className="flex items-center justify-center">
      <motion.div className="relative" animate={{opacity: 1, x: 0}} initial={{opacity: 0, x: -50}}>
        {/* Dock container */}
        <div
          ref={dockRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHoveringDock(true)}
          onMouseLeave={() => setIsHoveringDock(false)}
          className="relative backdrop-blur-xl rounded-2xl p-1 shadow-2xl dark:bg-LynxRaisinBlack bg-white">
          {/* Animated border gradient following cursor */}
          <AnimatePresence>
            {isHoveringDock && (
              <motion.div
                style={{
                  background:
                    `radial-gradient(600px circle at ${mousePosition.y}px` +
                    ` ${mousePosition.x}px, ${primaryColor}40, transparent 40%)`,
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
                    `radial-gradient(400px circle at ${mousePosition.y}px` +
                    ` ${mousePosition.x}px, ${primaryColor}70, transparent 60%)`,
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

          <div className="flex flex-col gap-y-0.5 relative z-10">
            {items.map((item, index) => (
              <motion.button
                key={item.path}
                whileTap={{scale: 0.95}}
                className="relative group"
                onClick={() => handleClick(item)}
                onHoverEnd={() => setHoveredIndex(null)}
                onHoverStart={() => setHoveredIndex(index)}>
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
                    scale: hoveredIndex === index ? 1.15 : 1,
                    y: hoveredIndex === index ? -2 : 0,
                  }}
                  whileHover={{color: textColor}}
                  transition={{type: 'spring', stiffness: 400, damping: 25}}
                  className="relative flex items-center justify-center size-12 rounded-xl">
                  {/* Hover background glow */}
                  <AnimatePresence>
                    {hoveredIndex === index && activePage !== item.path && (
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
                      scale: hoveredIndex === index ? [1, 1.1, 1] : 1,
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

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      exit={{opacity: 0, x: -10}}
                      animate={{opacity: 1, x: 0}}
                      transition={{duration: 0.2}}
                      initial={{opacity: 0, x: -10}}
                      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 pointer-events-none z-30">
                      <div
                        style={{
                          backgroundColor: isDark ? '#2d2d32' : '#ffffff',
                          color: textColor,
                          border: `1px solid ${borderColor}`,
                        }}
                        className="px-3 py-2 rounded-xl shadow-xl whitespace-nowrap text-sm font-medium">
                        {item.title}
                        <div
                          style={{
                            borderRightColor: isDark ? '#2d2d32' : '#ffffff',
                          }}
                          className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
