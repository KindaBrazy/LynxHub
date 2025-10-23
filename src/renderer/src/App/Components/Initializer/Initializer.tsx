import {AnimatePresence, motion} from 'framer-motion';

import {useAppState} from '../../Redux/Reducer/AppReducer';
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
              `relative w-[80vw] ${!isUpgradeFlow && 'h-[85vh] min-h-[600px]'} min-w-[840px] max-w-[1200px]` +
              ' max-h-[800px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden'
            }
            animate={{scale: 1, y: 0, opacity: 1}}
            exit={{scale: 0.95, y: 20, opacity: 0}}
            initial={{scale: 0.95, y: 20, opacity: 0}}
            transition={{duration: 0.4, ease: 'easeOut'}}>
            {/* New Modern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30">
              <div
                className={
                  'absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full' +
                  ' bg-[radial-gradient(circle_farthest-side,rgba(0,120,255,0.4),rgba(255,255,255,0))]'
                }
              />
              <div
                className={
                  'absolute bottom-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full' +
                  ' bg-[radial-gradient(circle_farthest-side,rgba(255,0,180,0.3),rgba(255,255,255,0))]'
                }
              />
            </div>

            <OnboardingWizard isUpgradeFlow={isUpgradeFlow} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
