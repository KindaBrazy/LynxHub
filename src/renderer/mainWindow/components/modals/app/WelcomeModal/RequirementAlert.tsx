import {Alert, Button} from '@heroui/react';
import applicationIpc from '@lynx_shared/ipc/application';

import {FailureType} from './types';

type Props = {
  failureType: FailureType;
  skipAppModule: () => void;
};

export default function RequirementAlert({failureType, skipAppModule}: Props) {
  if (!failureType) return null;

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
              onPress={() => applicationIpc.send.openUrlDefaultBrowser('https://git-scm.com/downloads')}>
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
                applicationIpc.send.openUrlDefaultBrowser('https://github.com/PowerShell/PowerShell/releases/latest')
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
}
