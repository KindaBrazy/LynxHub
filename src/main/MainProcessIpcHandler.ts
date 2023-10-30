// Import Git & Electron APIs
import {app, BrowserWindow, dialog, ipcMain, nativeTheme} from 'electron';
import {GitResponseError, simpleGit, SimpleGit, SimpleGitProgressEvent} from 'simple-git';
// Import node modules
import os from 'os';
// Import node packages
import * as pty from 'node-pty';
import treeKill from 'tree-kill';
// Import app utils
import {getRemoteUrl} from './Utils/GitUtil';
import {getWebUiUrlByName, MainLogDebug, MainLogError, MainLogInfo, MainLogWarning, webUiInfo} from '../AppState/AppConstants';
import {readSdLaunchData, saveSDLaunchConfig, getBatchFilePathForPty, getSDLaunchConfigByName} from '../CrossProcessModules/SDLauncherConfig';
import {
  ChangeThemeConfig,
  GetDirectoryByName,
  GetThemeConfig,
  GetUserConfigData,
  LoadAppConfig,
  SaveAppConfig,
  UpdateSDAppConfig,
} from './AppManage/AppConfigManager';
import {AppConfig, SDLaunchConfig, TGLaunchConfig} from '../AppState/InterfaceAndTypes';
import {saveInstalledUiConfig} from '../CrossProcessModules/CrossFunctions';
import {getTGLaunchConfig, readTgLaunchData, saveTGLaunchConfig} from '../CrossProcessModules/TGLauncherConfig';

// Variable to hold the main and active BrowserWindow reference
let mainWindowRef: BrowserWindow;

/**
 * Toggles the window state between maximize and minimize or close.
 *
 * @param {'Minimize' | 'Maximize' | 'Close'} state - The desired window state: 'Maximize', 'Minimize' or 'Close'
 */
function changeWindowState(state: 'Minimize' | 'Maximize' | 'Close'): void {
  if (mainWindowRef) {
    switch (state) {
      case 'Maximize':
        if (mainWindowRef.isMaximized()) {
          mainWindowRef.unmaximize();
        } else {
          mainWindowRef.maximize();
        }
        break;
      case 'Minimize':
        mainWindowRef.minimize();
        break;
      case 'Close':
        mainWindowRef.close();
        break;
      default:
        console.log(MainLogWarning('windowManager:changeWindowStatus -> No correct status provided to toggle window'));
        break;
    }
  } else {
    console.log(MainLogError('windowManager:changeWindowStatus -> No browser instance to toggle window'));
  }
}

/**
 * Changes the app theme between light/dark mode.
 *
 * @param {'Toggle' | 'System'} status - 'Toggle' to toggle current theme, 'System' to use system theme
 */
function changeDarkMode(status: 'Toggle' | 'System'): void {
  if (status === 'Toggle') {
    const newTheme: 'light' | 'dark' = nativeTheme.shouldUseDarkColors ? 'light' : 'dark';
    nativeTheme.themeSource = newTheme;
    ChangeThemeConfig(newTheme);
  } else {
    nativeTheme.themeSource = 'system';
  }
}

function getCurrentDarkMode(): string {
  return GetThemeConfig();
}

/**
 * Opens a system file/folder dialog and returns the selected path.
 *
 * @param {'openDirectory' | 'openFile'} option - 'openDirectory' or 'openFile' to select folder or file
 * @returns {string | undefined} The selected file/folder path, or undefined if cancelled.
 */
function openDialog(option: 'openDirectory' | 'openFile'): string | undefined {
  const result: string[] | undefined = dialog.showOpenDialogSync(mainWindowRef, {properties: [option]});

  if (result) return result[0];

  console.log(MainLogWarning('util:openDialog -> No valid directory or file selected'));

  return undefined;
}

/**
 * Handler for git clone progress events.
 * Sends progress to renderer and updates progress bar.
 *
 * @param {SimpleGitProgressEvent} progress - The git clone progress event
 */
const onCloneProgress = (progress: SimpleGitProgressEvent): void => {
  mainWindowRef.webContents.send('util:getCloneProgress', progress);
  mainWindowRef.setProgressBar(progress.progress / 100);
};

// Sends sign to renderer as clone completed and resets progress bar.
function finishClone(): void {
  mainWindowRef.webContents.send('util:getCloneProgress', 'Completed');
  mainWindowRef.setProgressBar(-1);
}

/**
 * Clones a git repository.
 *
 * @param {string} uiName - The git repository url
 * @param {string} dir - The target directory to clone to
 */
async function cloneRepo(uiName: string, dir: string): Promise<void> {
  const repoAddress: string = getWebUiUrlByName(uiName);
  const git: SimpleGit = simpleGit({progress: onCloneProgress});
  try {
    console.log(MainLogInfo(`Cloning ${repoAddress} to ${dir}`));
    await git.clone(repoAddress, dir.toString()).then(() => {
      finishClone();
      saveInstalledUiConfig(uiName, dir);
      return null;
    });
  } catch (Error) {
    if (Error instanceof GitResponseError) {
      console.log(MainLogError(`Error Message: ${Error.message}\n\tStack:${Error.stack}\n\tGit:${Error.git}`));
    } else {
      console.log(MainLogError(`Unknown Error: ${Error}`));
    }
  }
}

/**
 * Opens a dialog to let the user locate a local Stable Diffusion repository.
 *
 * @returns {Promise<boolean>} True if a valid SD repo was selected, false otherwise.
 */
async function locateRepo(repoName: string): Promise<boolean> {
  const selectedLocation: string[] | undefined = dialog.showOpenDialogSync(mainWindowRef, {properties: ['openDirectory']});

  if (!selectedLocation) return false;

  const remote: string | undefined = await getRemoteUrl(selectedLocation[0]);

  if (repoName === 'OOBABOOGA') {
    const isValidTG: boolean = remote === webUiInfo.TextGenerate.OOBABOOGA.address;
    if (isValidTG) {
      saveInstalledUiConfig(repoName, selectedLocation[0]);
    }
    return isValidTG;
  }
  const isSDRepo: boolean = remote
    ? [webUiInfo.ImageGenerate.StableDiffusion.AUTOMATIC1111.address, webUiInfo.ImageGenerate.StableDiffusion.LSHQQYTIGER.address].includes(remote)
    : false;

  const A1Info = webUiInfo.ImageGenerate.StableDiffusion.AUTOMATIC1111;
  const LSHInfo = webUiInfo.ImageGenerate.StableDiffusion.LSHQQYTIGER;
  let repoType;
  if (remote === A1Info.address) {
    repoType = A1Info.name;
  } else if (remote === LSHInfo.address) {
    repoType = LSHInfo.name;
  }
  const isValidRepoByName: boolean = isSDRepo && repoType === repoName;
  if (isValidRepoByName) {
    if (repoType) saveInstalledUiConfig(repoType, selectedLocation[0]);
  }
  // TODO: Error Dialog
  return isValidRepoByName;
}

/**
 * Performs data modification operations.
 *
 * @param {'save' | 'update' | 'load'} op - 'save', 'update' or 'load'
 * @param {Partial<AppConfig>} updateData - Optional data to update
 * @param {boolean} saveOnUpdate - Whether to save data on update
 */
function modifyData(op: 'save' | 'update' | 'load', updateData?: Partial<AppConfig>, saveOnUpdate?: boolean) {
  switch (op) {
    case 'update':
      if (updateData) UpdateSDAppConfig(updateData, saveOnUpdate);
      break;
    case 'load':
      LoadAppConfig();
      break;
    case 'save':
      SaveAppConfig();
      break;
    default:
      break;
  }
}

let isPtyRunning: boolean = false;
// Determine the shell to use based on the operating system
const ptyShell: 'powershell.exe' | 'bash' = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
// Variable to hold pseudo terminal process
let ptyProcess: pty.IPty;

// Kills the running webui process if exists.
export function killWebui(): void {
  console.log(MainLogDebug(`isPtyRunning:${isPtyRunning}`));
  if (ptyProcess && ptyProcess.pid && isPtyRunning) {
    console.log(MainLogDebug('Tree Kill'));
    treeKill(ptyProcess.pid);
    isPtyRunning = false;
  }
}

/**
 * Starts or stops the backend pseudo terminal process.
 *
 * @param {'start' | 'stop'} operation - 'start' or 'stop'
 * @param uiName The repository WebUi name
 */
function backendPtyProcess(operation: 'start' | 'stop', uiName: string) {
  // Start the pseudo terminal process
  if (operation === 'start') {
    const dir: string | undefined = GetDirectoryByName(uiName);
    if (!dir) return;
    ptyProcess = pty.spawn(ptyShell, [], {cwd: dir, cols: 150, rows: 50, name: 'LynxWebUI'});
    const batchFile: string | undefined = getBatchFilePathForPty(uiName);

    // Write the batch file address to run to the pseudo terminal process
    if (os.platform() === 'win32') {
      console.log(MainLogDebug(`Pty command -> ${batchFile}`));
      ptyProcess.write(`${batchFile}\r`);
    } else {
      ptyProcess.write(`./${batchFile}\n`);
    }
    // Send the output of the pseudo terminal process to the renderer
    ptyProcess.onData((data: string): void => {
      mainWindowRef.webContents.send('backendRuns:getPtyOutput', data);
    });
    isPtyRunning = true;
    // Stop the pseudo terminal process
  } else if (operation === 'stop') {
    console.log(MainLogDebug("operation === 'stop'"));
    killWebui();
  }
}

/**
 * Resizes the pseudo terminal if running.
 *
 * @param {{cols: number; rows: number}} newSize - The new columns and rows size
 */
function resizePty(newSize: {cols: number; rows: number}) {
  if (ptyProcess && ptyProcess.pid && isPtyRunning) {
    ptyProcess.resize(newSize.cols, newSize.rows);
  }
}

function saveLaunchArgsToFile(data: SDLaunchConfig | TGLaunchConfig, uiName: string) {
  if (uiName === 'OOBABOOGA') {
    saveTGLaunchConfig(data as TGLaunchConfig, uiName);
  } else {
    saveSDLaunchConfig(data as SDLaunchConfig, uiName);
  }
}

function getLaunchData(uiName: string) {
  if (uiName === 'OOBABOOGA') {
    return getTGLaunchConfig();
  }
  return getSDLaunchConfigByName(uiName);
}

function readLaunchDataFromBatch(uiName: string) {
  let modifiedData: SDLaunchConfig | TGLaunchConfig;
  if (uiName === 'OOBABOOGA') {
    modifiedData = readTgLaunchData();
  } else {
    modifiedData = readSdLaunchData(uiName);
  }
  // Sends updated launch data to the renderer process.
  mainWindowRef.webContents.send('userData:onLaunchDataChange', modifiedData);
}

export function MainProcessIpcHandler(mainWindow: BrowserWindow): void {
  mainWindowRef = mainWindow;

  /* --------------------------------------- Window Manager ----------------------------- */

  ipcMain.on('windowManager:changeWindowState', (_e, state: 'Minimize' | 'Maximize' | 'Close') => changeWindowState(state));
  ipcMain.on('windowManager:changeDarkMode', (_e, status: 'Toggle' | 'System') => changeDarkMode(status));
  ipcMain.handle('windowManager:getCurrentDarkMode', () => getCurrentDarkMode());
  // Handler for native theme updates. Sends the dark mode status to the renderer.
  /* nativeTheme.on('updated', () => {
    if (mainWindowRef) mainWindowRef.webContents.send('windowManager:onDarkModeChange', nativeTheme.shouldUseDarkColors);
  }); */
  /* --------------------------------------- Util --------------------------------------- */

  ipcMain.handle('util:openDialog', (_e, option: 'openDirectory' | 'openFile'): string | undefined => openDialog(option));
  ipcMain.handle('util:getAppPath', () => app.getAppPath());
  ipcMain.on('util:setTaskbarProgress', (_e, percent: number): void => mainWindowRef.setProgressBar(percent));
  ipcMain.handle('util:cloneRepo', async (_e, uiName: string, dir: string): Promise<void> => cloneRepo(uiName, dir));
  ipcMain.handle('util:locateRepo', async (_e, uiName: string): Promise<boolean> => locateRepo(uiName));

  /* --------------------------------------- User Data ---------------------------------- */

  ipcMain.on('userData:modifyData', (_e, op: 'save' | 'update' | 'load', updateData?: Partial<AppConfig>, saveOnUpdate?: boolean): void =>
    modifyData(op, updateData, saveOnUpdate),
  );
  ipcMain.handle('userData:getUserData', () => GetUserConfigData());
  ipcMain.on('userData:saveLaunchArgsToFile', (_e, data: SDLaunchConfig | TGLaunchConfig, uiName: string) => saveLaunchArgsToFile(data, uiName));
  ipcMain.handle('userData:getLaunchData', (_e, uiName: string) => getLaunchData(uiName));
  ipcMain.on('userData:readLaunchDataFromFile', (_e, uiName: string) => readLaunchDataFromBatch(uiName));

  /* --------------------------------------- PTY ---------------------------------------- */

  // Handle the start and stop operations from renderer for the pseudo terminal process
  ipcMain.handle('backendRuns:ptyProcess', (_e, operation: 'start' | 'stop', uiName: string) => backendPtyProcess(operation, uiName));
  // Handle the resizing of the terminal
  ipcMain.on('backendRuns:resizePty', (_e, newSize: {cols: number; rows: number}): void => resizePty(newSize));
}
