import {Alert, Button} from '@heroui/react';
import {ReactNode, useEffect, useMemo} from 'react';

import rendererIpc from '../../../RendererIpc';
import useRequirementChecks from '../hooks/useRequirementChecks';
import CheckRow from './CheckRow';

const isWin = window.osPlatform === 'win32';

type Props = {
  onStatusChange: (isSatisfied: boolean) => void;
  onReport: (report: {git: string; pwsh: string; appModule: string}) => void;
};

export default function RequirementsChecker({onStatusChange, onReport}: Props) {
  const {statuses, isSuccess, hasFailure, failureType, skipAppModule, checkAll} = useRequirementChecks();

  useEffect(() => {
    checkAll();
  }, [checkAll]);

  useEffect(() => {
    onStatusChange(isSuccess);
    if (isSuccess) {
      onReport({
        git: statuses.git.label || 'Ready',
        pwsh: isWin ? statuses.pwsh.label || 'Ready' : 'N/A',
        appModule: statuses.appModule.result === 'ok' ? 'Installed' : 'Skipped',
      });
    }
  }, [isSuccess, onStatusChange, onReport, statuses]);

  const AlertElement: ReactNode = useMemo(() => {
    if (!hasFailure) return null;

    const commonProps = {className: 'mt-4', classNames: {title: 'text-sm', description: 'text-xs'}};

    switch (failureType) {
      case 'git':
        return (
          <Alert
            {...commonProps}
            endContent={
              <Button
                size="sm"
                variant="flat"
                color="danger"
                onPress={() => rendererIpc.win.openUrlDefaultBrowser('https://git-scm.com/downloads')}>
                Download Git
              </Button>
            }
            color="danger"
            title="Git is Missing"
            description="Git is required for core functionalities. Please install it."
          />
        );
      case 'pwsh':
        return (
          <Alert
            {...commonProps}
            endContent={
              <Button
                onPress={() =>
                  rendererIpc.win.openUrlDefaultBrowser('https://github.com/PowerShell/PowerShell/releases/latest')
                }
                size="sm"
                variant="flat"
                color="warning">
                Download
              </Button>
            }
            color="warning"
            title="PowerShell 7+ is Missing"
            description="PowerShell 7+ is required. Please install it to continue."
          />
        );
      case 'appModule':
        return (
          <Alert
            {...commonProps}
            endContent={
              <Button size="sm" color="default" onPress={skipAppModule}>
                Skip for now
              </Button>
            }
            color="default"
            title="Main Module Failed"
            description="You can skip this and install it manually from the Plugins page later."
          />
        );
      default:
        return null;
    }
  }, [hasFailure, failureType, skipAppModule]);

  return (
    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl h-full flex flex-col">
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Requirements</h3>
      <div className="space-y-4 flex-1">
        <CheckRow label="Git" status={statuses.git} description="Required for version control features" />
        {isWin && (
          <CheckRow
            label="PowerShell 7+"
            status={statuses.pwsh}
            description="Required for Windows scripts (pwsh v7+)"
          />
        )}
        <CheckRow
          label="Main Module"
          status={statuses.appModule}
          description="Provides core local AI functionalities"
        />
      </div>
      <div>{AlertElement}</div>
    </div>
  );
}
