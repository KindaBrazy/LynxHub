import {Button} from '@heroui/react';
import {motion} from 'framer-motion';
import {useMemo, useState} from 'react';

import PluginSelector from '../components/PluginSelector';
import RequirementsChecker from '../components/RequirementsChecker';
import {RequirementStatus} from '../types';

const containerVariants = {
  hidden: {opacity: 0, y: 20},
  enter: {opacity: 1, y: 0, transition: {staggerChildren: 0.1, delayChildren: 0.2}},
  exit: {opacity: 0, y: -20},
};

const itemVariants = {
  hidden: {opacity: 0, y: 10},
  enter: {opacity: 1, y: 0},
};

type Props = {
  onNext: () => void;
  setInstalledPlugins: (plugins: string[]) => void;
  setRequirementStatus: (status: RequirementStatus) => void;
};

export default function StepSystemCheck({onNext, setInstalledPlugins, setRequirementStatus}: Props) {
  const [requirementsSatisfied, setRequirementsSatisfied] = useState(false);
  const [isInstallingPlugins, setIsInstallingPlugins] = useState(false);

  const canContinue = useMemo(
    () => requirementsSatisfied && !isInstallingPlugins,
    [requirementsSatisfied, isInstallingPlugins],
  );

  const continueButtonText = useMemo(() => {
    if (canContinue) return 'Continue';
    if (isInstallingPlugins) return 'Installing Extensions...';
    return 'Requirements must pass to continue';
  }, [canContinue, isInstallingPlugins]);

  return (
    <motion.div
      exit="exit"
      animate="enter"
      initial="hidden"
      key="system-check"
      variants={containerVariants}
      className="h-full flex flex-col">
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">System Check & Extensions</h2>
        <p className="text-md text-gray-600 dark:text-gray-300 mb-6">
          Checking if all requirements are met and letting you pick some useful extensions to start with.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
        <motion.div variants={itemVariants} className="overflow-y-auto">
          <RequirementsChecker onReport={setRequirementStatus} onStatusChange={setRequirementsSatisfied} />
        </motion.div>
        <motion.div variants={itemVariants} className="overflow-y-auto">
          <PluginSelector
            isInstalling={isInstallingPlugins}
            setInstalling={setIsInstallingPlugins}
            setInstalledPlugins={setInstalledPlugins}
            requirementsSatisfied={requirementsSatisfied}
          />
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="flex justify-end items-center pt-6">
        <Button color="primary" onPress={onNext} isDisabled={!canContinue}>
          {continueButtonText}
        </Button>
      </motion.div>
    </motion.div>
  );
}
