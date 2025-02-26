import {motion} from 'framer-motion';
import {ReactNode, useCallback, useMemo} from 'react';

import {Maximize_Icon, Minimize_Icon} from '../../../assets/icons/SvgIcons/SvgIcons2';
import {UnMaximize_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import {useAppState} from '../../Redux/App/AppReducer';
import rendererIpc from '../../RendererIpc';
import WindowButtons_Close from './WindowButtons_Close';

const BUTTONS_COMMON_STYLE: string = 'notDraggable cursor-default transition-colors duration-300 ease-out';
type WindowOperation = 'fullscreen' | 'minimize' | 'maximize' | 'close' | 'restart';

/** Managing window controls (minimize, maximize, close). */
const WindowButtons = () => {
  const onFocus = useAppState('onFocus');
  const maximized = useAppState('maximized');

  const changeWindowState = useCallback((operation: WindowOperation) => rendererIpc.win.changeWinState(operation), []);

  const buttonProps = useMemo(
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
      {renderButton('minimize', <Minimize_Icon className="size-3" />, 'px-4 hover:bg-foreground-100')}
      {renderButton(
        'maximize',
        maximized ? <UnMaximize_Icon className="size-3" /> : <Maximize_Icon className="size-3" />,
        'px-4 hover:bg-foreground-100',
      )}
      <WindowButtons_Close buttonProps={buttonProps} commonStyles={BUTTONS_COMMON_STYLE} />
    </div>
  );
};

export default WindowButtons;
