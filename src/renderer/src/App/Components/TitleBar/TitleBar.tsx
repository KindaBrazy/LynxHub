import {memo, useMemo} from 'react';

import {useCardsState} from '../../Redux/AI/CardsReducer';
import {useAppState} from '../../Redux/App/AppReducer';
import Logo from './Logo';
import RunningCardManager from './RunningCardManager';
import ToggleTheme from './ToggleTheme';
import WindowButtons from './WindowButtons';

const TITLE_BAR_HEIGHT = 'h-10';
const BACKGROUND_CLASSES = {
  default: 'bg-LynxWhiteFifth/10 dark:bg-LynxRaisinBlack/10',
  focused: 'bg-LynxWhiteFifth/70 dark:bg-LynxRaisinBlack/70',
};

/**
 * TitleBar component for the application window.
 * Displays logo, theme toggle, running card manager, and window buttons.
 */
const TitleBar = memo(() => {
  const fullscreen = useAppState('fullscreen');
  const onFocus = useAppState('onFocus');
  const {isRunning: isCardRunning} = useCardsState('runningCard');

  const backgroundClass = useMemo(() => {
    return fullscreen || !onFocus ? BACKGROUND_CLASSES.default : BACKGROUND_CLASSES.focused;
  }, [fullscreen, onFocus]);

  return (
    <div
      className={
        `draggable absolute inset-x-0 top-0 z-50 flex ${TITLE_BAR_HEIGHT} flex-row items-center ` +
        ` justify-between overflow-hidden transition-colors duration-500 ${backgroundClass} `
      }>
      <div className="flex h-full items-center">
        {!fullscreen && <Logo />}

        <ToggleTheme />
      </div>

      {isCardRunning && <RunningCardManager />}

      {fullscreen ? <div /> : <WindowButtons />}
    </div>
  );
});

export default TitleBar;
