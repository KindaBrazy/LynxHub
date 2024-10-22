import {Dispatch, MutableRefObject, SetStateAction, useCallback, useMemo} from 'react';

import {InstallationMethod, InstallationStepper, UserInputField, UserInputResult} from '../../../Modules/types';
import {useModalsState} from '../../../Redux/AI/ModalsReducer';
import rendererIpc from '../../../RendererIpc';
import {InstallState} from './types';
import InstallStepper from './Utils/InstallStepper';

type Props = {
  setSteps: Dispatch<SetStateAction<string[]>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  setUserInputElements: Dispatch<SetStateAction<UserInputField[]>>;
  updateState: (newState: Partial<InstallState>) => void;
  cloneResolver: MutableRefObject<((dir: string) => void) | null>;
  terminalResolver: MutableRefObject<(() => void) | null>;
  starterResolver: MutableRefObject<((result: InstallationMethod) => void) | null>;
  userInputResolver: MutableRefObject<((result: UserInputResult[]) => void) | null>;
  restartTerminal: MutableRefObject<(() => void) | null>;
  downloadFileFromUrl: (url: string) => ReturnType<InstallationStepper['downloadFileFromUrl']>;
  setExtensionsToInstall: Dispatch<SetStateAction<{urls: string[]; dir: string} | undefined>>;
  extensionsResolver: MutableRefObject<(() => void) | null>;
  setProgressBarState: Dispatch<
    SetStateAction<{
      isIndeterminate: boolean;
      title?: string;
      percentage?: number;
      description?: {label: string; value: string}[];
    }>
  >;
};

export function useStepper({
  setSteps,
  setCurrentStep,
  updateState,
  cloneResolver,
  terminalResolver,
  starterResolver,
  restartTerminal,
  userInputResolver,
  setUserInputElements,
  downloadFileFromUrl,
  extensionsResolver,
  setExtensionsToInstall,
  setProgressBarState,
}: Props) {
  const {cardId} = useModalsState('installUIModal');

  const cloneRepository = useCallback(
    async (url: string): ReturnType<InstallationStepper['cloneRepository']> => {
      return new Promise(resolve => {
        cloneResolver.current = resolve;
        updateState({cloneUrl: url, body: 'clone'});
      });
    },
    [cloneResolver],
  );

  const showFinalStep = useCallback((type: 'success' | 'error', title: string, description?: string) => {
    updateState({doneAll: {type, title, description}, body: 'done'});
  }, []);

  const runTerminalScript = useCallback(
    async (dir: string, file: string): ReturnType<InstallationStepper['runTerminalScript']> => {
      return new Promise(resolve => {
        restartTerminal.current = () => {
          rendererIpc.pty.customProcess('stop');
          rendererIpc.pty.customProcess('start', dir, file);
        };

        terminalResolver.current = resolve;
        updateState({body: 'terminal'});
        rendererIpc.pty.customProcess('start', dir, file);
      });
    },
    [],
  );

  const executeTerminalCommands = useCallback(
    async (commands?: string | string[], dir?: string): ReturnType<InstallationStepper['executeTerminalCommands']> => {
      return new Promise(resolve => {
        restartTerminal.current = () => {
          rendererIpc.pty.customCommands('stop');
          rendererIpc.pty.customCommands('start', commands, dir);
        };

        terminalResolver.current = resolve;
        updateState({body: 'terminal'});
        rendererIpc.pty.customCommands('start', commands, dir);
      });
    },
    [],
  );

  const starterStep = useCallback(async (): Promise<InstallationMethod> => {
    return new Promise(resolve => {
      starterResolver.current = resolve;
      updateState({body: 'starter'});
    });
  }, []);

  const collectUserInput = useCallback((elements: UserInputField[]): Promise<UserInputResult[]> => {
    return new Promise(resolve => {
      userInputResolver.current = resolve;
      setUserInputElements(elements);
      updateState({body: 'user-input'});
    });
  }, []);

  const installExtensions = useCallback((extensionURLs: string[], extensionsDir: string): Promise<void> => {
    return new Promise(resolve => {
      extensionsResolver.current = resolve;
      setExtensionsToInstall({urls: extensionURLs, dir: extensionsDir});
      updateState({body: 'install-extensions'});
    });
  }, []);

  const progressBar = useCallback(
    (
      isIndeterminate: boolean,
      title?: string,
      percentage?: number,
      description?: {
        label: string;
        value: string;
      }[],
    ) => {
      updateState({body: 'progress-bar'});
      setProgressBarState({title, isIndeterminate, percentage, description});
    },
    [],
  );

  return useMemo(() => {
    return new InstallStepper({
      cardId,
      setSteps,
      setCurrentStep,
      installExtensions,
      cloneRepository,
      showFinalStep,
      runTerminalScript,
      executeTerminalCommands,
      downloadFileFromUrl,
      starterStep,
      collectUserInput,
      progressBar,
    });
  }, [
    cardId,
    setSteps,
    setCurrentStep,
    cloneRepository,
    installExtensions,
    showFinalStep,
    runTerminalScript,
    executeTerminalCommands,
    downloadFileFromUrl,
    starterStep,
    collectUserInput,
  ]);
}
