import {
  InitialSteps,
  InstallationMethod,
  InstallationStepper,
  StarterStepOptions,
  UserInputField,
  UserInputResult,
} from '@lynx_common/types/plugins/modules';
import moduleIpc from '@lynx_shared/ipc/plugins/module';
import ptyIpc from '@lynx_shared/ipc/pty';
import {isNil} from 'lodash-es';
import {Dispatch, RefObject, SetStateAction, useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {bottomToast, topToast} from '../../../../../layouts/ToastProviders';
import {collectExtensionUserInputs} from '../../../../../plugins/extensions/utils';
import {useAllCardMethods} from '../../../../../plugins/modules';
import {cardsActions} from '../../../../../redux/reducers/cards';
import {AppDispatch} from '../../../../../redux/store';
import InstallStepper from './Stepper';
import {InstallState} from './types';

export interface UseStepperProps {
  /** The unique identifier of the card being installed. */
  cardId: string;
  /** Sets the list of step names shown in the header stepper. */
  setSteps: Dispatch<SetStateAction<InitialSteps>>;
  /** Sets the current active step index. */
  setCurrentStep: Dispatch<SetStateAction<number>>;
  /** Ref to the function that triggers a terminal restart. */
  restartTerminal: RefObject<(() => void) | null>;
  /** Ref to resolve the cloning promise. */
  cloneResolver: RefObject<((dir: string) => void) | null>;
  /** Ref to resolve the terminal execution promise. */
  terminalResolver: RefObject<(() => void) | null>;
  /** Ref to resolve the initial starter step processing. */
  starterResolver: RefObject<((result: InstallationMethod) => void) | null>;
  /** Ref to resolve the user input step processing. */
  userInputResolver: RefObject<((result: UserInputResult[]) => void) | null>;
  /** Ref to resolve the extension installation step. */
  extensionsResolver: RefObject<(() => void) | null>;
  /** Function to download a file from a URL. */
  downloadFileFromUrl: (url: string) => ReturnType<InstallationStepper['downloadFileFromUrl']>;
  /** Modifies the global modal state object directly. */
  updateState: (newState: Partial<InstallState> | ((prev: InstallState) => Partial<InstallState>)) => void;
  /** Sets the required fields to display during the user-input step. */
  setUserInputElements: Dispatch<SetStateAction<{elements: UserInputField[]; title?: string}>>;
  /** Determines which extension URLs and target directory to clone into. */
  setExtensionsToInstall: Dispatch<SetStateAction<{urls: string[]; dir: string} | undefined>>;
  /** Configures the ui details shown during a progress-bar state. */
  setProgressBarState: Dispatch<
    SetStateAction<{
      isIndeterminate: boolean;
      title?: string;
      percentage?: number;
      description?: {label: string; value: string}[];
    }>
  >;
}

/**
 * Initializes and manages a stable `InstallStepper` instance.
 * It connects the plugin module's method calls to the internal React states and UI steps of the installation modal.
 *
 * @param {UseStepperProps} props - Dependencies and setState methods used to render the modal.
 * @returns {InstallStepper} The configured stepper to pass to the module API.
 */

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
}: UseStepperProps) {
  const allMethods = useAllCardMethods();

  const cloneRepository = useCallback(
    async (url: string): ReturnType<InstallationStepper['cloneRepository']> => {
      return new Promise(resolve => {
        cloneResolver.current = resolve;
        updateState({cloneUrl: url, body: 'clone'});
      });
    },
    [cloneResolver, updateState],
  );

  const showFinalStep = useCallback(
    (type: 'success' | 'error', title: string, description?: string) => {
      updateState({doneAll: {type, title, description}, body: 'done'});
    },
    [updateState],
  );

  const runTerminalScript = useCallback(
    async (dir: string, file: string): ReturnType<InstallationStepper['runTerminalScript']> => {
      return new Promise(resolve => {
        restartTerminal.current = () => {
          ptyIpc.stop(cardId);
          ptyIpc.customProcess(cardId, dir, file);
        };

        terminalResolver.current = resolve;
        updateState(prev => ({body: 'terminal', terminalKey: prev.terminalKey + 1}));
        ptyIpc.customProcess(cardId, dir, file);
      });
    },
    [cardId, restartTerminal, terminalResolver, updateState],
  );

  const executeTerminalCommands = useCallback(
    async (commands?: string | string[], dir?: string): ReturnType<InstallationStepper['executeTerminalCommands']> => {
      return new Promise(resolve => {
        restartTerminal.current = () => {
          ptyIpc.stop(cardId);
          ptyIpc.customCommands(cardId, commands, dir);
        };

        terminalResolver.current = resolve;
        updateState(prev => ({body: 'terminal', terminalKey: prev.terminalKey + 1}));
        ptyIpc.customCommands(cardId, commands, dir);
      });
    },
    [cardId, restartTerminal, terminalResolver, updateState],
  );

  const starterStep = useCallback(
    async (options?: StarterStepOptions): Promise<InstallationMethod> => {
      return new Promise(resolve => {
        starterResolver.current = resolve;
        updateState({body: 'starter', disableSelectDir: options?.disableSelectDir});
      });
    },
    [starterResolver, updateState],
  );

  const collectUserInput = useCallback(
    (elements: UserInputField[], title?: string): Promise<UserInputResult[]> => {
      return new Promise(resolve => {
        collectExtensionUserInputs(cardId, extensionUserInput => {
          userInputResolver.current = resolve;
          setUserInputElements({elements, title});
          updateState({body: 'user-input', extensionUserInput});
        });
      });
    },
    [cardId, setUserInputElements, updateState, userInputResolver],
  );

  const installExtensions = useCallback(
    (extensionURLs: string[], extensionsDir: string): Promise<void> => {
      return new Promise(resolve => {
        extensionsResolver.current = resolve;
        setExtensionsToInstall({urls: extensionURLs, dir: extensionsDir});
        updateState({body: 'install-extensions'});
      });
    },
    [extensionsResolver, setExtensionsToInstall, updateState],
  );

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
    [setProgressBarState, updateState],
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
      moduleIpc.cardUpdateAvailable({dir, id: cardId}, updateType).then((isAvailable: boolean) => {
        if (isAvailable) dispatch(cardsActions.addUpdateAvailable(cardId));
      });
    },
    [updateType, cardId],
  );

  return useMemo(() => {
    return new InstallStepper({
      topToast,
      bottomToast,
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
