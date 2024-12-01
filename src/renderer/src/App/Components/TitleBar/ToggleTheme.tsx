import {motion} from 'framer-motion';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {getIconByName} from '../../../assets/icons/SvgIconsContainer';
import {appActions, useAppState} from '../../Redux/App/AppReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import {getColor} from '../../Utils/Constants';
import LynxTooltip from '../Reusable/LynxTooltip';

const BUTTON_STYLE = {iconMargin: 'm-[7px]', width: 'w-[33px]'};
const ICON_COMMON_STYLE = `notDraggable fill-white ${BUTTON_STYLE.iconMargin}
 h-full w-full transition duration-300 group-hover:scale-110`;

/** Switching between light and dark modes. */
export default function ToggleTheme() {
  const dispatch = useDispatch<AppDispatch>();
  const darkMode = useAppState('darkMode');
  const onFocus = useAppState('onFocus');

  const handleToggle = useCallback(() => {
    dispatch(appActions.toggleAppState('darkMode'));
    rendererIpc.win.setDarkMode(darkMode ? 'light' : 'dark');
  }, [darkMode, dispatch]);

  const motionProps = useMemo(
    () => ({
      animate: {
        backgroundColor: getColor('black', 0),
        opacity: onFocus ? 1 : 0.5,
        transition: {duration: 0.5},
      },
      whileHover: {
        backgroundColor: darkMode ? getColor('white', 0.1) : getColor('black', 0.2),
        transition: {duration: 0.5},
      },
      whileTap: {
        backgroundColor: darkMode ? getColor('white', 0.3) : getColor('black', 0.4),
        borderRadius: '12px',
        scale: 0.7,
        transition: {duration: 0.1},
      },
    }),
    [darkMode, onFocus],
  );

  const icon = useMemo(
    () => getIconByName(darkMode ? 'DarkMode' : 'LightMode', {className: ICON_COMMON_STYLE}),
    [darkMode],
  );

  return (
    <LynxTooltip delay={700} content="Toggle Dark Mode">
      <motion.div
        {...motionProps}
        onClick={handleToggle}
        className={`notDraggable group ml-3 ${BUTTON_STYLE.width} flex rounded-md`}>
        {icon}
      </motion.div>
    </LynxTooltip>
  );
}
