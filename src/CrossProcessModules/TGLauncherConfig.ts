import path from 'path';
import fs from 'fs';
import {TGLaunchConfig} from '../AppState/InterfaceAndTypes';
import {
  GetBatchFileByName,
  GetDirectoryByName,
  GetFlagsFileName,
  GetLaunchSettingsByName,
  UpdateBatchFileByName,
  UpdateLaunchSettingByName,
} from '../main/AppManage/AppConfigManager';
import {MainLogError, MainLogInfo} from '../AppState/AppConstants';
import {isCheckBoxTGArg, isFileOrFolderTGArg, isValidTGArg} from './TGArgumentsFunctions';

const TGOobaLaunchConfig: TGLaunchConfig = {
  flags: [{id: '', value: ''}],
};

export function getTGLaunchConfig(): TGLaunchConfig {
  return TGOobaLaunchConfig;
}

export function resetTGLaunchConfig(): void {
  TGOobaLaunchConfig.flags = [{id: '', value: ''}];
}

const flagsFileName: string = 'CMD_FLAGS.txt';
const uiName: string = 'OOBABOOGA';

function createLaunchFlagsFile(): string {
  const localDir = GetDirectoryByName(uiName);
  const flagsFilePath: string = localDir ? path.join(localDir, flagsFileName) : '';

  fs.writeFileSync(flagsFilePath, '');

  UpdateBatchFileByName(uiName, flagsFileName, true);

  return flagsFilePath;
}

function getWebUiFlagsFilePath(): string {
  const localDir = GetDirectoryByName(uiName);
  const launcherFlagsName = GetFlagsFileName();

  let flagsFilePath: string = '';

  if (!launcherFlagsName && localDir) {
    flagsFilePath = path.join(localDir, flagsFileName);

    fs.access(flagsFilePath, fs.constants.F_OK, (error): void => {
      if (error) {
        console.log(MainLogInfo('getWebUiFlagsFilePath -> Creating Batch File'));
        flagsFilePath = createLaunchFlagsFile();
      }
    });
  } else if (localDir && launcherFlagsName) {
    flagsFilePath = path.join(localDir, launcherFlagsName);
  }
  console.log(MainLogInfo(`flagsFilePath -> ${flagsFilePath}`));
  return flagsFilePath;
}

export function getWebUiTGBatchFilePath(uiName: string): string {
  const batchFileName: string = 'start_windows.bat';

  const localDir = GetDirectoryByName(uiName);
  const launcherBatName = GetBatchFileByName(uiName);

  let batchFilePath: string = '';
  if (localDir) {
    batchFilePath = launcherBatName ? path.join(localDir, launcherBatName) : path.join(localDir, batchFileName);
  }

  if (launcherBatName !== batchFileName) UpdateBatchFileByName(uiName, batchFileName, true);

  return batchFilePath;
}

export function saveTGLaunchConfig(launchConfig: TGLaunchConfig, uiName: string): void {
  // Map launch configuration data to an object with environment and command line ids
  const mappedLaunchData: {flags: {id: string}[]} = {
    flags: launchConfig.flags.map((flagItem: {id: string; value: string}): {id: string} => ({id: flagItem.id})),
  };

  // Update selectedLaunchSettings Lynx config json with the mapped launch data
  UpdateLaunchSettingByName(uiName, JSON.stringify(mappedLaunchData), true);

  // Initialize the string to write to the batch file
  let flagFileData: string = '';

  // Construct the command line arguments part of the string
  launchConfig.flags.forEach((flagItem: {id: string; value: string}): void => {
    if (flagItem.value.startsWith('CheckBox')) {
      flagFileData += flagItem.value === 'CheckBox-true' ? `${flagItem.id} ` : '';
    } else if (isFileOrFolderTGArg(flagItem.id)) {
      flagFileData += `${flagItem.id} "${flagItem.value}" `;
    } else {
      flagFileData += `${flagItem.id} ${flagItem.value} `;
    }
  });

  // Write the constructed string to the batch file
  fs.writeFileSync(getWebUiFlagsFilePath(), flagFileData);

  // Log the operation
  console.log(MainLogInfo(`Saved ${flagFileData}`));
}

export function readTgLaunchData(): TGLaunchConfig {
  try {
    const data: string = fs.readFileSync(getWebUiFlagsFilePath(), 'utf-8');

    resetTGLaunchConfig();

    const lines: string[] = data.split('\n');

    lines.forEach((line: string): void => {
      // getTGLaunchConfig().flags.splice(0, 1);

      const args: string[] = line.split('--').filter(Boolean);

      const result: {id: string; value: string}[] = args.map((arg: string): {id: string; value: string} => {
        const [id, ...value] = arg.trim().split(' ');
        return {
          id: `--${id}`,
          value: value.join(' ').replace(/"/g, ''),
        };
      });

      result.forEach((value: {id: string; value: string}): void => {
        if (isValidTGArg(value.id)) {
          if (isCheckBoxTGArg(value.id)) {
            getTGLaunchConfig().flags.push({id: value.id, value: 'CheckBox-true'});
          } else {
            getTGLaunchConfig().flags.push({id: value.id, value: value.value});
          }
        }
      });
    });

    const savedLaunchSettings: string | undefined = GetLaunchSettingsByName(uiName);
    console.log(MainLogInfo(`0 TgTest -> ${JSON.stringify(savedLaunchSettings)}`));
    let savedLaunchData: {flags: {id: string}[]} = {flags: []};
    if (savedLaunchSettings) savedLaunchData = JSON.parse(savedLaunchSettings);
    console.log(MainLogInfo(`1 TgTest -> ${JSON.stringify(savedLaunchData)}`));

    savedLaunchData.flags.forEach((savedFlag: {id: string}): void => {
      if (savedFlag.id && !getTGLaunchConfig().flags.some((flagConfig: {id: string; value: string}): boolean => flagConfig.id === savedFlag.id)) {
        console.log(MainLogInfo(`2 TgTest -> ${JSON.stringify(savedFlag)}`));
        getTGLaunchConfig().flags.push({id: savedFlag.id, value: ''});
        console.log(MainLogInfo(`3 TgTest -> ${JSON.stringify(getTGLaunchConfig())}`));
      }
    });

    console.log(MainLogInfo(`Tg Config -> ${JSON.stringify(getTGLaunchConfig())}`));
  } catch (error) {
    console.log(MainLogError(`Tg Config -> ${error}`));
  }
  return getTGLaunchConfig();
}
