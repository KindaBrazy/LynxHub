import {Button} from '@heroui/react';
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

type Props = {webuiAddress: string; tabID: string; id: string; isDomReady: boolean};

const Browser_ActionButtons = memo(({webuiAddress, tabID, id, isDomReady}: Props) => {
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
  }, []);

  return (
    <div className="flex flex-row gap-x-1 ml-1">
      <AnimatePresence>
        {canGoBack && (
          <motion.div exit="exit" initial="exit" animate="animate" variants={variants} transition={transition}>
            <Button size="sm" variant="light" onPress={goBack} className="cursor-default" isIconOnly>
              <ArrowLeft className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canGoForward && (
          <motion.div exit="exit" initial="exit" animate="animate" variants={variants} transition={transition}>
            <Button size="sm" variant="light" onPress={goForward} className="cursor-default" isIconOnly>
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Button size="sm" onPress={stop} variant="light" className="cursor-default" isIconOnly>
          <X className="size-4" />
        </Button>
      ) : (
        <Button size="sm" variant="light" onPress={reload} className="cursor-default" isIconOnly>
          <Restart className="size-4" />
        </Button>
      )}

      {webuiAddress && (
        <Button size="sm" variant="light" onPress={loadWebuiURL} className="cursor-default" isIconOnly>
          <Home2 className="size-4" />
        </Button>
      )}
    </div>
  );
});

export default Browser_ActionButtons;
