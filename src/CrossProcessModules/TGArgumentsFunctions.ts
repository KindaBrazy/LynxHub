import {commandLineFlags} from '../AppState/TGArgumentsContainer';
import {SettingComponentType} from '../AppState/InterfaceAndTypes';

export function isValidTGArg(argID: string): boolean {
  let foundClVarKey: boolean = false;
  Object.keys(commandLineFlags).some((key) => {
    foundClVarKey = Object.keys(commandLineFlags[key]).some((childKey) => argID === commandLineFlags[key][childKey].Name);
    return foundClVarKey;
  });

  return foundClVarKey;
}

function getTGCommandLineArgType(cmdArgId: string): SettingComponentType | undefined {
  let foundCmdArgType: SettingComponentType | undefined;

  // Iterate over the command line arguments until the argument with the given ID is found.
  Object.keys(commandLineFlags).some((key) => {
    const foundClArgKey = Object.keys(commandLineFlags[key]).find((childKey) => cmdArgId === commandLineFlags[key][childKey].Name);

    // If the command line argument is found, store its type and stop the iteration.
    if (foundClArgKey) {
      foundCmdArgType = commandLineFlags[key][foundClArgKey].Type;
      return true;
    }

    // If the command line argument is not found, continue the iteration.
    return false;
  });

  // Return the type of the command line argument or undefined if not found.
  return foundCmdArgType;
}

export function isFileOrFolderTGArg(argID: string): boolean {
  return (
    getTGCommandLineArgType(argID) === SettingComponentType.ChooseFile || getTGCommandLineArgType(argID) === SettingComponentType.ChooseDirectory
  );
}

export function isCheckBoxTGArg(argID: string): boolean {
  return getTGCommandLineArgType(argID) === SettingComponentType.CheckBox;
}
