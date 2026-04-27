import {InitialSteps, InstallationStepper} from '@lynx_common/types/plugins/modules';
import {ToastFunction} from '@lynx_common/utils/toast';
import filesIpc from '@lynx_shared/ipc/files';
import gitIpc from '@lynx_shared/ipc/git';
import lynxIpc from '@lynx_shared/ipc/lynxIpc';
import storageIpc, {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import utilsIpc from '@lynx_shared/ipc/utils';
import {Dispatch, FC, SetStateAction} from 'react';

import {extensionRendererApi} from '../../../../../plugins/extensions/loader';
import {InstallState} from './types';

export interface InstallStepperData {
  /** The unique identifier of the card being installed. */
  cardId: string;
  setSteps: Dispatch<SetStateAction<InitialSteps>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  cloneRepository: InstallationStepper['cloneRepository'];
  showFinalStep: InstallationStepper['showFinalStep'];
  runTerminalScript: InstallationStepper['runTerminalScript'];
  executeTerminalCommands: InstallationStepper['executeTerminalCommands'];
  downloadFileFromUrl: InstallationStepper['downloadFileFromUrl'];
  starterStep: InstallationStepper['starterStep'];
  collectUserInput: InstallationStepper['collectUserInput'];
  installExtensions: InstallationStepper['postInstall']['installExtensions'];
  progressBar: InstallationStepper['progressBar'];
  setUpdated: InstallationStepper['setUpdated'];
  topToast: ToastFunction;
  bottomToast: ToastFunction;
  checkForUpdate: (dir: string | undefined) => void;
  updateState: (newState: Partial<InstallState> | ((prev: InstallState) => Partial<InstallState>)) => void;
}

/**
 * Manages the sequential logic and external integrations for the installation process.
 * This class provides plugins with a predictable API (IPC, storage, utils) during installation.
 */
export default class InstallStepper {
  private readonly setSteps: Dispatch<SetStateAction<InitialSteps>>;
  private readonly setNextStep: Dispatch<SetStateAction<number>>;
  private readonly finalStep: InstallationStepper['showFinalStep'];
  private totalSteps: number;
  private customStepContents: {index: number; content: FC}[];
  private readonly updateState: (newState: Partial<InstallState>) => void;
  private readonly cardId: string;
  private nextStepResolver?: () => void;

  constructor(data: InstallStepperData) {
    this.totalSteps = 0;
    this.customStepContents = [];

    this.cardId = data.cardId;
    this.updateState = data.updateState;
    this.setSteps = data.setSteps;
    this.setNextStep = data.setCurrentStep;
    this.setUpdated = data.setUpdated;
    this.cloneRepository = data.cloneRepository;
    this.finalStep = data.showFinalStep;
    this.runTerminalScript = data.runTerminalScript;
    this.executeTerminalCommands = data.executeTerminalCommands;
    this.downloadFileFromUrl = data.downloadFileFromUrl;
    this.starterStep = data.starterStep;
    this.collectUserInput = data.collectUserInput;
    this.progressBar = data.progressBar;

    this.setInstalled = dir => {
      storageUtilsIpc.send.addInstalledCard({dir, id: data.cardId});
      data.checkForUpdate(dir);
    };

    this.topToast = data.topToast;
    this.bottomToast = data.bottomToast;

    this.ipc = {
      on(channel: string, listener: any): () => void {
        return lynxIpc.on(channel, listener);
      },
      send(channel: string, ...args) {
        return lynxIpc.send(channel, ...args);
      },
      invoke(channel: string, ...args): Promise<any> {
        return lynxIpc.invoke(channel, ...args);
      },
    };

    this.storage = {set: storageIpc.setCustom, get: storageIpc.getCustom};

    this.utils = {
      decompressFile: utilsIpc.decompressFile,
      validateGitRepository: gitIpc.validateGitDir,
      verifyFilesExist: filesIpc.checkFilesExist,
      openFileOrFolder: filesIpc.openPath,
    };

    this.postInstall = {
      installExtensions: data.installExtensions,
      config: config => {
        const {autoUpdateExtensions, autoUpdateCard, launchBehavior, preLaunch, customCommands, customArguments} =
          config;
        if (autoUpdateCard !== undefined) {
          if (autoUpdateCard) {
            storageUtilsIpc.send.addAutoUpdateCard(data.cardId);
          } else {
            storageUtilsIpc.send.removeAutoUpdateCard(data.cardId);
          }
        }
        if (autoUpdateExtensions !== undefined) {
          if (autoUpdateExtensions) {
            storageUtilsIpc.send.addAutoUpdateExtensions(data.cardId);
          } else {
            storageUtilsIpc.send.removeAutoUpdateExtensions(data.cardId);
          }
        }
        if (customArguments !== undefined) {
          storageUtilsIpc.invoke.getCardArguments(data.cardId).then(result => {
            storageUtilsIpc.invoke.setCardArguments(data.cardId, {
              activePreset: customArguments.presetName,
              data: [...result.data, {preset: customArguments.presetName, arguments: customArguments.customArguments}],
            });
          });
        }
        if (preLaunch !== undefined) {
          storageUtilsIpc.invoke.preCommands('set', {command: preLaunch.preCommands, id: data.cardId});
          preLaunch.openPath.forEach(({path, type}) => {
            storageUtilsIpc.invoke.preOpen('add', {id: data.cardId, open: {path, type}});
          });
        }
        if (launchBehavior !== undefined) {
          const {browser, terminal, urlCatch} = launchBehavior;
          storageUtilsIpc.send.updateCustomRunBehavior({
            cardID: data.cardId,
            terminal,
            browser,
            urlCatch,
          });
        }
        if (customCommands !== undefined) {
          storageUtilsIpc.invoke.customRun('set', {command: customCommands, id: data.cardId});
        }
      },
    };
  }

  public progressBar: InstallationStepper['progressBar'];

  public ipc: InstallationStepper['ipc'];

  public storage: InstallationStepper['storage'];

  public postInstall: InstallationStepper['postInstall'];

  public utils: InstallationStepper['utils'];

  public starterStep: InstallationStepper['starterStep'];

  public executeTerminalCommands: InstallationStepper['executeTerminalCommands'];

  public downloadFileFromUrl: InstallationStepper['downloadFileFromUrl'];

  public cloneRepository: InstallationStepper['cloneRepository'];

  public runTerminalScript: InstallationStepper['runTerminalScript'];

  public setInstalled: InstallationStepper['setInstalled'];

  public topToast: InstallationStepper['topToast'];
  public bottomToast: InstallationStepper['bottomToast'];

  public collectUserInput: InstallationStepper['collectUserInput'];

  public setUpdated: InstallationStepper['setUpdated'];

  public initialSteps(steps: InitialSteps) {
    this.totalSteps = steps.length - 1;
    this.setSteps(steps);

    extensionRendererApi.events.emit('card_install_addStep', {
      id: this.cardId,
      addStep: (atIndex, title, content) => {
        this.setSteps(prevSteps => prevSteps.toSpliced(atIndex, 0, title));
        this.customStepContents.push({index: atIndex, content});
        this.totalSteps += 1;
      },
    });
  }

  public async nextStep() {
    return new Promise<void>(resolve => {
      if (!this.nextStepResolver) this.nextStepResolver = resolve;
      this.setNextStep(prevState => {
        const stepNumber = prevState < this.totalSteps ? prevState + 1 : prevState;
        const customStep = this.customStepContents.find(step => step.index === stepNumber);

        if (customStep) {
          this.updateState({body: 'extension-custom', extensionCustomContent: customStep?.content});
        } else if (this.nextStepResolver) {
          this.nextStepResolver();
          this.nextStepResolver = undefined;
        }

        return stepNumber;
      });
    });
  }

  public showFinalStep(type: 'success' | 'error', title: string, description?: string) {
    this.setNextStep(this.totalSteps);
    this.finalStep(type, title, description);
  }
}
