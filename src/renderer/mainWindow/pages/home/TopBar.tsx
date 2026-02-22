import { Button } from '@heroui/react';
import { cardsActions } from '@lynx/redux/reducers/cards';
import { useTabsState } from '@lynx/redux/reducers/tabs';
import { AppDispatch } from '@lynx/redux/store';
import { Terminal_Icon } from '@lynx_assets/icons';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import { Earth } from '@solar-icons/react-perf/BoldDuotone';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useDispatch } from 'react-redux';

/**
 * Animated top bar component for the Home page.
 * Provides quick actions to open new terminals, browsers, or split views.
 *
 * @returns {JSX.Element} A set of animated action buttons.
 */
export default function HomeTopBar() {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  /**
   * Dispatches an action to open a new empty card of the specified type in the active tab.
   *
   * @param {'browser' | 'terminal' | 'both'} type The type of view to open.
   */
  const addRunningEmpty = (type: 'browser' | 'terminal' | 'both') =>
    dispatch(
      cardsActions.addRunningEmpty({
        tabId: activeTab,
        type,
      }),
    );

  const handleNewTerminal = () => {
    AddBreadcrumb_Renderer(`New Empty Terminal`);
    addRunningEmpty('terminal');
  };

  const handleNewBrowser = () => {
    AddBreadcrumb_Renderer(`New Empty Browser`);
    addRunningEmpty('browser');
  };

  const handleNewTerminalBrowser = () => {
    AddBreadcrumb_Renderer(`New Empty Terminal & Browser`);
    addRunningEmpty('both');
  };

  return (
    <div className="flex w-full shrink-0 flex-row items-center justify-end gap-x-3 px-6 py-3">
      <motion.div
        transition={{
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
          staggerChildren: 0.1,
        }}
        className="flex gap-3"
        animate={{ scale: 1, translateY: 0, opacity: 1 }}
        initial={{ scale: 0.96, translateY: -10, opacity: 0 }}>
        <motion.div transition={{ delay: 0.1 }} animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -10 }}>
          <Button
            size="sm"
            onPress={handleNewTerminal}
            startContent={<Terminal_Icon />}
            className="dark:bg-foreground-200 bg-white shadow-sm hover:scale-105">
            <motion.span whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
              Terminal
            </motion.span>
          </Button>
        </motion.div>

        <motion.div transition={{ delay: 0.2 }} animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -10 }}>
          <Button
            size="sm"
            onPress={handleNewBrowser}
            startContent={<Earth />}
            className="dark:bg-foreground-200 bg-white shadow-sm hover:scale-105">
            <motion.span whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
              Browser
            </motion.span>
          </Button>
        </motion.div>

        <motion.div transition={{ delay: 0.3 }} animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -10 }}>
          <Button size="sm" onPress={handleNewTerminalBrowser} className={'bg-primary shadow-sm hover:scale-105'}>
            <motion.div
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center gap-x-1">
              <Terminal_Icon />
              <Plus className="size-2 opacity-60" />
              <Earth />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
