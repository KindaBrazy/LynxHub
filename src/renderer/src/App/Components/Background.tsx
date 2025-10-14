import {isNil} from 'lodash';
import {memo, useMemo} from 'react';

import {extensionsData} from '../Extensions/ExtensionLoader';

const Background = memo(() => {
  const BG = useMemo(() => extensionsData.replaceBackground, []);

  return !isNil(BG) ? (
    <BG />
  ) : (
    <div className="absolute inset-0 bg-white dark:bg-LynxRaisinBlack">
      <div className="bg-cyan-300 size-60 rounded-full top-10 absolute right-8" />
      <div className="bg-primary size-60 rounded-full top-44 absolute left-18" />
      <div className="bg-secondary size-60 rounded-full top-[30rem] absolute left-1/2" />

      <div className="absolute inset-0 bg-white/75 dark:bg-LynxRaisinBlack/80 backdrop-blur-[200px]" />
    </div>
  );
});

export default Background;
