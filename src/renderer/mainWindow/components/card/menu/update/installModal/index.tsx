import {DownloadProgress} from '@lynx_common/types/ipc';
import {
  CardRendererMethods,
  InitialSteps,
  InstallationMethod,
  InstallationStepper,
  UserInputField,
  UserInputResult,
} from '@lynx_common/types/plugins/modules';
import ptyIpc from '@lynx_shared/ipc/pty';
import utilsIpc from '@lynx_shared/ipc/utils';
import {isEmpty, isNil} from 'lodash-es';
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extensionsData} from '../../../../../plugins/extensions/loader';
import {getCardMethod, useAllCardMethods} from '../../../../../plugins/modules';
import {cardsActions} from '../../../../../redux/reducers/cards';
import {AppDispatch} from '../../../../../redux/store';
import {useInstalledCard} from '../../../../../utils/hooks';
import TabModal from '../../../../TabModal';
import {XTermAPI} from '../../../../useXTerm';
import {useCardStore} from '../../../store';
import {CommonProps} from '../../about/types';
import InstallBody from './Body';
import InstallFooter from './Footer';
import InstallHeader from './Header';
import {useStepper} from './Hooks';
import {InstallState} from './types';

const initialState: InstallState = {
  body: '',
  cloneUrl: '',
  doneAll: {
    title: '',
    description: '',
    type: 'success',
  },
  startClone: false,
  disableSelectDir: false,
  extensionCustomContent: undefined,
  extensionUserInput: undefined,
  terminalKey: 0,
};

export interface InstallModalProps {
  /** Controls if the specific modal instance is currently active and visible. */
  isOpen: boolean;
  /** The unique ID of the plugin/card being operated on. */
  cardId: string;
  /** Human-readable title of the plugin to display. */
  title: string;
  /** Indicates if this flow is a fresh `install` or an `update` sequence. */
  type: string;
  /** Browser tab ID this modal is bound to. */
  tabID: string;
}

type Props = {type: 'install' | 'update'} & CommonProps;

/**
 * The main container mapping internal states, Redux, and IPC callbacks to construct the
 * installation wizard for LynxHub extensions and cards.
 * Combines the Header, Body, and Footer layout blocks.
 *
 * @param {InstallModalProps} props - The component props.
 */
const InstallModal = memo(({state: modalState, type}: Props) => {
  const cardId = useCardStore(st => st.id);
  const title = useCardStore(st => st.title);

  const installedCard = useInstalledCard(cardId);
  const allMethods = useAllCardMethods();

  const dispatch = useDispatch<AppDispatch>();

  // -----------------------------------------------> States
  const [steps, setSteps] = useState<InitialSteps>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [state, setState] = useState<InstallState>(initialState);

  const methods: CardRendererMethods['manager'] = useMemo(
    () => getCardMethod(allMethods, cardId, 'manager'),
    [cardId, allMethods],
  );

  const [progressInfo, setProgressInfo] = useState<DownloadProgress | undefined>(undefined);
  const [urlToDownload, setUrlToDownload] = useState<string | undefined>(undefined);

  const [userInputElements, setUserInputElements] = useState<{elements: UserInputField[]; title?: string}>({
    elements: [],
    title: '',
  });
  const [userElementsReturn, setUserElementsReturn] = useState<UserInputResult[]>([]);

  const [extensionsToInstall, setExtensionsToInstall] = useState<{urls: string[]; dir: string} | undefined>(undefined);

  const canContinue = useMemo(() => {
    if (state.body === 'user-input') {
      for (const field of userInputElements.elements) {
        if (field.isRequired) {
          const correspondingResult = userElementsReturn.find(result => result.id === field.id);

          if (!correspondingResult) {
            return false;
          }

          if (
            typeof correspondingResult.result === 'string' &&
            (isEmpty(correspondingResult.result) || isNil(correspondingResult.result))
          ) {
            return false;
          }
        }
      }
    }

    return true;
  }, [state, userInputElements, userElementsReturn]);

  useEffect(() => {
    if (state.body === 'done' && state.doneAll.type === 'success' && type === 'update') {
      dispatch(cardsActions.removeUpdateAvailable(cardId));
    }
  }, [state, type, cardId]);

  const [progressBarState, setProgressBarState] = useState<{
    isIndeterminate: boolean;
    title?: string;
    percentage?: number;
    description?: {label: string; value: string}[];
  }>({title: '', isIndeterminate: true});

  const updateState = useCallback(
    (newState: Partial<InstallState> | ((prev: InstallState) => Partial<InstallState>)) => {
      setState(prevState => ({
        ...prevState,
        ...(typeof newState === 'function' ? newState(prevState) : newState),
      }));
    },
    [],
  );

  // -----------------------------------------------> Resolvers
  const cloneResolver = useRef<((dir: string) => void) | null>(null);
  const terminalResolver = useRef<(() => void) | null>(null);
  const starterResolver = useRef<((result: InstallationMethod) => void) | null>(null);
  const userInputResolver = useRef<((result: UserInputResult[]) => void) | null>(null);
  const restartTerminal = useRef<(() => void) | null>(null);
  const extensionsResolver = useRef<(() => void) | null>(null);

  // -----------------------------------------------> Handlers
  const removeProgressListener = useRef<(() => void) | null>(null);

  const downloadFileFromUrl = useCallback(
    async (url: string): ReturnType<InstallationStepper['downloadFileFromUrl']> => {
      return new Promise(resolve => {
        setProgressInfo(undefined);
        updateState({body: 'progress'});
        setUrlToDownload(url);
        utilsIpc.downloadFile(url);
        removeProgressListener.current = utilsIpc.onDownloadFile(progress => {
          if (progress.stage === 'done') {
            setProgressInfo(undefined);
            removeProgressListener.current?.();
            resolve(progress.finalPath);
          } else {
            setProgressInfo(progress);
          }
        });
      });
    },
    [updateState],
  );

  // -----------------------------------------------> Stepper
  const stepper = useStepper({
    setSteps,
    setCurrentStep,
    updateState,
    cloneResolver,
    terminalResolver,
    restartTerminal,
    downloadFileFromUrl,
    starterResolver,
    userInputResolver,
    setUserInputElements,
    setExtensionsToInstall,
    extensionsResolver,
    setProgressBarState,
    cardId,
  });

  useEffect(() => {
    if (modalState.isOpen && methods && stepper) {
      if (type === 'install') {
        methods.startInstall(stepper);
      } else {
        methods.updater.startUpdate?.(stepper, installedCard!.dir);
      }
    }
  }, [modalState.isOpen, methods, stepper, type]);

  // -----------------------------------------------> Handle UI
  useEffect(() => {
    return () => {
      removeProgressListener.current?.();
    };
  }, []);

  const handleClose = useCallback(() => {
    if (state.body === 'terminal') ptyIpc.stop(cardId);
    if (state.body === 'progress') {
      utilsIpc.cancelDownload();
      removeProgressListener.current?.();
    }
    updateState(initialState);
    setCurrentStep(0);
    setSteps([]);
    modalState.close();
  }, [updateState, state, cardId, modalState]);

  const nextStep = useCallback(() => stepper.nextStep(), [stepper]);

  // -----------------------------------------------> References
  const xtermRef = useRef<XTermAPI | null>(null);

  return (
    <TabModal
      backdropVariant="blur"
      isOpen={modalState.isOpen}
      onOpenChange={modalState.setOpen}
      dialogClassName="h-fit! max-h-full! w-fit! min-w-3xl!"
      containerClassName={`${state.body === 'terminal' && 'max-w-full!'} w-fit! h-fit! max-w-4xl!`}>
      <InstallHeader steps={steps} currentStep={currentStep} />
      <InstallBody
        title={title}
        state={state}
        cardId={cardId}
        xtermRef={xtermRef}
        updateState={updateState}
        isOpen={modalState.isOpen}
        progressInfo={progressInfo}
        cloneResolver={cloneResolver}
        currentStep={steps[currentStep]}
        progressBarState={progressBarState}
        userInputElements={userInputElements}
        extensionsResolver={extensionsResolver}
        extensionsToInstall={extensionsToInstall}
        setUserElementsReturn={setUserElementsReturn}
      />
      <InstallFooter
        state={state}
        cardId={cardId}
        nextStep={nextStep}
        xtermRef={xtermRef}
        canContinue={canContinue}
        updateState={updateState}
        handleClose={handleClose}
        progressInfo={progressInfo}
        urlToDownload={urlToDownload}
        restartTerminal={restartTerminal}
        starterResolver={starterResolver}
        terminalResolver={terminalResolver}
        userInputResolver={userInputResolver}
        userElementsReturn={userElementsReturn}
        downloadFileFromUrl={downloadFileFromUrl}
      />
    </TabModal>
  );
});

const InstallCardModal = ({state, type}: Props) => {
  const InstallUI = useMemo(() => extensionsData.replaceModals.installUi, []);

  if (!state.isOpen) return null;

  return InstallUI ? <InstallUI /> : <InstallModal type={type} state={state} />;
};

export default InstallCardModal;
