import {Button} from '@heroui/react';
import {APP_NAME} from '@lynx_common/consts';
import {motion, Variants} from 'framer-motion';

const containerVariants: Variants = {
  hidden: {opacity: 0, y: 20},
  enter: {opacity: 1, y: 0, transition: {duration: 0.5, ease: 'easeOut'}},
  exit: {opacity: 0, y: -20, transition: {duration: 0.3, ease: 'easeIn'}},
};

type Props = {onNext: () => void};

export default function StepWelcome({onNext}: Props) {
  return (
    <motion.div
      exit="exit"
      key="welcome"
      animate="enter"
      initial="hidden"
      variants={containerVariants}
      className="flex flex-col items-center justify-center h-full text-center">
      <motion.h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to {APP_NAME}
      </motion.h1>
      <motion.p className="max-w-xl text-lg text-gray-600 dark:text-gray-300 mb-8">
        Thanks for installing {APP_NAME}! I'll walk you through a quick setup to check for necessary tools and
        extensions.
      </motion.p>
      <Button size="lg" onPress={onNext} className="font-semibold w-34 h-12">
        Get Started
      </Button>
    </motion.div>
  );
}
