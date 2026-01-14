import {Button} from '@heroui/react';
import isEmpty from 'lodash/isEmpty';
import {memo, useMemo} from 'react';

import {Home_Icon} from '../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useAppState} from '../../Redux/Reducer/AppReducer';
import TabContainer from '../Tabs/TabContainer';
import WindowButtons from './WindowButtons';

const TITLE_BAR_HEIGHT = 'h-10';
const BACKGROUND_CLASSES = {
  default: 'bg-LynxWhiteFifth/10 dark:bg-LynxNearBlack/10 border-b border-foreground/0',
  focused: 'bg-LynxWhiteFifth/70 dark:bg-LynxNearBlack/50 border-b border-foreground-100',
};

/**
 * TitleBar component for the application window.
 * Displays logo, theme toggle, running card manager, and window buttons.
 */
const TitleBar = memo(() => {
  const {showWizard} = useAppState('initializer');

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
      {showWizard ? (
        <Button
          className={
            'pr-2 notDraggable text-small pl-2 flex rounded-t-lg! rounded-b-none! flex-row cursor-default' +
            ' gap-x-0 bg-white dark:bg-[#303033] ml-0.5 mt-1'
          }
          variant="light">
          <div className="flex gap-x-1 flex-row items-center min-w-0 flex-1">
            <Home_Icon />
            <span>Initializer</span>
          </div>
        </Button>
      ) : (
        <TabContainer />
      )}

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
