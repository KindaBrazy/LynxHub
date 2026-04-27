import {useAppState} from '@lynx/redux/reducers/app';
import {Maximize_Icon, Minimize_Icon, UnMaximize_Icon} from '@lynx_assets/icons';
import applicationIpc from '@lynx_shared/ipc/application';
import {HTMLMotionProps, motion} from 'framer-motion';
import {ReactNode, useCallback, useMemo} from 'react';

import WindowButtons_Close from './WindowButtonsClose';

const BUTTONS_COMMON_STYLE = 'notDraggable cursor-default transition-colors duration-200 ease-out';
type WindowOperation = 'fullscreen' | 'minimize' | 'maximize' | 'close' | 'restart';

/**
 * Managing window controls (minimize, maximize, close).
 * Handles the state changes and renders appropriate buttons based on window state.
 */
const WindowButtons = () => {
  const onFocus = useAppState('onFocus');
  const maximized = useAppState('maximized');

  const changeWindowState = useCallback(
    (operation: WindowOperation) => applicationIpc.send.changeWinState(operation),
    [],
  );

  const buttonProps: HTMLMotionProps<'button'> = useMemo(
    () => ({
      whileHover: {scale: 1.1},
      animate: {opacity: onFocus ? 1 : 0.5},
    }),
    [onFocus],
  );

  const renderButton = useCallback(
    (operation: WindowOperation, icon: ReactNode, additionalClass: string) => (
      <motion.button
        type="button"
        {...buttonProps}
        onClick={() => changeWindowState(operation)}
        className={`${BUTTONS_COMMON_STYLE} ${additionalClass}`}>
        {icon}
      </motion.button>
    ),
    [buttonProps, changeWindowState],
  );

  return (
    <div className="right-0 flex h-full flex-row space-x-0.5 bg-blue-800/0">
      <div className="h-full w-10" />
      {renderButton('minimize', <Minimize_Icon className="size-3" />, 'px-4 hover:bg-surface-secondary')}
      {renderButton(
        'maximize',
        maximized ? <UnMaximize_Icon className="size-3" /> : <Maximize_Icon className="size-3" />,
        'px-4 hover:bg-surface-secondary',
      )}
      <WindowButtons_Close buttonProps={buttonProps} commonStyles={BUTTONS_COMMON_STYLE} />
    </div>
  );
};

export default WindowButtons;
