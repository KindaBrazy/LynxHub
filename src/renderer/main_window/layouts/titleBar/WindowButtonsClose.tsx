import {useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {useSettingsState} from '@lynx/redux/reducers/settings';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {Power_Icon} from '@lynx_assets/icons';
import applicationIpc from '@lynx_shared/ipc/application';
import contextMenuIpc from '@lynx_shared/ipc/context_menu';
import storageIpc from '@lynx_shared/ipc/storage';
import {motion} from 'framer-motion';
import {useCallback} from 'react';

type Props = {
  buttonProps: any;
  commonStyles: string;
};

export default function WindowButtons_Close({buttonProps, commonStyles}: Props) {
  const isCtrlPressed = useHotkeysState('isCtrlPressed');
  const activePage = useTabsState('activePage');
  const showCloseConfirm = useSettingsState('closeConfirm');
  const close = useCallback(() => applicationIpc.send.changeWinState('close'), []);

  const onClick = () => {
    storageIpc.update('app', {lastPage: activePage});
    if (isCtrlPressed || !showCloseConfirm) {
      close();
    } else {
      contextMenuIpc.send.openCloseApp();
    }
  };

  return (
    <motion.button
      {...buttonProps}
      type="button"
      onClick={onClick}
      className={`${commonStyles} pl-3 pr-4 hover:bg-danger`}>
      <Power_Icon className="size-[0.8rem]" />
    </motion.button>
  );
}
