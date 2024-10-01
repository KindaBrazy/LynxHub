import {InstallationStepper} from '@renderer/App/Modules/types';
import rendererIpc from '@renderer/App/RendererIpc';
import {Dispatch, SetStateAction} from 'react';

export default class InstallStepper {
  private readonly setSteps: Dispatch<SetStateAction<string[]>>;
  private readonly setNextStep: Dispatch<SetStateAction<number>>;
  private readonly finalStep: InstallationStepper['showFinalStep'];
  private totalSteps: number;

  constructor(data: {
    setSteps: Dispatch<SetStateAction<string[]>>;
    setCurrentStep: Dispatch<SetStateAction<number>>;
    cloneRepository: InstallationStepper['cloneRepository'];
    setInstalled: InstallationStepper['setInstalled'];
    showFinalStep: InstallationStepper['showFinalStep'];
    runTerminalScript: InstallationStepper['runTerminalScript'];
    executeTerminalCommands: InstallationStepper['executeTerminalCommands'];
    downloadFileFromUrl: InstallationStepper['downloadFileFromUrl'];
    starterStep: InstallationStepper['starterStep'];
    collectUserInput: InstallationStepper['collectUserInput'];
  }) {
    this.totalSteps = 0;
    this.setSteps = data.setSteps;
    this.setNextStep = data.setCurrentStep;
    this.cloneRepository = data.cloneRepository;
    this.setInstalled = data.setInstalled;
    this.finalStep = data.showFinalStep;
    this.runTerminalScript = data.runTerminalScript;
    this.executeTerminalCommands = data.executeTerminalCommands;
    this.downloadFileFromUrl = data.downloadFileFromUrl;
    this.utils = {
      decompressFile: rendererIpc.utils.decompressFile,
      validateGitRepository: rendererIpc.git.validateGitDir,
      verifyFilesExist: rendererIpc.file.checkFilesExist,
      openFileOrFolder: rendererIpc.file.openPath,
    };
    this.starterStep = data.starterStep;
    this.collectUserInput = data.collectUserInput;
  }

  public utils: InstallationStepper['utils'];

  public starterStep: InstallationStepper['starterStep'];

  public executeTerminalCommands: InstallationStepper['executeTerminalCommands'];

  public downloadFileFromUrl: InstallationStepper['downloadFileFromUrl'];

  public cloneRepository: InstallationStepper['cloneRepository'];

  public runTerminalScript: InstallationStepper['runTerminalScript'];

  public setInstalled: InstallationStepper['setInstalled'];

  public collectUserInput: InstallationStepper['collectUserInput'];

  public initialSteps(steps: string[]) {
    this.totalSteps = steps.length - 1;
    this.setSteps(steps);
  }

  public nextStep() {
    this.setNextStep(prevState => (prevState < this.totalSteps ? prevState + 1 : prevState));
  }

  public showFinalStep(type: 'success' | 'error', title: string, description?: string) {
    this.setNextStep(this.totalSteps);
    this.finalStep(type, title, description);
  }
}
