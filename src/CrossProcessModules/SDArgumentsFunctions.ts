import {environmentVariables, sda1CommandLines} from '../AppState/SDArgumentsContainer';
import {SDSettingType} from '../AppState/InterfaceAndTypes';

/**
 * Returns the type of the key argument.
 * It first checks if the key exists in the environment variables.
 * If it doesn't, it checks if the key exists in the command lines.
 *
 * @param {string} key - The key to check.
 * @return {string | undefined} - The type of the key argument if it exists, otherwise undefined.
 */

export function getArgumentKeyType(key: string): 'env' | 'cl' | undefined {
  let result: 'env' | 'cl' | undefined;
  // Check if the key exists in the environment variables
  const envKey = Object.keys(environmentVariables).find((envKey) => environmentVariables[envKey].Name === key);
  if (envKey) result = 'env';

  // Check if the key exists in the command lines
  Object.keys(sda1CommandLines).forEach((clCategoryKey) => {
    const clKey = Object.keys(sda1CommandLines[clCategoryKey]).find((clKey) => sda1CommandLines[clCategoryKey][clKey].Name === key);
    if (clKey) result = 'cl';
  });

  return result;
}

/**
 * This function retrieves the type of given environment variable.
 * @param {string} envVarId - The ID of the environment variable.
 * @returns {SDSettingType | undefined} - The type of the environment variable or undefined if not found.
 */
function getEnvironmentVariableType(envVarId: string): SDSettingType | undefined {
  // Find the environment variable by its ID.
  const foundEnvVarKey = Object.keys(environmentVariables).find((key) => envVarId === environmentVariables[key].Name);

  // If the environment variable is found, return its type.
  if (foundEnvVarKey) {
    return environmentVariables[foundEnvVarKey].Type;
  }

  // If the environment variable is not found, return undefined.
  return undefined;
}

/**
 * This function retrieves the type of given command line argument.
 * @param {string} cmdArgId - The ID of the command line argument.
 * @returns {SDSettingType | undefined} - The type of the command line argument or undefined if not found.
 */
function getCommandLineArgType(cmdArgId: string): SDSettingType | undefined {
  let foundCmdArgType: SDSettingType | undefined;

  // Iterate over the command line arguments until the argument with the given ID is found.
  Object.keys(sda1CommandLines).some((key) => {
    const foundClArgKey = Object.keys(sda1CommandLines[key]).find((childKey) => cmdArgId === sda1CommandLines[key][childKey].Name);

    // If the command line argument is found, store its type and stop the iteration.
    if (foundClArgKey) {
      foundCmdArgType = sda1CommandLines[key][foundClArgKey].Type;
      return true;
    }

    // If the command line argument is not found, continue the iteration.
    return false;
  });

  // Return the type of the command line argument or undefined if not found.
  return foundCmdArgType;
}

/**
 * Determines if a command line argument or environment variable id is existing or valid
 *
 * @param {string} argID The command line argument or environment variable id to evaluate.
 * @returns {boolean} Returns true if the command line argument or environment variable is existing or valid, false otherwise.
 */
export function isValidArg(argID: string): boolean {
  const foundEnvVarKey: boolean = Object.keys(environmentVariables).some((key) => argID === environmentVariables[key].Name);
  let foundClVarKey: boolean = false;
  Object.keys(sda1CommandLines).some((key) => {
    foundClVarKey = Object.keys(sda1CommandLines[key]).some((childKey) => argID === sda1CommandLines[key][childKey].Name);
    return foundClVarKey;
  });

  return foundEnvVarKey || foundClVarKey;
}

/**
 * Determines if a command line argument or environment variable corresponds to a ChooseFile/ChooseDirectory setting.
 *
 * @param {string} argID The command line argument or environment variable id to evaluate.
 * @returns {boolean} Returns true if the command line argument or environment variable is type of ChooseFile/ChooseDirectory, false otherwise.
 */
export function isFileOrFolderArg(argID: string): boolean {
  const clResult: boolean =
    getCommandLineArgType(argID) === SDSettingType.ChooseFile || getCommandLineArgType(argID) === SDSettingType.ChooseDirectory;
  const envResult: boolean =
    getEnvironmentVariableType(argID) === SDSettingType.ChooseFile || getEnvironmentVariableType(argID) === SDSettingType.ChooseDirectory;

  return clResult || envResult;
}

/**
 * Determines if a command line argument or environment variable corresponds to a CheckBox setting.
 *
 * @param {string} argID The command line argument or environment variable id to evaluate.
 * @returns {boolean} Returns true if the command line argument or environment variable is type of CheckBox, false otherwise.
 */
export function isCheckBoxArg(argID: string): boolean {
  const clResult: boolean = getCommandLineArgType(argID) === SDSettingType.CheckBox;
  const envResult: boolean = getEnvironmentVariableType(argID) === SDSettingType.CheckBox;

  return clResult || envResult;
}
