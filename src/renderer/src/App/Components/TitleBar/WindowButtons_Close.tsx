import {motion} from 'framer-motion';
import {useCallback} from 'react';

import {Power_Icon} from '../../../assets/icons/SvgIcons/SvgIcons';
import {useHotkeysState} from '../../Redux/Reducer/HotkeysReducer';
import {useSettingsState} from '../../Redux/Reducer/SettingsReducer';
import {useTabsState} from '../../Redux/Reducer/TabsReducer';
import rendererIpc from '../../RendererIpc';

type Props = {
  buttonProps: any;
  commonStyles: string;
};

export default function WindowButtons_Close({buttonProps, commonStyles}: Props) {
  const isCtrlPressed = useHotkeysState('isCtrlPressed');
  const activePage = useTabsState('activePage');
  const showCloseConfirm = useSettingsState('closeConfirm');
  const close = useCallback(() => rendererIpc.win.changeWinState('close'), []);

  const onClick = () => {
    rendererIpc.storage.update('app', {lastPage: activePage});
    if (isCtrlPressed || !showCloseConfirm) {
      close();
    } else {
      rendererIpc.contextMenu.openCloseApp();
    }
  };

  return (
    <motion.button
      {...buttonProps}
      type="button"
      onClick={onClick}
      className={`${commonStyles} pl-3 pr-[1rem] hover:bg-danger`}>
      <Power_Icon className="size-[0.8rem]" />
    </motion.button>
  );
}
