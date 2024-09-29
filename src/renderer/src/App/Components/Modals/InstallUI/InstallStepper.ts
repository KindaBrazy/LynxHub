import {InstallStepperType} from '@renderer/App/Modules/types';
import {Dispatch, SetStateAction} from 'react';

export default class InstallStepper {
  private readonly setSteps: Dispatch<SetStateAction<string[]>>;
  private readonly setNextStep: Dispatch<SetStateAction<number>>;
  private readonly onDone: InstallStepperType['done'];
  private totalSteps: number;

  constructor(
    setSteps: Dispatch<SetStateAction<string[]>>,
    setCurrentStep: Dispatch<SetStateAction<number>>,
    onClone: InstallStepperType['clone'],
    setInstalled: InstallStepperType['setInstalled'],
    onDone: InstallStepperType['done'],
    execTerminalFile: InstallStepperType['execTerminalFile'],
    execTerminalCommands: InstallStepperType['execTerminalCommands'],
    downloadFile: InstallStepperType['downloadFile'],
    starterStep: InstallStepperType['starterStep'],
    utils: InstallStepperType['utils'],
  ) {
    this.totalSteps = 0;
    this.setSteps = setSteps;
    this.setNextStep = setCurrentStep;
    this.clone = onClone;
    this.setInstalled = setInstalled;
    this.onDone = onDone;
    this.execTerminalFile = execTerminalFile;
    this.execTerminalCommands = execTerminalCommands;
    this.downloadFile = downloadFile;
    this.utils = utils;
    this.starterStep = starterStep;
  }

  public utils: InstallStepperType['utils'];

  public starterStep: InstallStepperType['starterStep'];

  public execTerminalCommands: InstallStepperType['execTerminalCommands'];

  public downloadFile: InstallStepperType['downloadFile'];

  public clone: InstallStepperType['clone'];

  public execTerminalFile: InstallStepperType['execTerminalFile'];

  public setInstalled: InstallStepperType['setInstalled'];

  public initialSteps(steps: string[]) {
    this.totalSteps = steps.length - 1;
    this.setSteps(steps);
  }

  public nextStep() {
    this.setNextStep(prevState => (prevState < this.totalSteps ? prevState + 1 : prevState));
  }

  public done(type: 'success' | 'error', title: string, description?: string) {
    this.setNextStep(this.totalSteps);
    this.onDone(type, title, description);
  }
}
