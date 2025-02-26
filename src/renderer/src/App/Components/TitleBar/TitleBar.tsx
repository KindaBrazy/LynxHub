import isEmpty from 'lodash/isEmpty';
import {memo, useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useAppState} from '../../Redux/App/AppReducer';
import TabContainer from '../Tabs/TabContainer';
import WindowButtons from './WindowButtons';

const TITLE_BAR_HEIGHT = 'h-10';
const BACKGROUND_CLASSES = {
  default: 'bg-LynxWhiteFifth/10 dark:bg-LynxRaisinBlack/10 border-b border-foreground/0',
  focused: 'bg-LynxWhiteFifth/70 dark:bg-LynxRaisinBlack/70 border-b border-foreground-100',
};

/**
 * TitleBar component for the application window.
 * Displays logo, theme toggle, running card manager, and window buttons.
 */
const TitleBar = memo(() => {
  const titleBar = useMemo(() => extensionsData.titleBar, []);

  const fullscreen = useAppState('fullscreen');
  const onFocus = useAppState('onFocus');

  const backgroundClass = useMemo(() => {
    return fullscreen || !onFocus ? BACKGROUND_CLASSES.default : BACKGROUND_CLASSES.focused;
  }, [fullscreen, onFocus]);

  return (
    <div
      className={
        `draggable absolute inset-x-0 top-0 z-50 flex ${TITLE_BAR_HEIGHT} flex-row items-center ` +
        ` justify-between overflow-hidden transition-colors duration-500 ${backgroundClass} `
      }>
      <TabContainer />

      {fullscreen ? (
        <div>{!isEmpty(titleBar.addEnd) && titleBar.addEnd.map((End, index) => <End key={index} />)}</div>
      ) : !isEmpty(titleBar.replaceEnd) ? (
        <titleBar.replaceEnd />
      ) : (
        <WindowButtons />
      )}
    </div>
  );
});

export default TitleBar;
