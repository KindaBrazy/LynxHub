import _ from 'lodash';

import {ArgumentsData, CardInfoApi, CardInfoCallback, InstallationStepper} from '../../../src/cross/plugin/ModuleTypes';
import {DescriptionManager, formatSize} from './CrossUtils';

export function isValidArg(name: string, Arguments: ArgumentsData): boolean {
  if (_.isEmpty(name)) return false;
  for (const argument of Arguments) {
    if ('sections' in argument) {
      for (const section of argument.sections) {
        if (section.items.some(item => item.name === name)) return true;
      }
    } else {
      if (argument.items.some(item => item.name === name)) return true;
    }
  }
  return false;
}

export function getArgumentByName(name: string, Arguments: ArgumentsData) {
  if (_.isEmpty(name)) return undefined;
  for (const argument of Arguments) {
    if ('sections' in argument) {
      for (const section of argument.sections) {
        const found = section.items.find(item => item.name === name);
        if (found) return found;
      }
    } else {
      const found = argument.items.find(item => item.name === name);
      if (found) return found;
    }
  }
  return undefined;
}

export function getArgumentType(name: string, Arguments: ArgumentsData) {
  return getArgumentByName(name, Arguments)?.type || undefined;
}

export function replaceAddress(input: string): string {
  return input.replace(/http:\/\/0\.0\.0\.0:(\d+)/g, 'http://localhost:$1');
}

export function catchAddress(input: string): string | undefined {
  const localhostPatterns = [
    /https?:\/\/localhost(?::\d+)?/i,
    /https?:\/\/127\.0\.0\.1(?::\d+)?/i,
    /https?:\/\/0\.0\.0\.0(?::\d+)?/i,
    /https?:\/\/\[::1](?::\d+)?/i,
    /https?:\/\/(?:[\w-]+\.)*localhost(?::\d+)?/i,
  ];

  for (const pattern of localhostPatterns) {
    const match = input.match(pattern);
    if (match) {
      return replaceAddress(match[0]);
    }
  }

  return undefined;
}

export function removeEscapes(str: string) {
  return str.replace(/\\(.)/gm, '$1');
}

export function GitInstaller(title: string, url: string, stepper: InstallationStepper) {
  stepper.initialSteps([title, 'Clone', 'Finish']);
  stepper.starterStep().then(({targetDirectory, chosen}) => {
    if (chosen === 'install') {
      stepper.nextStep();
      stepper.cloneRepository(url).then(dir => {
        stepper.setInstalled(dir);
        stepper.showFinalStep(
          'success',
          `${title} installation complete!`,
          `All installation steps completed successfully. Your ${title} environment is now ready for use.`,
        );
      });
    } else if (targetDirectory) {
      stepper.utils.validateGitRepository(targetDirectory, url).then(isValid => {
        if (isValid) {
          stepper.setInstalled(targetDirectory);
          stepper.showFinalStep(
            'success',
            `${title} located successfully!`,
            `Pre-installed ${title} detected. Installation skipped as your existing setup is ready to use.`,
          );
        } else {
          stepper.showFinalStep(
            'error',
            `Unable to locate ${title}!`,
            `Please ensure you have selected the correct folder containing the ${title} repository.`,
          );
        }
      });
    }
  });
}

export async function CardInfo(
  url: string,
  extensionFolder: string | undefined,
  api: CardInfoApi,
  callback: CardInfoCallback,
) {
  const dir = api.installationFolder;
  if (!dir) return;

  callback.setOpenFolders([dir]);

  const descManager = new DescriptionManager(
    [
      {
        title: 'Installation Data',
        items: [
          {label: 'Installed On', result: 'loading'},
          {label: 'Last Updated', result: 'loading'},
          {label: 'Update Tag', result: 'loading'},
          {label: 'Release Notes', result: 'loading'},
        ],
      },
      {
        title: 'Disk Usage',
        items: [
          {label: 'Total Size', result: 'loading'},
          {label: 'Extensions Size', result: 'loading'},
        ],
      },
    ],
    callback,
  );

  api.getFolderCreationTime(dir).then(result => {
    descManager.updateItem(0, 0, result);
  });
  api.getLastPulledDate(dir).then(result => {
    descManager.updateItem(0, 1, result);
  });
  api.getCurrentReleaseTag(dir).then(result => {
    if (result && result !== 'No tag found') {
      descManager.updateItem(0, 2, result);
      descManager.updateItem(0, 3, `${url}/releases/tag/${result}`);
    } else {
      descManager.updateItem(0, 2, undefined);
      descManager.updateItem(0, 3, undefined);
    }
  });
  if (extensionFolder) {
    api.getFolderSize(dir + extensionFolder).then(result => {
      descManager.updateItem(1, 1, formatSize(result));
    });
  } else {
    descManager.updateItem(1, 1, undefined);
  }
  api.getFolderSize(dir).then(result => {
    descManager.updateItem(1, 0, formatSize(result));
  });
}
