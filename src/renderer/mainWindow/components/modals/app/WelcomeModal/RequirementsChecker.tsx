import {isWin} from '@lynx_common/utils';
import {useEffect} from 'react';

import CheckRow from './CheckRow';
import RequirementAlert from './RequirementAlert';
import {RequirementStatus} from './types';
import useRequirementChecks from './useRequirementChecks';

type Props = {
  onStatusChange: (isSatisfied: boolean) => void;
  onReport: (report: RequirementStatus) => void;
};

export default function RequirementsChecker({onStatusChange, onReport}: Props) {
  const {statuses, isSuccess, failureType, skipAppModule, checkAll} = useRequirementChecks();

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

  return (
    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl h-full flex flex-col">
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
      <div>
        <RequirementAlert failureType={failureType} skipAppModule={skipAppModule} />
      </div>
    </div>
  );
}
