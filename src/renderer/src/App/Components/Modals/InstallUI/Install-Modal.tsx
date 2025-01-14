import {Modal, ModalContent} from '@nextui-org/react';
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {DownloadProgress} from '../../../../../../cross/IpcChannelAndTypes';
import {getCardMethod, useAllCards} from '../../../Modules/ModuleLoader';
import {
  CardRendererMethods,
  InstallationMethod,
  InstallationStepper,
  UserInputField,
  UserInputResult,
} from '../../../Modules/types';
import {cardsActions} from '../../../Redux/AI/CardsReducer';
import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {useInstalledCard} from '../../../Utils/UtilHooks';
import InstallBody from './Install-Body';
import InstallFooter from './Install-Footer';
import InstallHeader from './Install-Header';
import {useStepper} from './Install-Hooks';
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
};

const InstallModal = memo(() => {
  const {isOpen, cardId, title, type} = useModalsState('installUIModal');
  const installedCard = useInstalledCard(cardId);
  const allCards = useAllCards();

  const dispatch = useDispatch<AppDispatch>();

  // -----------------------------------------------> States
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [state, setState] = useState<InstallState>(initialState);

  const methods: CardRendererMethods['manager'] = useMemo(
    () => getCardMethod(allCards, cardId, 'manager'),
    [cardId, allCards],
  );

  const [progressInfo, setProgressInfo] = useState<DownloadProgress | undefined>(undefined);
  const [urlToDownload, setUrlToDownload] = useState<string | undefined>(undefined);

  const [userInputElements, setUserInputElements] = useState<UserInputField[]>([]);
  const [userElementsReturn, setUserElementsReturn] = useState<UserInputResult[]>([]);

  const [extensionsToInstall, setExtensionsToInstall] = useState<{urls: string[]; dir: string} | undefined>(undefined);

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

  const updateState = useCallback((newState: Partial<InstallState>) => {
    setState(prevState => ({...prevState, ...newState}));
  }, []);

  // -----------------------------------------------> Resolvers
  const cloneResolver = useRef<((dir: string) => void) | null>(null);
  const terminalResolver = useRef<(() => void) | null>(null);
  const starterResolver = useRef<((result: InstallationMethod) => void) | null>(null);
  const userInputResolver = useRef<((result: UserInputResult[]) => void) | null>(null);
  const restartTerminal = useRef<(() => void) | null>(null);
  const extensionsResolver = useRef<(() => void) | null>(null);

  // -----------------------------------------------> Handlers

  const downloadFileFromUrl = useCallback(
    async (url: string): ReturnType<InstallationStepper['downloadFileFromUrl']> => {
      return new Promise(resolve => {
        setProgressInfo(undefined);
        updateState({body: 'progress'});
        setUrlToDownload(url);
        rendererIpc.utils.downloadFile(url);
        rendererIpc.utils.offDownloadFile();
        rendererIpc.utils.onDownloadFile((_e, progress) => {
          if (progress.stage === 'done') {
            setProgressInfo(undefined);
            resolve(progress.finalPath);
          } else {
            setProgressInfo(progress);
          }
        });
      });
    },
    [setProgressInfo],
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
  });

  useEffect(() => {
    if (isOpen && methods && stepper) {
      if (type === 'install') {
        methods.startInstall(stepper);
      } else {
        methods.updater.startUpdate?.(stepper, installedCard!.dir);
      }
    }
  }, [isOpen, methods, stepper]);

  // -----------------------------------------------> Handle UI
  const handleClose = useCallback(() => {
    if (state.body === 'terminal') rendererIpc.pty.customProcess('stop');
    if (state.body === 'progress') {
      rendererIpc.utils.offDownloadFile();
      rendererIpc.utils.cancelDownload();
    }
    updateState(initialState);
    setCurrentStep(0);
    setSteps([]);

    dispatch(
      modalActions.setIsOpen({
        isOpen: false,
        modalName: 'installUIModal',
      }),
    );
  }, [updateState, state]);

  const onOpenChange = useCallback(
    (isOpen: boolean) =>
      dispatch(
        modalActions.setIsOpen({
          isOpen,
          modalName: 'installUIModal',
        }),
      ),
    [dispatch],
  );

  return (
    <Modal
      classNames={{
        backdrop: '!top-10',
        closeButton: 'cursor-default',
        wrapper: '!top-10 ',
      }}
      size="2xl"
      shadow="lg"
      backdrop="blur"
      isOpen={isOpen}
      isDismissable={false}
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      className={`${state.body === 'terminal' && 'max-w-[80%]'}`}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <InstallHeader steps={steps} currentStep={currentStep} />
        <InstallBody
          state={state}
          title={title}
          progressInfo={progressInfo}
          cloneResolver={cloneResolver}
          progressBarState={progressBarState}
          userInputElements={userInputElements}
          extensionsResolver={extensionsResolver}
          extensionsToInstall={extensionsToInstall}
          setUserElementsReturn={setUserElementsReturn}
        />
        <InstallFooter
          state={state}
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
      </ModalContent>
    </Modal>
  );
});

export default InstallModal;
