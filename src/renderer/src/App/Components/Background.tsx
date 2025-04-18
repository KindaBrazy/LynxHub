import {isNil} from 'lodash';
import {memo, useMemo} from 'react';

import {extensionsData} from '../Extensions/ExtensionLoader';

const Background = memo(() => {
  const BG = useMemo(() => extensionsData.replaceBackground, []);

  return !isNil(BG) ? <BG /> : <div className="absolute inset-0 bg-GradientLight dark:bg-GradientDark" />;
});

export default Background;
