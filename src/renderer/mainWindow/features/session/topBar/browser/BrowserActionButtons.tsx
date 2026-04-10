import {Button, Tooltip} from '@heroui/react';
import useHotkeyPress from '@lynx/hooks/hotkeys';
import {useIsActiveTab} from '@lynx/layouts/tabs/utils';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {Hotkey_Names} from '@lynx_common/consts/hotkeys';
import browserIpc from '@lynx_shared/ipc/browser';
import {ArrowLeft, ArrowRight, Home2, Restart} from '@solar-icons/react-perf/BoldDuotone';
import {AnimatePresence, motion, Transition, Variants} from 'framer-motion';
import {X} from 'lucide-react';
import {memo, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {triggerActions} from '../../../../redux/reducers/triggers';
import {AppDispatch} from '../../../../redux/store';

const variants: Variants = {
  animate: {scale: 1, opacity: 1},
  exit: {scale: 0.7, opacity: 0},
};

const transition: Transition = {duration: 0.3};

type Props = {
  /**
   * The web UI address (home page).
   */
  webuiAddress: string;
  /**
   * The ID of the tab.
   */
  tabID: string;
  /**
   * The ID of the browser/card.
   */
  id: string;
  /**
   * Whether the DOM is ready.
   */
  isDomReady: boolean;
};

/**
 * Browser navigation buttons (Back, Forward, Reload/Stop, Home).
 */
const BrowserActionButtons = memo(({webuiAddress, tabID, id, isDomReady}: Props) => {
  const isActiveTab = useIsActiveTab(tabID);
  const tabs = useTabsState('tabs');
  const dispatch = useDispatch<AppDispatch>();

  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);

  const isLoading = useMemo(() => tabs.find(tab => tab.id === tabID)?.isLoading ?? false, [tabs, tabID]);

  const goBack = () => browserIpc.send.goBack(id);
  const goForward = () => browserIpc.send.goForward(id);
  const reload = () => {
    browserIpc.send.reload(id);
    dispatch(triggerActions.trigger('reloadBrowserHomePage'));
  };
  const stop = () => browserIpc.send.stop(id);
  const loadWebuiURL = () => browserIpc.send.loadURL(id, webuiAddress);
  const toggleDevTools = () => browserIpc.send.toggleDevTools(id);

  const canToggleDevTools = isActiveTab && isDomReady;

  useHotkeyPress([
    {name: Hotkey_Names.refreshTab, method: isActiveTab ? reload : null},
    {name: Hotkey_Names.toggleDevTools, method: canToggleDevTools ? toggleDevTools : null},
  ]);

  useEffect(() => {
    const offCanGo = browserIpc.on.canGoBackForward((targetID, canGo) => {
      if (targetID == id) {
        setCanGoBack(canGo.back);
        setCanGoForward(canGo.forward);
      }
    });
    return () => offCanGo();
  }, [id]);

  return (
    <div className="flex flex-row gap-x-1 ml-1">
      <AnimatePresence>
        {canGoBack && (
          <motion.div exit="exit" initial="exit" animate="animate" variants={variants} transition={transition}>
            <Tooltip delay={1000} content="Click to go back">
              <Button
                size="sm"
                variant="light"
                onPress={goBack}
                aria-label="Go Back"
                className="cursor-default"
                isIconOnly>
                <ArrowLeft className="size-4" />
              </Button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canGoForward && (
          <motion.div exit="exit" initial="exit" animate="animate" variants={variants} transition={transition}>
            <Tooltip delay={1000} content="Click to go forward">
              <Button
                size="sm"
                variant="light"
                onPress={goForward}
                aria-label="Go Forward"
                className="cursor-default"
                isIconOnly>
                <ArrowRight className="size-4" />
              </Button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Tooltip delay={1000} content="Stop loading">
          <Button
            size="sm"
            onPress={stop}
            variant="light"
            aria-label="Stop Loading"
            className="cursor-default"
            isIconOnly>
            <X className="size-4" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip delay={1000} content="Reload page">
          <Button
            size="sm"
            variant="light"
            onPress={reload}
            aria-label="Reload Page"
            className="cursor-default"
            isIconOnly>
            <Restart className="size-4" />
          </Button>
        </Tooltip>
      )}

      {webuiAddress && (
        <Tooltip delay={1000} content="Go to Home">
          <Button
            size="sm"
            variant="light"
            aria-label="Go Home"
            onPress={loadWebuiURL}
            className="cursor-default"
            isIconOnly>
            <Home2 className="size-4" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
});

BrowserActionButtons.displayName = 'BrowserActionButtons';

export default BrowserActionButtons;
