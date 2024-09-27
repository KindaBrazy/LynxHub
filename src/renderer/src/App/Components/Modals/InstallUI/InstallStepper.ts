import {InstallStepperType, InstallSteps} from '@renderer/App/Modules/types';
import {Dispatch, SetStateAction} from 'react';

export default class InstallStepper {
  private readonly setSteps: Dispatch<SetStateAction<InstallSteps[]>>;
  private readonly setNextStep: Dispatch<SetStateAction<number>>;
  private readonly onClone: InstallStepperType['clone'];
  private readonly setInstalledUI: InstallStepperType['setInstalled'];
  private readonly onDone: InstallStepperType['done'];
  private readonly executeTerminalFile: InstallStepperType['execTerminalFile'];
  private readonly executeTerminalCommands: InstallStepperType['execTerminalCommands'];
  private readonly downloadFileURL: InstallStepperType['downloadFile'];
  private readonly decompress: InstallStepperType['decompressFile'];
  private totalSteps: number;

  constructor(
    setSteps: Dispatch<SetStateAction<InstallSteps[]>>,
    setCurrentStep: Dispatch<SetStateAction<number>>,
    onClone: InstallStepperType['clone'],
    setInstalled: InstallStepperType['setInstalled'],
    onDone: InstallStepperType['done'],
    execTerminalFile: InstallStepperType['execTerminalFile'],
    execTerminalCommands: InstallStepperType['execTerminalCommands'],
    downloadFile: InstallStepperType['downloadFile'],
    decompressFile: InstallStepperType['decompressFile'],
  ) {
    this.totalSteps = 0;
    this.setSteps = setSteps;
    this.setNextStep = setCurrentStep;
    this.onClone = onClone;
    this.setInstalledUI = setInstalled;
    this.onDone = onDone;
    this.executeTerminalFile = execTerminalFile;
    this.executeTerminalCommands = execTerminalCommands;
    this.downloadFileURL = downloadFile;
    this.decompress = decompressFile;
  }

  public async decompressFile(filePath: string) {
    return this.decompress(filePath);
  }

  public async execTerminalCommands(commands?: string | string[], dir?: string) {
    return this.executeTerminalCommands(commands, dir);
  }

  public async downloadFile(url: string): Promise<string> {
    return this.downloadFileURL(url);
  }

  public initialSteps(steps: InstallSteps[]) {
    this.totalSteps = steps.length - 1;
    this.setSteps(steps);
  }

  public nextStep() {
    this.setNextStep(prevState => (prevState < this.totalSteps ? prevState + 1 : prevState));
  }

  public async clone(url: string): ReturnType<InstallStepperType['clone']> {
    return this.onClone(url);
  }

  public async execTerminalFile(dir: string, file: string): Promise<void> {
    return this.executeTerminalFile(dir, file);
  }

  public setInstalled(dir: string) {
    this.setInstalledUI(dir);
  }

  public done(title: string, description?: string) {
    this.setNextStep(this.totalSteps);
    this.onDone(title, description);
  }
}
