import {AnimatePresence, motion} from 'framer-motion';

import {useAppState} from '../../../../redux/reducers/app';
import Background from './Background';
import OnboardingWizard from './OnboardingWizard';

export default function Initializer() {
  const {showWizard, isUpgradeFlow} = useAppState('initializer');

  return (
    <AnimatePresence>
      {showWizard && (
        <motion.div
          exit={{opacity: 0}}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.3}}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            className={
              `relative w-[85vw] ${!isUpgradeFlow && 'h-[85vh] min-h-150'} min-w-210 max-w-300` +
              ' max-h-200 bg-white dark:bg-gray-900 rounded-4xl overflow-hidden'
            }
            animate={{scale: 1, y: 0, opacity: 1}}
            exit={{scale: 0.95, y: 20, opacity: 0}}
            initial={{scale: 0.95, y: 20, opacity: 0}}
            transition={{duration: 0.4, ease: 'easeOut'}}>
            <Background />

            <OnboardingWizard isUpgradeFlow={isUpgradeFlow} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
