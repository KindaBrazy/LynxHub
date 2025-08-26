import {isNil} from 'lodash';
import {Dispatch, RefObject, SetStateAction, useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {
  InstallationMethod,
  InstallationStepper,
  StarterStepOptions,
  UserInputField,
  UserInputResult,
} from '../../../../../../cross/plugin/ModuleTypes';
import {eventUtil_CollectUserInputs} from '../../../Extensions/Extension_Utils';
import {useAllCardMethods} from '../../../Modules/ModuleLoader';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {lynxTopToast} from '../../../Utils/UtilHooks';
import {InstallState} from './types';
import InstallStepper from './Utils/InstallStepper';

type Props = {
  setSteps: Dispatch<SetStateAction<string[]>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  setUserInputElements: Dispatch<SetStateAction<{elements: UserInputField[]; title?: string}>>;
  updateState: (newState: Partial<InstallState>) => void;
  cloneResolver: RefObject<((dir: string) => void) | null>;
  terminalResolver: RefObject<(() => void) | null>;
  starterResolver: RefObject<((result: InstallationMethod) => void) | null>;
  userInputResolver: RefObject<((result: UserInputResult[]) => void) | null>;
  restartTerminal: RefObject<(() => void) | null>;
  downloadFileFromUrl: (url: string) => ReturnType<InstallationStepper['downloadFileFromUrl']>;
  setExtensionsToInstall: Dispatch<SetStateAction<{urls: string[]; dir: string} | undefined>>;
  extensionsResolver: RefObject<(() => void) | null>;
  setProgressBarState: Dispatch<
    SetStateAction<{
      isIndeterminate: boolean;
      title?: string;
      percentage?: number;
      description?: {label: string; value: string}[];
    }>
  >;

  cardId: string;
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
  cardId,
}: Props) {
  const allMethods = useAllCardMethods();

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
          rendererIpc.pty.customProcess(cardId, 'stop');
          rendererIpc.pty.customProcess(cardId, 'start', dir, file);
        };

        terminalResolver.current = resolve;
        updateState({body: 'terminal'});
        rendererIpc.pty.customProcess(cardId, 'start', dir, file);
      });
    },
    [],
  );

  const executeTerminalCommands = useCallback(
    async (commands?: string | string[], dir?: string): ReturnType<InstallationStepper['executeTerminalCommands']> => {
      return new Promise(resolve => {
        restartTerminal.current = () => {
          rendererIpc.pty.customCommands(cardId, 'stop');
          rendererIpc.pty.customCommands(cardId, 'start', commands, dir);
        };

        terminalResolver.current = resolve;
        updateState({body: 'terminal'});
        rendererIpc.pty.customCommands(cardId, 'start', commands, dir);
      });
    },
    [],
  );

  const starterStep = useCallback(async (options?: StarterStepOptions): Promise<InstallationMethod> => {
    return new Promise(resolve => {
      starterResolver.current = resolve;
      updateState({body: 'starter', disableSelectDir: options?.disableSelectDir});
    });
  }, []);

  const collectUserInput = useCallback((elements: UserInputField[], title?: string): Promise<UserInputResult[]> => {
    return new Promise(resolve => {
      eventUtil_CollectUserInputs(cardId, extensionUserInput => {
        userInputResolver.current = resolve;
        setUserInputElements({elements, title});
        updateState({body: 'user-input', extensionUserInput});
      });
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

  const dispatch = useDispatch<AppDispatch>();
  const setUpdated = useCallback(() => {
    dispatch(cardsActions.removeUpdateAvailable(cardId));
  }, [dispatch, cardId]);

  const updateType = useMemo(() => {
    const type = allMethods.find(c => c.id === cardId)?.methods?.['manager']?.updater.updateType;
    if (isNil(type)) return undefined;
    return type;
  }, [allMethods, cardId]);

  const checkForUpdate = useCallback(
    (dir: string | undefined) => {
      rendererIpc.module.cardUpdateAvailable({dir, id: cardId}, updateType).then((isAvailable: boolean) => {
        if (isAvailable) dispatch(cardsActions.addUpdateAvailable(cardId));
      });
    },
    [updateType, cardId],
  );

  const showToast = useCallback(() => lynxTopToast(dispatch), [dispatch]);

  return useMemo(() => {
    return new InstallStepper({
      showToast,
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
      setUpdated,
      checkForUpdate,
      updateState,
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
    progressBar,
    starterStep,
    collectUserInput,
    setUpdated,
    checkForUpdate,
    updateState,
  ]);
}
