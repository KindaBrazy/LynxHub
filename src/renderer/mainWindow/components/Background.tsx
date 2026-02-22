import {extensionsData} from '@lynx/plugins/extensions/loader';
import {isNil} from 'lodash';
import {memo} from 'react';

/**
 * Background component for the main window.
 * Renders a custom background from extensions if available, otherwise renders the default background.
 */
const Background = memo(() => {
  const BG = extensionsData.replaceBackground;

  return !isNil(BG) ? (
    <BG />
  ) : (
    <div className="absolute inset-0 bg-white dark:bg-LynxNearBlack">
      <div className="bg-cyan-300 size-60 rounded-full top-10 absolute right-8" />
      <div className="bg-primary size-60 rounded-full top-44 absolute left-18" />
      <div className="bg-secondary size-60 rounded-full top-120 absolute left-1/2" />

      <div className="absolute inset-0 bg-white/75 dark:bg-LynxNearBlack/85 backdrop-blur-[200px]" />
    </div>
  );
});

export default Background;
