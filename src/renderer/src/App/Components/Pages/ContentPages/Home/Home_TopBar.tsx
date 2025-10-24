import {Button} from '@heroui/react';
import {motion} from 'framer-motion';
import {useDispatch} from 'react-redux';

import AddBreadcrumb_Renderer from '../../../../../../Breadcrumbs';
import {Terminal_Icon, Web_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {cardsActions} from '../../../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../Redux/Store';

export default function Home_TopBar() {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  const addRunningEmpty = (type: 'browser' | 'terminal' | 'both') =>
    dispatch(
      cardsActions.addRunningEmpty({
        tabId: activeTab,
        type,
      }),
    );

  const newTerminal = () => {
    AddBreadcrumb_Renderer(`New Empty Terminal`);
    addRunningEmpty('terminal');
  };

  const newBrowser = () => {
    AddBreadcrumb_Renderer(`New Empty Browser`);
    addRunningEmpty('browser');
  };

  const newTerminalBrowser = () => {
    AddBreadcrumb_Renderer(`New Empty Terminal & Browser`);
    addRunningEmpty('both');
  };

  return (
    <div className="w-full shrink-0 flex flex-row gap-x-3 px-6 py-3 justify-end items-center">
      <motion.div
        transition={{
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
          staggerChildren: 0.1,
        }}
        className="flex gap-3"
        animate={{scale: 1, translateY: 0, opacity: 1}}
        initial={{scale: 0.96, translateY: -10, opacity: 0}}>
        <motion.div transition={{delay: 0.1}} animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: -10}}>
          <Button
            size="sm"
            onPress={newTerminal}
            startContent={<Terminal_Icon />}
            className="hover:scale-105 bg-white shadow-sm dark:bg-foreground-200">
            <motion.span whileHover={{x: 2}} transition={{duration: 0.2}}>
              Terminal
            </motion.span>
          </Button>
        </motion.div>

        <motion.div transition={{delay: 0.2}} animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: -10}}>
          <Button
            size="sm"
            onPress={newBrowser}
            startContent={<Web_Icon />}
            className="hover:scale-105 bg-white shadow-sm dark:bg-foreground-200">
            <motion.span whileHover={{x: 1}} transition={{duration: 0.2}}>
              Browser
            </motion.span>
          </Button>
        </motion.div>

        <motion.div transition={{delay: 0.3}} animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: -10}}>
          <Button
            startContent={
              <motion.div
                whileTap={{scale: 0.9}}
                whileHover={{scale: 1.1}}
                transition={{duration: 0.2}}
                className="flex items-center justify-center gap-0.5">
                <Terminal_Icon />
                <span className="text-xs opacity-60">+</span>
                <Web_Icon />
              </motion.div>
            }
            size="sm"
            onPress={newTerminalBrowser}
            className={'bg-linear-to-br from-secondary to-primary hover:scale-105'}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
