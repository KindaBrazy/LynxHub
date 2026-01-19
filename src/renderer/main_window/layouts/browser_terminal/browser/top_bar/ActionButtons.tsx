import {Button} from '@heroui/react';
import {Hotkey_Names} from '@lynx_cross/consts/hotkeys';
import browserIpc from '@lynx_shared/ipc/browser';
import {AnimatePresence, motion, Transition, Variants} from 'framer-motion';
import {memo, useEffect, useMemo, useState} from 'react';

import {ArrowDuo_Icon, Close_Icon, HomeSmile_Icon, RefreshDuo_Icon} from '../../../../../shared/assets/icons';
import useHotkeyPress from '../../../../hooks/hotkeys';
import {useTabsState} from '../../../../redux/reducers/tabs';
import {useIsActiveTab} from '../../../tabs/utils';

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
              <ArrowDuo_Icon className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canGoForward && (
          <motion.div exit="exit" initial="exit" animate="animate" variants={variants} transition={transition}>
            <Button size="sm" variant="light" onPress={goForward} className="cursor-default" isIconOnly>
              <ArrowDuo_Icon className="size-4 rotate-180" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Button size="sm" onPress={stop} variant="light" className="cursor-default" isIconOnly>
          <Close_Icon className="size-4" />
        </Button>
      ) : (
        <Button size="sm" variant="light" onPress={reload} className="cursor-default" isIconOnly>
          <RefreshDuo_Icon className="size-4" />
        </Button>
      )}

      {webuiAddress && (
        <Button size="sm" variant="light" onPress={loadWebuiURL} className="cursor-default" isIconOnly>
          <HomeSmile_Icon className="size-4" />
        </Button>
      )}
    </div>
  );
});

export default Browser_ActionButtons;
