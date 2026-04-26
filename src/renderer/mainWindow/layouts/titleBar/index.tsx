import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useAppState} from '@lynx/redux/reducers/app';
import isEmpty from 'lodash/isEmpty';
import {memo, useMemo} from 'react';

import useInertRemover from '../../utils/useInertRemover';
import TabContainer from '../tabs';
import WindowButtons from './WindowButtons';

const TITLE_BAR_HEIGHT = 'h-10';
const BACKGROUND_CLASSES = {
  default: 'bg-neutral-300/10 dark:bg-neutral-900/10',
  focused: 'bg-neutral-300/70 dark:bg-neutral-900/70',
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

  const onRef = useInertRemover();

  return (
    <div
      className={
        `draggable absolute inset-x-0 top-0 z-50 flex ${TITLE_BAR_HEIGHT} flex-row items-center ` +
        ` justify-between overflow-hidden transition-colors duration-500 ${backgroundClass}`
      }
      ref={onRef}>
      {showWizard ? <div /> : <TabContainer />}

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
