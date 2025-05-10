import {Button} from '@heroui/react';
import {AnimatePresence, motion, Transition, Variants} from 'framer-motion';
import {useEffect, useState} from 'react';

import {Hotkey_Names} from '../../../../../../cross/HotkeyConstants';
import {HomeSmile_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons2';
import {Refresh3_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons4';
import {ArrowDuo_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons5';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import rendererIpc from '../../../RendererIpc';
import useHotkeyPress from '../../../Utils/RegisterHotkeys';

const variants: Variants = {
  animate: {scale: 1, opacity: 1},
  exit: {scale: 0.7, opacity: 0},
};

const transition: Transition = {duration: 0.3};

type Props = {webuiAddress: string; tabID: string; id: string};

export default function Browser_ActionButtons({webuiAddress, tabID, id}: Props) {
  const activeTab = useTabsState('activeTab');
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);

  const goBack = () => rendererIpc.browser.goBack(id);
  const goForward = () => rendererIpc.browser.goForward(id);
  const reload = () => rendererIpc.browser.reload(id);
  const loadWebuiURL = () => rendererIpc.browser.loadURL(id, webuiAddress);

  useHotkeyPress([{name: Hotkey_Names.refreshTab, method: activeTab === tabID ? reload : null}]);

  useEffect(() => {
    rendererIpc.browser.onCanGo((_, targetID, canGo) => {
      if (targetID == id) {
        setCanGoBack(canGo.back);
        setCanGoForward(canGo.forward);
      }
    });
    return () => {
      rendererIpc.browser.offCanGo();
    };
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

      <Button size="sm" variant="light" onPress={reload} className="cursor-default" isIconOnly>
        <Refresh3_Icon className="size-4" />
      </Button>

      {webuiAddress && (
        <Button size="sm" variant="light" onPress={loadWebuiURL} className="cursor-default" isIconOnly>
          <HomeSmile_Icon className="size-4" />
        </Button>
      )}
    </div>
  );
}
