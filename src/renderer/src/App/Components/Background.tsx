import {memo} from 'react';

const Background = memo(() => {
  return (
    <div className="absolute inset-0 bg-GradientLight dark:bg-GradientDark">
      <div className={'absolute inset-0 blur-[51px] dark:bg-cyan-700/10'} />
    </div>
  );
});

export default Background;
