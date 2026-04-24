import {Button} from '@heroui-v3/react';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useAppState} from '@lynx/redux/reducers/app';
import {HomePage_Icon} from '@lynx_assets/icons/pages';
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
      {showWizard ? (
        <Button
          className={
            'pr-2 notDraggable text-small pl-2 flex rounded-t-xl! rounded-b-none! flex-row cursor-default' +
            ' gap-x-0 bg-white dark:bg-[#303033] ml-0.5 mt-1'
          }
          variant="ghost">
          <div className="flex gap-x-1 flex-row items-center min-w-0 flex-1">
            <HomePage_Icon />
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
