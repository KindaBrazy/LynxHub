import {InstallationStepper} from '@lynx_module/types';
import {Dispatch as ReduxDispatch, UnknownAction} from '@reduxjs/toolkit';
import {Dispatch, FC, SetStateAction} from 'react';

import {extensionRendererApi} from '../../../../Extensions/ExtensionLoader';
import rendererIpc from '../../../../RendererIpc';
import {lynxTopToast} from '../../../../Utils/UtilHooks';
import {InstallState} from '../types';

export default class InstallStepper {
  private readonly setSteps: Dispatch<SetStateAction<string[]>>;
  private readonly setNextStep: Dispatch<SetStateAction<number>>;
  private readonly finalStep: InstallationStepper['showFinalStep'];
  private totalSteps: number;
  private customStepContents: {index: number; content: FC}[];
  private readonly updateState: (newState: Partial<InstallState>) => void;
  private readonly cardId: string;
  private nextStepResolver?: () => void;

  constructor(data: {
    cardId: string;
    setSteps: Dispatch<SetStateAction<string[]>>;
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
    dispatch: ReduxDispatch<UnknownAction>;

    checkForUpdate: (dir: string | undefined) => void;
    updateState: (newState: Partial<InstallState>) => void;
  }) {
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
      rendererIpc.storageUtils.addInstalledCard({dir, id: data.cardId});
      data.checkForUpdate(dir);
    };

    this.showToast = lynxTopToast(data.dispatch);

    this.ipc = {
      on(channel: string, listener: any): () => void {
        return window.electron.ipcRenderer.on(channel, listener);
      },
      send(channel: string, ...args) {
        return window.electron.ipcRenderer.send(channel, ...args);
      },
      invoke(channel: string, ...args): Promise<any> {
        return window.electron.ipcRenderer.invoke(channel, ...args);
      },
    };

    this.storage = {set: rendererIpc.storage.setCustom, get: rendererIpc.storage.getCustom};

    this.utils = {
      decompressFile: rendererIpc.utils.decompressFile,
      validateGitRepository: rendererIpc.git.validateGitDir,
      verifyFilesExist: rendererIpc.file.checkFilesExist,
      openFileOrFolder: rendererIpc.file.openPath,
    };

    this.postInstall = {
      installExtensions: data.installExtensions,
      config: config => {
        const {autoUpdateExtensions, autoUpdateCard, launchBehavior, preLaunch, customCommands, customArguments} =
          config;
        if (autoUpdateCard !== undefined) {
          if (autoUpdateCard) {
            rendererIpc.storageUtils.addAutoUpdateCard(data.cardId);
          } else {
            rendererIpc.storageUtils.removeAutoUpdateCard(data.cardId);
          }
        }
        if (autoUpdateExtensions !== undefined) {
          if (autoUpdateExtensions) {
            rendererIpc.storageUtils.addAutoUpdateExtensions(data.cardId);
          } else {
            rendererIpc.storageUtils.removeAutoUpdateExtensions(data.cardId);
          }
        }
        if (customArguments !== undefined) {
          rendererIpc.storageUtils.getCardArguments(data.cardId).then(result => {
            rendererIpc.storageUtils.setCardArguments(data.cardId, {
              activePreset: customArguments.presetName,
              data: [...result.data, {preset: customArguments.presetName, arguments: customArguments.customArguments}],
            });
          });
        }
        if (preLaunch !== undefined) {
          rendererIpc.storageUtils.preCommands('set', {command: preLaunch.preCommands, id: data.cardId});
          preLaunch.openPath.forEach(({path, type}) => {
            rendererIpc.storageUtils.preOpen('add', {id: data.cardId, open: {path, type}});
          });
        }
        if (launchBehavior !== undefined) {
          const {browser, terminal} = launchBehavior;
          rendererIpc.storageUtils.updateCustomRunBehavior({
            cardID: data.cardId,
            terminal,
            browser,
          });
        }
        if (customCommands !== undefined) {
          rendererIpc.storageUtils.customRun('set', {command: customCommands, id: data.cardId});
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

  public showToast: InstallationStepper['showToast'];

  public collectUserInput: InstallationStepper['collectUserInput'];

  public setUpdated: InstallationStepper['setUpdated'];

  public initialSteps(steps: string[]) {
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
