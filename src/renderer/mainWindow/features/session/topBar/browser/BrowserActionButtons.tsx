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
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);

  const isLoading = useMemo(() => tabs.find(tab => tab.id === tabID)?.isLoading ?? false, [tabs, tabID]);

  const goBack = () => browserIpc.send.goBack(id);
  const goForward = () => browserIpc.send.goForward(id);
  const reload = () => browserIpc.send.reload(id);
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
            <Tooltip content="Click to go back" delay={1000}>
              <Button
                size="sm"
                variant="light"
                onPress={goBack}
                className="cursor-default"
                isIconOnly
                aria-label="Go Back">
                <ArrowLeft className="size-4" />
              </Button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canGoForward && (
          <motion.div exit="exit" initial="exit" animate="animate" variants={variants} transition={transition}>
            <Tooltip content="Click to go forward" delay={1000}>
              <Button
                size="sm"
                variant="light"
                onPress={goForward}
                className="cursor-default"
                isIconOnly
                aria-label="Go Forward">
                <ArrowRight className="size-4" />
              </Button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Tooltip content="Stop loading" delay={1000}>
          <Button
            size="sm"
            onPress={stop}
            variant="light"
            className="cursor-default"
            isIconOnly
            aria-label="Stop Loading">
            <X className="size-4" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Reload page" delay={1000}>
          <Button
            size="sm"
            variant="light"
            onPress={reload}
            className="cursor-default"
            isIconOnly
            aria-label="Reload Page">
            <Restart className="size-4" />
          </Button>
        </Tooltip>
      )}

      {webuiAddress && (
        <Tooltip content="Go to Home" delay={1000}>
          <Button
            size="sm"
            variant="light"
            onPress={loadWebuiURL}
            className="cursor-default"
            isIconOnly
            aria-label="Go Home">
            <Home2 className="size-4" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
});

BrowserActionButtons.displayName = 'BrowserActionButtons';

export default BrowserActionButtons;
