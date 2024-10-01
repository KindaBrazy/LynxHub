import {Modal, ModalContent} from '@nextui-org/react';
import InstallHeader from '@renderer/App/Components/Modals/InstallUI/Install-Header';
import {useStepper} from '@renderer/App/Components/Modals/InstallUI/Install-Hooks';
import {InstallState} from '@renderer/App/Components/Modals/InstallUI/types';
import {useModules} from '@renderer/App/Modules/ModulesContext';
import {
  CardRendererMethods,
  InstallationMethod,
  InstallationStepper,
  UserInputField,
  UserInputResult,
} from '@renderer/App/Modules/types';
import {modalActions, useModalsState} from '@renderer/App/Redux/AI/ModalsReducer';
import {AppDispatch} from '@renderer/App/Redux/Store';
import rendererIpc from '@renderer/App/RendererIpc';
import {useInstalledCard} from '@renderer/App/Utils/UtilHooks';
import {memo, useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {DownloadProgress} from '../../../../../../cross/IpcChannelAndTypes';
import InstallBody from './Install-Body';
import InstallFooter from './Install-Footer';

const initialState: InstallState = {
  body: '',
  cloneUrl: '',
  doneAll: {
    title: '',
    description: '',
    type: 'success',
  },
  startClone: false,
};

const InstallUIModal = () => {
  const {isOpen, cardId, title, type} = useModalsState('installUIModal');
  const {getMethod} = useModules();
  const installedCard = useInstalledCard(cardId);

  const dispatch = useDispatch<AppDispatch>();

  // -----------------------------------------------> States
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [state, setState] = useState<InstallState>(initialState);

  const [methods, setMethods] = useState<CardRendererMethods['manager']>();

  const [progressInfo, setProgressInfo] = useState<DownloadProgress | undefined>(undefined);
  const [urlToDownload, setUrlToDownload] = useState<string | undefined>(undefined);

  const [userInputElements, setUserInputElements] = useState<UserInputField[]>([]);
  const [userElementsReturn, setUserElementsReturn] = useState<UserInputResult[]>([]);

  const updateState = useCallback((newState: Partial<InstallState>) => {
    setState(prevState => ({...prevState, ...newState}));
  }, []);

  useEffect(() => {
    setMethods(getMethod(cardId, 'manager'));
  }, [cardId]);

  // -----------------------------------------------> Resolvers
  const cloneResolver = useRef<((dir: string) => void) | null>(null);
  const terminalResolver = useRef<(() => void) | null>(null);
  const starterResolver = useRef<((result: InstallationMethod) => void) | null>(null);
  const userInputResolver = useRef<((result: UserInputResult[]) => void) | null>(null);
  const restartTerminal = useRef<(() => void) | null>(null);

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
        backdrop: 'top-10',
        closeButton: 'cursor-default',
        wrapper: 'top-10 ',
      }}
      size="2xl"
      radius="sm"
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
          userInputElements={userInputElements}
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
};

export default memo(InstallUIModal);
