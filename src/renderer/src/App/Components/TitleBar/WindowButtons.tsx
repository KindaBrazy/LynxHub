import {Button, Checkbox} from '@nextui-org/react';
import {Modal, Typography} from 'antd';
import {motion} from 'framer-motion';
import {useCallback, useMemo, useState} from 'react';
import {isHotkeyPressed} from 'react-hotkeys-hook';
import {useDispatch} from 'react-redux';

import {getIconByName, IconNameType} from '../../../assets/icons/SvgIconsContainer';
import {useAppState} from '../../Redux/App/AppReducer';
import {settingsActions, useSettingsState} from '../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';

const BUTTONS_COMMON_STYLE: string = 'notDraggable cursor-default transition-colors duration-300 ease-out';
type WindowOperation = 'fullscreen' | 'minimize' | 'maximize' | 'close' | 'restart';

/** Managing window controls (minimize, maximize, close). */
const WindowButtons = () => {
  const onFocus = useAppState('onFocus');
  const maximized = useAppState('maximized');
  const currentPage = useAppState('currentPage');
  const showCloseConfirm = useSettingsState('closeConfirm');

  const [isConfigVisible, setIsConfigVisible] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  const onShowConfirm = useCallback(
    (enabled: boolean) => {
      rendererIpc.storage.update('app', {closeConfirm: !enabled});
      dispatch(settingsActions.setSettingsState({key: 'closeConfirm', value: !enabled}));
    },
    [dispatch],
  );

  const close = useCallback(() => {
    rendererIpc.pty.process('stop', '');
    // Close the app with a delay so ensure pty terminated
    setTimeout(() => rendererIpc.win.changeWinState('close'), 200);
  }, []);

  const restart = useCallback(() => {
    rendererIpc.pty.process('stop', '');
    // Close the app with a delay so ensure pty terminated
    setTimeout(() => rendererIpc.win.changeWinState('restart'), 200);
  }, []);

  const changeWindowState = useCallback(
    (operation: WindowOperation) => {
      if (operation === 'close') {
        rendererIpc.storage.update('app', {lastPage: currentPage});
        if (isHotkeyPressed('control') || !showCloseConfirm) {
          close();
        } else if (!isConfigVisible) {
          setIsConfigVisible(true);
          Modal.error({
            title: 'Confirm Exit',
            content: (
              <div className="mt-2 flex flex-col space-y-1">
                <Typography.Text>Are you sure you want to exit the application?</Typography.Text>
                <Checkbox size="sm" onValueChange={onShowConfirm}>
                  Always exit without confirmation
                </Checkbox>
              </div>
            ),
            centered: true,
            onCancel: () => {
              setIsConfigVisible(false);
            },
            footer: (
              <div className="mt-2 flex w-full flex-row justify-between">
                <Button
                  onPress={() => {
                    setIsConfigVisible(false);
                    Modal.destroyAll();
                  }}
                  size="sm"
                  color="success">
                  Stay
                </Button>
                <div className="space-x-2">
                  <Button size="sm" color="warning" onPress={restart}>
                    Restart
                  </Button>
                  <Button size="sm" color="danger" onPress={close}>
                    Exit
                  </Button>
                </div>
              </div>
            ),
            maskClosable: true,
            rootClassName: 'scrollbar-hide',
            styles: {mask: {top: '2.5rem'}},
            wrapClassName: 'mt-10',
          });
        }
      } else {
        rendererIpc.win.changeWinState(operation);
      }
    },
    [currentPage, onShowConfirm, showCloseConfirm, setIsConfigVisible, isConfigVisible],
  );

  const buttonProps = useMemo(
    () => ({
      whileHover: {scale: 1.1},
      animate: {opacity: onFocus ? 1 : 0.5},
    }),
    [onFocus],
  );

  const renderButton = useCallback(
    (operation: WindowOperation, icon: IconNameType, additionalClass: string) => (
      <motion.button
        type="button"
        {...buttonProps}
        onClick={() => changeWindowState(operation)}
        className={`${BUTTONS_COMMON_STYLE} ${additionalClass}`}>
        {getIconByName(icon, {className: operation === 'close' ? 'h-[0.8rem] w-[0.8rem]' : 'h-3 w-3'})}
      </motion.button>
    ),
    [buttonProps, changeWindowState],
  );

  return (
    <div className="right-0 flex h-full flex-row space-x-0.5 bg-blue-800/0">
      {renderButton('minimize', 'Minimize', 'px-4 hover:bg-black/[0.15] dark:hover:bg-white/[0.15]')}
      {renderButton(
        'maximize',
        maximized ? 'UnMaximize' : 'Maximize',
        'px-4 hover:bg-black/[0.15] dark:hover:bg-white/[0.15]',
      )}
      {renderButton('close', 'Power', 'pl-3 pr-[1rem] hover:bg-red-600')}
    </div>
  );
};

export default WindowButtons;
