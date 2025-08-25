import {ElectronAPI} from '@electron-toolkit/preload';

import {InstalledCard} from '../../src/cross/StorageTypes';

declare global {
  interface Window {
    electron: ElectronAPI;
    osPlatform: NodeJS.Platform;
    isPortable: 'win' | 'linux' | null;
  }
}

export type AvailablePages = '/imageGenerationPage' | '/textGenerationPage' | '/audioGenerationPage';

export type ExtensionData = {
  title: string;
  description: string;
  url: string;
  stars?: number;
};

type StorageType = {get: (key: string) => any; set: (key: string, data: any) => void};

export type MainIpcTypes = {
  handle(channel: string, listener: (event: any, ...args: any[]) => any): void;
  on(channel: string, listener: (event: any, ...args: any[]) => void): void;
  send: (channel: string, ...args: any[]) => void;
};

/** These methods will be called in the main process */
export type CardMainMethodsInitial = (utils: MainModuleUtils) => {
  /** Return commands based on installed directory to be executed with terminal */
  getRunCommands: () => Promise<string | string[]>;

  /** Read saved argument from file and return data with the array of type ChosenArgument */
  readArgs?: () => Promise<ChosenArgument[]>;

  /** Get user configured arguments and save it to desire file */
  saveArgs?: (args: ChosenArgument[]) => Promise<void>;
  mainIpc?: () => void;
  updateAvailable?: () => Promise<boolean>;
  isInstalled?: (onInstalledDirExist: (card: InstalledCard) => Promise<false | true>) => Promise<boolean>;
  uninstall?: () => Promise<void>;
};

/** These methods will be called in the main process */
export type CardMainMethods = () => {
  /** Return commands based on installed directory to be executed with terminal */
  getRunCommands: () => Promise<string | string[]>;

  /** Read saved argument from file and return data with the array of type ChosenArgument */
  readArgs?: () => Promise<ChosenArgument[]>;

  /** Get user configured arguments and save it to desire file */
  saveArgs?: (args: ChosenArgument[]) => Promise<void>;
  mainIpc?: () => void;
  updateAvailable?: () => Promise<boolean>;
  isInstalled?: (onInstalledDirExist: (card: InstalledCard) => Promise<false | true>) => Promise<boolean>;
  uninstall?: () => Promise<void>;
};

export type InstallationMethod = {chosen: 'install' | 'locate'; targetDirectory?: string};
export type UserInputFieldType = 'checkbox' | 'text-input' | 'select' | 'directory' | 'file';
export type UserInputField = {
  id: string;
  label: string;
  type: UserInputFieldType;
  selectOptions?: string[];
  defaultValue?: string | boolean;
  isRequired?: boolean;
};
export type UserInputResult = {id: string; result: string | boolean};
export type StarterStepOptions = {disableSelectDir?: boolean};
export type RendererIpcTypes = {
  invoke(channel: string, ...args: any[]): Promise<any>;
  on(channel: string, listener: any): () => void;
  send(channel: string, ...args: any[]): void;
};
export type InstallationStepper = {
  /** Initialize the installation process by setting up the required steps.
   * @param stepTitles An array of step titles representing the installation workflow.
   */
  initialSteps: (stepTitles: string[]) => void;

  /** Advance to the next step in the installation process. */
  nextStep: () => Promise<void>;

  /** Normally the first step (Contain locating or start installation)
   * @return A promise resolving to the user's choice of installation method.
   */
  starterStep: (options?: StarterStepOptions) => Promise<InstallationMethod>;

  /** Clone a Git repository to a user-selected directory.
   * @param repositoryUrl The URL of the Git repository to clone.
   * @returns A promise resolving to the path of the cloned repository.
   */
  cloneRepository: (url: string) => Promise<string>;

  /** Execute a terminal script file.
   * @param workingDirectory The directory in which to execute the script.
   * @param scriptFileName The name of the script file to execute.
   * @returns A promise that resolves when execution is complete and the user proceeds.
   */
  runTerminalScript: (workingDirectory: string, scriptFileName: string) => Promise<void>;

  /** Execute one or more terminal commands.
   * @param commands A single command or an array of commands to execute.
   * @param workingDirectory Optional directory in which to execute the commands.
   * @returns A promise that resolves when execution is complete and the user proceeds.
   */
  executeTerminalCommands: (commands: string | string[], workingDirectory?: string) => Promise<void>;

  /** Download a file from a given URL.
   * @param fileUrl The URL of the file to download.
   * @returns A promise resolving to the path of the downloaded file.
   */
  downloadFileFromUrl: (fileUrl: string) => Promise<string>;

  /**
   * Displays a progress bar UI element.
   * @param title The title of the progress bar.
   * @param isIndeterminate Whether the progress is indeterminate (true) or determinate (false).
   * @param percentage The completion percentage (0-100) for determinate progress. Ignored if isIndeterminate is true.
   * @param description Optional array of label-value pairs to provide additional information about the progress.
   */
  progressBar: (
    isIndeterminate: boolean,
    title?: string,
    percentage?: number,
    description?: {
      label: string;
      value: string;
    }[],
  ) => void;

  /** Call this when installation is done to set the card installed
   * @param dir The directory to save
   */
  setInstalled: (dir?: string) => void;

  setUpdated: () => void;

  /** Collect user input for various configuration options.
   * @param inputFields An array of input fields to present to the user.
   * @returns A promise resolving to an array of user input results.
   */
  collectUserInput: (inputFields: UserInputField[], title?: string) => Promise<UserInputResult[]>;

  /** Display the final step of the installation process with a result message.
   * @param resultType The type of result: 'success' or 'error'.
   * @param resultTitle A title summarizing the result.
   * @param resultDescription An optional detailed description of the result.
   */
  showFinalStep: (resultType: 'success' | 'error', resultTitle: string, resultDescription?: string) => void;

  /**
   * Provides access to the renderer process IPC methods.
   * Use this to send/receive data or messages between the renderer process and the main process.
   */
  ipc: RendererIpcTypes;

  storage: {get: (key: string) => any; set: (key: string, data: any) => void};

  /** Use these operations after the `setInstalled` function */
  postInstall: {
    /**
     * Installs a list of extensions for the user
     * @param extensionURLs An array of Git repository URLs to clone
     * @param extensionsDir The target directory where the extensions will be cloned
     * @returns A Promise that resolves when all extensions are installed
     */
    installExtensions: (extensionURLs: string[], extensionsDir: string) => Promise<void>;

    /**
     * Configures the WebUI with the provided settings
     * @param configs An object containing configuration options
     */
    config: (configs: {
      /** If true, automatically updates all extensions when launching WebUI */
      autoUpdateExtensions?: boolean;

      /** If true, automatically updates the WebUI itself */
      autoUpdateCard?: boolean;

      /** Pre-defined arguments to pass to the WebUI */
      customArguments?: {
        /** Name of the preset configuration */
        presetName: string;
        /** Array of custom arguments */
        customArguments: {
          /** Name of the argument like --use-cpu */
          name: string;
          /** Value of the argument
           * - Set empty string '', if it's Boolean or CheckBox
           */
          value: string;
        }[];
      };

      /** Custom commands to execute instead of the actual command to launch WebUI */
      customCommands?: string[];

      /** Defines the behavior of the browser and terminal when launching */
      launchBehavior?: {
        /** Specifies how to open the browser */
        browser: 'appBrowser' | 'defaultBrowser' | 'doNothing';
        /** Specifies how to handle the terminal */
        terminal: 'runScript' | 'empty';
      };

      /** Actions to perform before launching WebUI */
      preLaunch?: {
        /** Commands to execute before launch */
        preCommands: string[];
        /** Paths to open before launch */
        openPath: {path: string; type: 'folder' | 'file'}[];
      };
    }) => void;
  };

  /** Utility functions that don't involve UI interaction */
  utils: {
    /** Decompress a file.
     * @param compressedFilePath The path to the compressed file.
     * @returns A promise resolving to the path of the decompressed data.
     */
    decompressFile: (compressedFilePath: string) => Promise<string>;

    /** Validate if a local directory matches a given Git repository URL.
     * @param localDirectory The local directory to validate.
     * @param repositoryUrl The Git repository URL to compare against.
     * @returns A promise resolving to true if the directory matches the repository, false otherwise.
     */
    validateGitRepository: (localDirectory: string, repositoryUrl: string) => Promise<boolean>;

    /** Check for the existence of specified files or folders in a directory.
     * @param directory The directory to search in.
     * @param itemNames An array of file or folder names to check for.
     * @returns A promise resolving to true if all items exist, false otherwise.
     */
    verifyFilesExist: (directory: string, itemNames: string[]) => Promise<boolean>;

    /** Open a file or folder using the system's default manner.
     * @param path Absolute path to open
     */
    openFileOrFolder: (itemPath: string) => void;
  };

  showToast: () => {
    success: (title: string, timeout?: number) => void;
    error: (title: string, timeout?: number) => void;
    warning: (title: string, timeout?: number) => void;
    info: (title: string, timeout?: number) => void;
    loading: (title: string, promise: Promise<any>) => void;
  };
};

export type CardInfoApi = {
  installationFolder?: string;

  storage: {get: (key: string) => Promise<any>; set: (key: string, data: any) => void};
  ipc: RendererIpcTypes;

  getFolderSize: (dir: string) => Promise<number>;
  getFolderCreationTime: (dir: string) => Promise<string>;
  getLastPulledDate: (dir: string) => Promise<string>;
  getCurrentReleaseTag: (dir: string) => Promise<string>;
};

export type CardInfoDescriptions_Items = {label: string; result: string | 'loading' | undefined | null}[];
export type CardInfoDescriptions = {title: string; items: CardInfoDescriptions_Items}[] | undefined;
export type CardInfoCallback = {
  setDescription: (descriptions: CardInfoDescriptions) => void;
  setOpenFolders: (dir: string[] | undefined) => void;
};

/** These methods will be called in the renderer process */
export type CardRendererMethods = {
  /** This method will be called with terminal output line parameter
   * @return URL of running AI to be showing in browser of the user and
   * @return undefined if URL is not in that line */
  catchAddress?: (line: string) => string | undefined;

  /** Fetching and return array of available extensions in type of `ExtensionData` */
  fetchExtensionList?: () => Promise<ExtensionData[]>;

  /** Parse the given argument to string */
  parseArgsToString?: (args: ChosenArgument[]) => string;

  /** Parse given string to the arguments */
  parseStringToArgs?: (args: string) => ChosenArgument[];

  cardInfo?: (api: CardInfoApi, callback: CardInfoCallback) => void;

  manager?: {
    startInstall: (stepper: InstallationStepper) => void;
    updater: {
      updateType: 'git' | 'stepper';
      startUpdate?: (stepper: InstallationStepper, dir?: string) => void;
    };
  };
};

export type CardData = {
  /**  ID will be used to managing state of card */
  id: string;

  /**  Card background
   *
   * **Acceptable sources: **
   * - github.com
   *    - api.github.com
   *    - *.githubusercontent.com
   * - image.civitai.com
   */
  bgUrl: string;

  /**  Url to repository (Using this url recognize, clone and update card) */
  repoUrl: string;

  /**  The title of card */
  title: string;

  /**  Description about what card does */
  description: string;

  /**  The directory of extension (In relative path like '/extensions')
   *   - Leave undefined if WebUI have no extension ability
   */
  extensionsDir?: string;

  installationType: 'git' | 'others';

  uninstallType?: 'removeFolder' | 'others';

  /** Type of AI (Using type for things like discord activity status) */
  type?: 'image' | 'audio' | 'text' | 'unknown';

  /** List of all available arguments
   *  - Leave undefined if WebUI have no arguments to config
   */
  arguments?: ArgumentsData;

  /** These methods will be called in the renderer process
   * @description This methods will be used when user interaction (Like recognizing URL to show in browser)
   */
  methods: CardRendererMethods;
};

export type LoadedCardData = Omit<CardData, 'arguments' | 'methods'>;
export type LoadedArguments = Pick<CardData, 'arguments' | 'id'>;
export type LoadedMethods = Pick<CardData, 'methods' | 'id'>;

export type PagesData = {
  /** Router path (For placing the card in relative page) */
  routePath: AvailablePages;

  /** Cards data */
  cards: CardData[];
};

export type CardModules = PagesData[];

export type ChosenArgument = {name: string; value: string};

export type ArgumentType = 'Directory' | 'File' | 'Input' | 'DropDown' | 'CheckBox';

export type ArgumentItem = {
  name: string;
  description?: string;
  type: ArgumentType;
  defaultValue?: any;
  values?: string[];
};

export type ArgumentSection = {
  section: string;
  items: ArgumentItem[];
};

export type DataSection = {
  category: string;
  condition?: string;
  sections: ArgumentSection[];
};
export type DataItem = {
  category: string;
  condition?: string;
  items: ArgumentItem[];
};

export type ArgumentsData = (DataItem | DataSection)[];

export type ArgType = {name: string; value: string};
export type Category = 'env' | 'envVar' | 'cl' | undefined;

export type MainModules = {
  /** The ID of the card that using these methods */
  id: string;

  /** These methods will be called in the main process
   * @description This methods will be used when user interaction (Like run, config, etc.)
   */
  methods: CardMainMethods;
};

export type GitHubReleaseAsset = {
  name: string;
  browser_download_url: string;
};

export type GitHubRelease = {
  tag_name: string;
  prerelease: boolean;
  assets: GitHubReleaseAsset[];
};
export type ReleaseInfo = {
  version: string;
  downloadUrl: string;
};

export type MainModuleImportType = {
  default: (utils: MainModuleUtils) => Promise<MainModules[]>;
};

export type RendererModuleImportType = {
  default: CardModules;
  setCurrentBuild?: (build: number) => void;
};

export type MainModuleUtils = {
  storage: StorageType;
  ipc: MainIpcTypes;
  pty: any;
  isPullAvailable: (dir: string) => Promise<boolean>;
  trashDir: (dir: string) => Promise<void>;
  removeDir: (dir: string) => Promise<void>;
  getInstallDir: (id: string) => string | undefined;
  getConfigDir: () => string | undefined;
  pullDir: (dir: string, showTaskbarProgress?: boolean) => Promise<void>;
  /** It's best to call and get commands when need to execute (to get latest changed commands) */
  getExtensions_TerminalPreCommands: (id: string) => string[];
};
