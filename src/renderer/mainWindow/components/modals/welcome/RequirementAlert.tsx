import {Alert, Button, buttonVariants, Link} from '@heroui-v3/react';
import applicationIpc from '@lynx_shared/ipc/application';

import {FailureType} from './types';

type Props = {
  failureType: FailureType;
  skipAppModule: () => void;
};

const GitUrl = 'https://git-scm.com/downloads';
const PWS7ReleasePage = 'https://github.com/PowerShell/PowerShell/releases/latest';

export default function RequirementAlert({failureType, skipAppModule}: Props) {
  if (!failureType) return null;

  switch (failureType) {
    case 'git':
      return (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Git is Missing</Alert.Title>
            <Alert.Description>Git is required for core functionalities. Please install it.</Alert.Description>
          </Alert.Content>
          <Link
            className={buttonVariants({variant: 'primary', size: 'sm'})}
            onPress={() => applicationIpc.send.openUrlDefaultBrowser(GitUrl)}>
            Releases
            <Link.Icon />
          </Link>
        </Alert>
      );
    case 'pwsh':
      return (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>PowerShell 7+ is Missing</Alert.Title>
            <Alert.Description>PowerShell 7+ is required. Please install it to continue.</Alert.Description>
          </Alert.Content>
          <Link
            className={buttonVariants({variant: 'primary', size: 'sm'})}
            onPress={() => applicationIpc.send.openUrlDefaultBrowser(PWS7ReleasePage)}>
            Releases
            <Link.Icon />
          </Link>
        </Alert>
      );
    case 'appModule':
      return (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Failed to install Main Module</Alert.Title>
            <Alert.Description>
              You can skip this and install it manually from the Plugins page later.
            </Alert.Description>
          </Alert.Content>
          <Button size="sm" onPress={skipAppModule}>
            Skip for now
          </Button>
        </Alert>
      );
    default:
      return null;
  }
}
