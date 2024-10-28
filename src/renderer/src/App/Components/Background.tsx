import {memo} from 'react';

import {useExtensions} from '../Extensions/ExtensionsContext';

const Background = memo(() => {
  const {background} = useExtensions();

  return background ? (
    <>{background}</>
  ) : (
    <div className="absolute inset-0 bg-GradientLight dark:bg-GradientDark">
      <div className={'absolute inset-0 blur-[51px] dark:bg-cyan-700/5'} />
    </div>
  );
});

export default Background;
