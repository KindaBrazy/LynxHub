import {isNil} from 'lodash';
import {memo, useMemo} from 'react';

import {extensionsData} from '../Extensions/ExtensionLoader';

const Background = memo(() => {
  const BG = useMemo(() => extensionsData.replaceBackground, []);

  return !isNil(BG) ? (
    <BG />
  ) : (
    <div className="absolute inset-0 bg-GradientLight dark:bg-GradientDark">
      <div className={'absolute inset-0 blur-[51px] dark:bg-cyan-700/5'} />
    </div>
  );
});

export default Background;
