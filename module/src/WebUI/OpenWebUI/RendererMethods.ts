import {
  ArgType,
  CardInfoApi,
  CardInfoCallback,
  CardRendererMethods,
  ChosenArgument,
  DataSection,
  InstallationStepper,
} from '../../../../src/cross/plugin/ModuleTypes';
import {DescriptionManager, isWin} from '../../utils/CrossUtils';
import {getArgumentType, isValidArg, removeEscapes, replaceAddress} from '../../utils/RendererUtils';
import openArguments from './Arguments';

const INSTALL_TIME_KEY = 'install-time-openwebui';
const UPDATE_TIME_KEY = 'update-time-openwebui';
const UPDATE_AVAILABLE_KEY = 'update-available-version-openwebui';

function checkLinuxArgLine(line: string): 'set' | 'export' | 'var' | undefined {
  if (isWin && line.startsWith('set ')) return 'set';

  if (line.startsWith('export ')) return 'export';

  for (const arg of openArguments) {
    if (arg.category === 'Environment') {
      if ((arg as DataSection).sections[0].items.find(item => item.name === line.split('=')[0])) {
        return 'var';
      } else {
        return undefined;
      }
    }
  }

  return undefined;
}

export function parseArgsToString(args: ChosenArgument[]): string {
  let result: string = isWin ? '@echo off\n\n' : '#!/bin/bash\n\n';
  let cmArgs: string = '';

  args.forEach(arg => {
    if (arg.name === 'PORT') {
      cmArgs = `--port ${arg.value}`;
      return;
    }

    if (getArgumentType(arg.name, openArguments) === 'CheckBox') {
      const eWinResult: string = `set ${arg.name}=true\n`;
      const eResult: string = `export ${arg.name}="true"\n`;
      result += isWin ? eWinResult : eResult;
    } else {
      const eWinResult: string = `set ${arg.name}=${arg.value}\n`;
      const eResult: string = `export ${arg.name}="${arg.value}"\n`;
      result += isWin ? eWinResult : eResult;
    }
  });

  result += isWin ? `\nopen-webui serve ${cmArgs}` : `open-webui serve ${cmArgs}`;

  return result;
}

export function parseStringToArgs(args: string): ChosenArgument[] {
  const argResult: ChosenArgument[] = [];
  const lines: string[] = args.split('\n');

  lines.forEach((line: string): void => {
    if (line.startsWith('#')) {
      return;
    }

    if (line.startsWith('open-webui serve')) {
      const clArg: string = line.split('open-webui serve ')[1];
      if (!clArg) return;

      const clArgs: string[] = clArg.split('--').filter(Boolean);

      const result: ArgType[] = clArgs.map((arg: string): ArgType => {
        const [id, ...value] = arg.trim().split(' ');
        return {
          name: `${id}`.toUpperCase(),
          value: value.join(' ').replace(/"/g, ''),
        };
      });

      result.forEach((value: ArgType): void => {
        if (isValidArg(value.name, openArguments)) {
          if (getArgumentType(value.name, openArguments) === 'CheckBox') {
            argResult.push({name: value.name, value: ''});
          } else {
            argResult.push({name: value.name, value: value.value});
          }
        }
      });
    }

    const lineType = checkLinuxArgLine(line);
    if (lineType === 'export' || lineType === 'set') {
      let [name, value] = line.replace(`${lineType} `, '').split('=');
      name = removeEscapes(name.trim());
      value = removeEscapes(value.trim());
      if (isValidArg(name, openArguments)) {
        argResult.push({name, value});
      }
    } else if (checkLinuxArgLine(line) === 'var') {
      let [name, value] = line.split('=');
      name = removeEscapes(name.trim());
      value = removeEscapes(value.trim());
      if (isValidArg(name, openArguments)) {
        argResult.push({name, value});
      }
    }
  });

  return argResult;
}

function startInstall(stepper: InstallationStepper) {
  stepper.initialSteps(['Getting Started', 'Detect Existing', 'Install Open WebUI', 'All Done!']);
  stepper.starterStep({disableSelectDir: true}).then(() => {
    stepper.nextStep();
    stepper.progressBar(true, 'Checking for existing Open WebUI installation...');
    stepper.ipc.invoke('is_openwebui_installed').then((isInstalled: boolean) => {
      if (isInstalled) {
        stepper.setInstalled();
        const currentDate = new Date();
        stepper.storage.set(INSTALL_TIME_KEY, currentDate.toLocaleString());
        stepper.showFinalStep('success', "You're All Set!", "Open WebUI is already installed. You're good to go!");
      } else {
        stepper.nextStep();
        stepper.executeTerminalCommands('pip install open-webui').then(() => {
          stepper.setInstalled();
          const currentDate = new Date();
          stepper.storage.set(INSTALL_TIME_KEY, currentDate.toLocaleString());
          stepper.showFinalStep('success', 'Installation Complete!', 'Your Open WebUI environment is ready. Enjoy!');
        });
      }
    });
  });
}

function startUpdate(stepper: InstallationStepper) {
  stepper.initialSteps(['Update Open WebUI', 'Complete Update']);
  stepper.executeTerminalCommands('pip install --upgrade open-webui').then(() => {
    const currentDate = new Date();
    stepper.storage.set(UPDATE_TIME_KEY, currentDate.toLocaleString());
    stepper.setUpdated();
    stepper.showFinalStep(
      'success',
      'Open WebUI Updated Successfully!',
      `Open WebUI has been updated to the latest version. You can now enjoy the new features and improvements.`,
    );
  });
}

async function cardInfo(api: CardInfoApi, callback: CardInfoCallback) {
  callback.setOpenFolders(undefined);

  const descManager = new DescriptionManager(
    [
      {
        title: 'Installation Data',
        items: [
          {label: 'Install Date', result: 'loading'},
          {label: 'Update Date', result: 'loading'},
          {label: 'Current Version', result: 'loading'},
          {label: 'Latest Version', result: 'loading'},
        ],
      },
    ],
    callback,
  );

  api.storage.get(INSTALL_TIME_KEY).then(result => {
    descManager.updateItem(0, 0, result);
  });
  api.storage.get(UPDATE_TIME_KEY).then(result => {
    descManager.updateItem(0, 1, result);
  });
  api.ipc.invoke('current_openwebui_version').then(result => {
    descManager.updateItem(0, 2, result);
  });
  api.storage.get(UPDATE_AVAILABLE_KEY).then(result => {
    descManager.updateItem(0, 3, result);
  });
}

function catchAddress(input: string): string | undefined {
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
    } else if (input.toLowerCase().includes('started server process')) {
      return 'http://localhost:8080';
    }
  }

  return undefined;
}

const OPEN_WEBUI_RM: CardRendererMethods = {
  catchAddress,
  cardInfo,
  parseStringToArgs,
  parseArgsToString,
  manager: {startInstall, updater: {updateType: 'stepper', startUpdate}},
};

export default OPEN_WEBUI_RM;
