import {memo} from 'react';

const Background = memo(() => {
  return <div className="absolute inset-0 bg-GradientLight dark:bg-GradientDark" />;
});

export default Background;
