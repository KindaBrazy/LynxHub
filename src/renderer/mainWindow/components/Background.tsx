import {extensionsData} from '@lynx/plugins/extensions/loader';
import {isNil} from 'lodash-es';
import {memo} from 'react';

/**
 * Background component for the main window.
 * Renders a custom background from extensions if available, otherwise renders the default background.
 */
const Background = memo(() => {
  const BG = extensionsData.replaceBackground;

  return !isNil(BG) ? <BG /> : <div className="absolute inset-0 bg-surface" />;
});

export default Background;
