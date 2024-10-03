import {motion} from 'framer-motion';
import {useMemo} from 'react';

import {useCardsState} from '../../Redux/AI/CardsReducer';

const variants = {
  init: {scale: 0.95, opacity: 0},
  animate: {scale: 1, opacity: 1},
  exit: {scale: 0.95, opacity: 0},
};

/** Browser component that renders AI address in an iframe. */
export default function Browser() {
  const {address, browserId, currentView} = useCardsState('runningCard');

  const animate = useMemo(() => {
    return currentView === 'browser' ? 'animate' : 'exit';
  }, [currentView]);

  return (
    <motion.div
      className={
        `absolute inset-2 ${currentView === 'browser' && 'z-20'} overflow-hidden ` +
        `rounded-lg bg-white shadow-md dark:bg-LynxRaisinBlack`
      }
      tabIndex={-1}
      initial="init"
      animate={animate}
      variants={variants}>
      <webview src={address} id={browserId} className="relative size-full" />
    </motion.div>
  );
}
