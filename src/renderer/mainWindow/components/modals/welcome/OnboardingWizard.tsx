import {APP_ICON_TRANSPARENT, APP_NAME} from '@lynx_common/consts';
import applicationIpc from '@lynx_shared/ipc/application';
import storageIpc from '@lynx_shared/ipc/storage';
import {AnimatePresence} from 'framer-motion';
import {useCallback, useState} from 'react';

import StepComplete from './CompletedStep';
import StepSystemCheck from './SystemCheckStep';
import {RequirementStatus} from './types';
import StepUpdate from './UpdateStep';
import StepWelcome from './WelcomeStep';

type Props = {
  isUpgradeFlow: boolean;
};

export default function OnboardingWizard({isUpgradeFlow}: Props) {
  const [step, setStep] = useState<number>(isUpgradeFlow ? 99 : 0); // 99 for upgrade flow
  const [installedPlugins, setInstalledPlugins] = useState<string[]>([]);
  const [requirementStatus, setRequirementStatus] = useState<RequirementStatus | null>(null);

  const completeOnboarding = useCallback(() => {
    storageIpc.update('app', {inited: true});
    applicationIpc.send.changeWinState('restart');
  }, []);

  const handleNextStep = () => setStep(prev => prev + 1);

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepWelcome onNext={handleNextStep} />;
      case 1:
        return (
          <StepSystemCheck
            onNext={handleNextStep}
            installedPlugins={installedPlugins}
            setInstalledPlugins={setInstalledPlugins}
            setRequirementStatus={setRequirementStatus}
          />
        );
      case 2:
        return (
          <StepComplete
            onComplete={completeOnboarding}
            installedPlugins={installedPlugins}
            requirementStatus={requirementStatus}
          />
        );
      case 99: // Special step for returning users on Windows
        return <StepUpdate onComplete={completeOnboarding} />;
      default:
        return <StepWelcome onNext={handleNextStep} />;
    }
  };

  return (
    <div className="relative z-10 size-full flex flex-col">
      <header className="flex items-center justify-between p-6 shrink-0">
        <div className="flex items-center gap-3">
          <img alt="App Logo" className="size-10" src={APP_ICON_TRANSPARENT} />
          <div>
            <h1 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{APP_NAME}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Setup Assistant</p>
          </div>
        </div>
        {!isUpgradeFlow && (
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Step {step + 1} of 3</div>
        )}
      </header>

      <main className="flex-1 px-8 pb-8 overflow-y-auto">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </main>
    </div>
  );
}
