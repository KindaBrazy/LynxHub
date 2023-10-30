/** This module handles reading and writes the launch configuration data to a batch file.
 The launch configuration consists of environment variables and command line arguments.
 The launch data is read from the batch file on startup and written back to the batch file when changed.
 The batch file is then used to launch the stable diffusion webui. */
// Import node modules
import fs from 'fs';
import path from 'path';
// Import app utils
import {
  GetBatchFileByName,
  GetDirectoryByName,
  GetLaunchSettingsByName,
  UpdateBatchFileByName,
  UpdateLaunchSettingByName,
} from '../main/AppManage/AppConfigManager';
import {MainLogError, MainLogInfo} from '../AppState/AppConstants';
import {isCheckBoxSDArg, isFileOrFolderSDArg, isValidSDArg} from './SDArgumentsFunctions';
import {SDLaunchConfig} from '../AppState/InterfaceAndTypes';
import {getWebUiTGBatchFilePath} from './TGLauncherConfig';

// The launch configuration object
const sda1LaunchConfig: SDLaunchConfig = {
  env: [{id: 'COMMANDLINE_ARGS', value: ''}],
  cl: [{id: '', value: ''}],
};
// The launch configuration object
const sdlshLaunchConfig: SDLaunchConfig = {
  env: [{id: 'COMMANDLINE_ARGS', value: ''}],
  cl: [{id: '', value: ''}],
};

// Default name for the launch batch file
const LynxBatFileName: string = 'LynxLauncher.bat';

/**
 * Get the current launch configuration
 *
 * @returns {SDLaunchConfig} The launch config data
 */
export function getSDLaunchConfig(): SDLaunchConfig {
  return sda1LaunchConfig;
}

/**
 * Get the current launch configuration
 * @param uiName The repository WebUi name
 * @returns {SDLaunchConfig} The launch config data
 */
export function getSDLaunchConfigByName(uiName: string): SDLaunchConfig {
  switch (uiName) {
    case 'AUTOMATIC1111':
      return sda1LaunchConfig;
    case 'LSHQQYTIGER':
      return sdlshLaunchConfig;
    default:
      console.log('getSDLaunchConfigByName -> Wrong uiName');
      return sda1LaunchConfig;
  }
}

export function resetSDLaunchConfigByName(uiName: string): void {
  switch (uiName) {
    case 'AUTOMATIC1111':
      sda1LaunchConfig.env = [{id: 'COMMANDLINE_ARGS', value: ''}];
      sda1LaunchConfig.cl = [{id: '', value: ''}];
      break;
    case 'LSHQQYTIGER':
      sdlshLaunchConfig.env = [{id: 'COMMANDLINE_ARGS', value: ''}];
      sdlshLaunchConfig.cl = [{id: '', value: ''}];
      break;
    default:
      console.log('getSDLaunchConfigByName -> Wrong uiName');
  }
}

/**
 * Create a batch file for launching the application in the repo directory
 * @param uiName The repository WebUi name
 * @returns {string} The path to the batch file
 */
function createLaunchBatchFile(uiName: string): string {
  // Read webui repository directory from Lynx config
  const localDir = GetDirectoryByName(uiName);
  const batchFilePath: string = localDir ? path.join(localDir, LynxBatFileName) : '';

  // Write basic empty arguments for launching webui to the batch file
  fs.writeFileSync(batchFilePath, '@echo off\n\nset COMMANDLINE_ARGS=\n\ncall webui.bat\n');

  UpdateBatchFileByName(uiName, LynxBatFileName, true);

  return batchFilePath;
}

/**
 * Get the path of the batch launch file for the webui
 *
 * @returns {string} The path to the batch file (Returns the path of existing file, if not create and return new file path created)
 */
function getWebUiBatchFilePath(uiName: string): string {
  let batchFileName: string = 'webui-user.bat';

  // Read webui repository directory and batch file name from Lynx config
  const localDir = GetDirectoryByName(uiName);
  const launcherBatName = GetBatchFileByName(uiName);

  // Variable for holding the final result of the batch file path
  let batchFilePath: string = '';

  // If the batch file name is not defined and the local directory exists
  if (!launcherBatName && localDir) {
    batchFilePath = path.join(localDir, batchFileName);

    // Check if the file exists
    fs.access(batchFilePath, fs.constants.F_OK, (error): void => {
      // Create batch file if not exist
      if (error) {
        console.log(MainLogInfo('getWebUiBatchFilePath -> Creating Batch File'));
        batchFilePath = createLaunchBatchFile(uiName);
        batchFileName = LynxBatFileName;
      }
    });
    // init batchFilePath variable if batch file already exists
  } else if (localDir && launcherBatName) {
    batchFilePath = path.join(localDir, launcherBatName);
  }
  // Update the Lynx configuration with the new batch file name if the local directory and batch file name are defined
  if (launcherBatName !== batchFileName) UpdateBatchFileByName(uiName, batchFileName, true);

  console.log(MainLogInfo(`batchFilePath -> ${batchFilePath}`));
  return batchFilePath;
}

// Get the path to batch file and insert ` before spaces for correct running on terminal
export function getBatchFilePathForPty(uiName: string) {
  const batPath: string = uiName === 'OOBABOOGA' ? getWebUiTGBatchFilePath(uiName) : getWebUiBatchFilePath(uiName);
  return batPath.replace(' ', '` ');
}

/**
 * Function to save the launch configuration data to webui batch file.
 * It first maps the launch configuration data to an object with environment and command line ids.
 * Then it constructs a string to write to the batch file, setting environment variables and command line arguments.
 * Finally, it writes the constructed string to the batch file and logs the operation.
 *
 * @param {SDLaunchConfig} launchConfig - The launch configuration data to save.
 * @param uiName The repository WebUi name
 */
export function saveSDLaunchConfig(launchConfig: SDLaunchConfig, uiName: string): void {
  // Map launch configuration data to an object with environment and command line ids
  const mappedLaunchData: {env: {id: string}[]; cl: {id: string}[]} = {
    env: launchConfig.env.map((envItem: {id: string; value: string}): {id: string} => ({id: envItem.id})),
    cl: launchConfig.cl.map((clItem: {id: string; value: string}): {id: string} => ({id: clItem.id})),
  };

  // Update selectedLaunchSettings Lynx config json with the mapped launch data
  UpdateLaunchSettingByName(uiName, JSON.stringify(mappedLaunchData), true);

  // Initialize the string to write to the batch file
  let batchFileData: string = '@echo off\n\n';

  // Constructing the environment variables except COMMANDLINE_ARGS
  launchConfig.env.forEach((envItem: {id: string; value: string}): void => {
    if (envItem.id !== 'COMMANDLINE_ARGS' && envItem.id) batchFileData += `set ${envItem.id}=${envItem.value}\n`;
  });

  // Initialize the command line arguments
  let clArgsData: string = '';

  // Construct the command line arguments part of the string
  launchConfig.cl.forEach((clItem: {id: string; value: string}): void => {
    if (clItem.value.startsWith('CheckBox')) {
      clArgsData += clItem.value === 'CheckBox-true' ? `${clItem.id} ` : '';
    } else if (isFileOrFolderSDArg(clItem.id)) {
      clArgsData += `${clItem.id} "${clItem.value}" `;
    } else {
      clArgsData += `${clItem.id} ${clItem.value} `;
    }
  });

  // Add the command line arguments to the string
  batchFileData += `set COMMANDLINE_ARGS=${clArgsData}\n\n`;

  // Add the call to the webui batch file
  batchFileData += 'call webui.bat';

  // Write the constructed string to the batch file
  fs.writeFileSync(getWebUiBatchFilePath(uiName), batchFileData);

  // Log the operation
  console.log(MainLogInfo(`Saved ${batchFileData}`));
}

// Read launch data from webui batch file
export function readSdLaunchData(uiName: string): SDLaunchConfig {
  try {
    // Read the batch file
    const data: string = fs.readFileSync(getWebUiBatchFilePath(uiName), 'utf-8');

    resetSDLaunchConfigByName(uiName);

    // Split the data into lines
    const lines: string[] = data.split('\n');

    // Process each line
    lines.forEach((line: string): void => {
      if (line.startsWith('set COMMANDLINE_ARGS=')) {
        // Clear the command line arguments
        getSDLaunchConfigByName(uiName).cl.splice(0, 1);

        // Extract the command line arguments and clear falsy values
        const clArgs: string = line.split('=')[1];
        const args: string[] = clArgs.split('--').filter(Boolean);

        // Map each argument to an object with id and value
        const result: {id: string; value: string}[] = args.map((arg: string): {id: string; value: string} => {
          const [id, ...value] = arg.trim().split(' ');
          return {
            id: `--${id}`,
            value: value.join(' ').replace(/"/g, ''),
          };
        });

        // Process each argument
        result.forEach((value: {id: string; value: string}): void => {
          // Check if the argument exists or valid
          if (isValidSDArg(value.id)) {
            if (isCheckBoxSDArg(value.id)) {
              getSDLaunchConfigByName(uiName).cl.push({id: value.id, value: 'CheckBox-true'});
            } else {
              getSDLaunchConfigByName(uiName).cl.push({id: value.id, value: value.value});
            }
          }
        });
      } else if (line.startsWith('set ')) {
        // If line starts with 'set ', extract the environment variable id and value
        const [envId, envValue] = line.replace('set ', '').split('=');
        envId.trim();
        envValue.trim();
        getSDLaunchConfigByName(uiName).env.push({id: envId, value: envValue});
      }
    });

    /* Get the saved launch settings from Lynx Config
     * When user filters some config but never assigned.
     * Show them in the LaunchSetting menu for future changes.
     */
    const savedLaunchSettings: string | undefined = GetLaunchSettingsByName(uiName);
    let savedLaunchData: {cl: {id: string}[]; env: {id: string}[]} = {env: [], cl: []};
    if (savedLaunchSettings) savedLaunchData = JSON.parse(savedLaunchSettings);

    // Add the saved environment variables to the launch configuration
    savedLaunchData.env.forEach((savedEnv: {id: string}): void => {
      if (!getSDLaunchConfigByName(uiName).env.some((envConfig: {id: string; value: string}): boolean => envConfig.id === savedEnv.id)) {
        getSDLaunchConfigByName(uiName).env.push({id: savedEnv.id, value: ''});
      }
    });

    // Add the saved command line arguments to the launch configuration
    savedLaunchData.cl.forEach((savedCl: {id: string}): void => {
      if (!getSDLaunchConfigByName(uiName).cl.some((clConfig: {id: string; value: string}): boolean => clConfig.id === savedCl.id)) {
        getSDLaunchConfigByName(uiName).cl.push({id: savedCl.id, value: ''});
      }
    });

    // Log the updated launch configuration
    console.log(MainLogInfo(JSON.stringify(getSDLaunchConfigByName(uiName))));
  } catch (error) {
    console.log(MainLogError(error));
  }
  return getSDLaunchConfigByName(uiName);
}
