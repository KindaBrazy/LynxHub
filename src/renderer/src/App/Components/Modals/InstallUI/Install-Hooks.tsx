import {InstallState} from '@renderer/App/Components/Modals/InstallUI/types';
import InstallStepper from '@renderer/App/Components/Modals/InstallUI/Utils/InstallStepper';
import {InstallationMethod, InstallationStepper, UserInputField, UserInputResult} from '@renderer/App/Modules/types';
import {useModalsState} from '@renderer/App/Redux/AI/ModalsReducer';
import rendererIpc from '@renderer/App/RendererIpc';
import {Dispatch, MutableRefObject, SetStateAction, useCallback, useMemo} from 'react';

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

  const setInstalled = useCallback(
    (dir: string) => {
      rendererIpc.storageUtils.addInstalledCard({dir, id: cardId});
    },
    [cardId],
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

  return useMemo(() => {
    return new InstallStepper({
      setSteps,
      setCurrentStep,
      cloneRepository,
      setInstalled,
      showFinalStep,
      runTerminalScript,
      executeTerminalCommands,
      downloadFileFromUrl,
      starterStep,
      collectUserInput,
    });
  }, [
    setSteps,
    setCurrentStep,
    cloneRepository,
    setInstalled,
    showFinalStep,
    runTerminalScript,
    executeTerminalCommands,
    downloadFileFromUrl,
    starterStep,
    collectUserInput,
  ]);
}
