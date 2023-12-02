import {app, BrowserWindow, shell} from 'electron';
import path from 'path';
import {MainProcessIpcHandler, killWebui} from './MainProcessIpcHandler';
import resolveHtmlPath from './Utils/AppUtil';
import {
  ChangeLastWindowSizeConfig,
  GetLastWindowSizeConfig,
  GetTaskbarConfig,
  GetWindowSizeConfig,
  LoadAppConfig,
  ValidateConfig,
} from './AppManage/AppConfigManager';
import {MainLogError} from '../AppState/AppConstants';
import {TrayManagerCreate, TrayManagerDestroy, TrayManagerInit} from './TrayManager';
import {DRPCStartUp} from './DiscordRPCManager';

/* class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
} */

// Declare main window variable
let mainWindow: BrowserWindow | null = null;

// Check if the application is running in production mode
if (process.env.NODE_ENV === 'production') {
  // Import the 'source-map-support' module
  import('source-map-support')
    .then((sourceMapSupport) => {
      // If the module is successfully imported, install source map support
      sourceMapSupport.install();

      return null;
    })
    .catch((error) => {
      // If there is an error during the import or installation, log the error
      console.log(MainLogError(error));
    });
}

// Create main window 😑
async function createMainWindow() {
  // The absolute path of the assets folder
  const RESOURCES_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../../assets');
  // Get the asset path for a given file or subfolder
  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // Create a new instance of BrowserWindow class
  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 800,
    minHeight: 512,
    width: 1024,
    height: 768,
    frame: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      // devTools: false,
    },
  });

  // Load the index file into the main window
  mainWindow.loadURL(resolveHtmlPath('index.html')).catch((error) => {
    console.log(MainLogError(`mainWindow.loadURL -> ${error}`));
  });

  // Initialize tray manager data
  TrayManagerInit(mainWindow, getAssetPath('icon.ico'), getAssetPath('icons/16x16.png'));

  TrayManagerCreate();
  // Initialize and call MainProcessIpcHandler module
  MainProcessIpcHandler(mainWindow);

  // Load app config data on startup
  LoadAppConfig();

  mainWindow.on('minimize', () => {
    if (GetTaskbarConfig() === 'trayWhenMinimized') {
      TrayManagerCreate();
      mainWindow?.setSkipTaskbar(true);
    }
  });

  mainWindow.on('focus', () => {
    if (GetTaskbarConfig() === 'trayWhenMinimized') {
      TrayManagerDestroy();
      mainWindow?.setSkipTaskbar(false);
    }
  });

  mainWindow.on('ready-to-show', () => {
    console.log(MainLogError(`********* ready-to-show`));
    if (!mainWindow) {
      throw new Error('mainWindow is not defined');
    }
    ValidateConfig();
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    if (process.platform === 'win32') app.setAppUserModelId('AIOne Lynx');

    switch (GetTaskbarConfig()) {
      case 'justTray':
        TrayManagerCreate();
        mainWindow?.setSkipTaskbar(true);
        break;
      case 'taskbarAndTray':
        TrayManagerCreate();
        mainWindow?.setSkipTaskbar(false);
        break;
      case 'justTaskbar':
        TrayManagerDestroy();
        mainWindow?.setSkipTaskbar(false);
        break;
      default:
        break;
    }

    if (GetWindowSizeConfig() === 'lastSize') {
      const resultSize: {width: number; height: number} = GetLastWindowSizeConfig();
      mainWindow.setSize(resultSize.width, resultSize.height, true);
    }
  });

  mainWindow.on('close', () => {
    const sizeResult: {width: number; height: number} = {width: 1024, height: 768};
    if (mainWindow?.getSize()[0]) sizeResult.width = mainWindow?.getSize()[0];
    if (mainWindow?.getSize()[1]) sizeResult.height = mainWindow?.getSize()[1];

    ChangeLastWindowSizeConfig(sizeResult);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((eData) => {
    // Open external URLs in the user's browser
    shell.openExternal(eData.url);
    // Deny the creation of new windows
    return {action: 'deny'};
  });

  mainWindow.webContents.on('did-attach-webview', (_event, webContents) => {
    webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return {action: 'deny'};
    });
  });

  DRPCStartUp();
  // new AppUpdater();
}

app.on('window-all-closed', () => {
  // Kill pty process
  killWebui();
  // Quit the app if the platform is not macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app
  .whenReady()
  .then(() => {
    createMainWindow();
    app.on('activate', () => {
      if (mainWindow === null) createMainWindow();
    });
    return null;
  })
  .catch((error) => {
    console.log(MainLogError(`App init: ${error}`));
  });
