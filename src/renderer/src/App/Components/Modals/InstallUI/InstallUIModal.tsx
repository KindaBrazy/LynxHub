import {
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
} from '@nextui-org/react';
import CloneRepo from '@renderer/App/Components/Modals/InstallUI/CloneRepo';
import TerminalStep from '@renderer/App/Components/Modals/InstallUI/TerminalStep';
import {useModules} from '@renderer/App/Modules/ModulesContext';
import {CardRendererMethods, InstallStarterStep, InstallStepperType} from '@renderer/App/Modules/types';
import {modalActions, useModalsState} from '@renderer/App/Redux/AI/ModalsReducer';
import {AppDispatch} from '@renderer/App/Redux/Store';
import rendererIpc from '@renderer/App/RendererIpc';
import {Descriptions, Popconfirm, Result, Steps} from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import {capitalize} from 'lodash';
import {Fragment, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {formatSize} from '../../../../../../cross/CrossUtils';
import {DownloadProgress} from '../../../../../../cross/IpcChannelAndTypes';
import InstallStepper from './InstallStepper';

type BodyState = 'starter' | 'clone' | 'terminal' | 'progress' | 'done' | '';

type InstallState = {
  body: BodyState;
  cloneUrl: string;
  doneAll: {type: 'success' | 'error'; title: string; description?: string};
  startClone: boolean;
};

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

export default function InstallUIModal() {
  const dispatch = useDispatch<AppDispatch>();
  const {getMethod} = useModules();
  const {isOpen, cardId, title} = useModalsState('installUIModal');

  // -----------------------------------------------> States
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<string[]>([]);
  const [state, setState] = useState<InstallState>(initialState);
  const updateState = useCallback((newState: Partial<InstallState>) => {
    setState(prevState => ({...prevState, ...newState}));
  }, []);

  const [methods, setMethods] = useState<CardRendererMethods['installUI']>();
  useEffect(() => {
    setMethods(getMethod(cardId, 'installUI'));
  }, [cardId]);

  const [progressInfo, setProgressInfo] = useState<DownloadProgress | undefined>(undefined);
  const [downloadFileUrl, setDownloadFileUrl] = useState<string | undefined>(undefined);

  // -----------------------------------------------> Resolvers
  const cloneResolver = useRef<((dir: string) => void) | null>(null);
  const terminalResolver = useRef<(() => void) | null>(null);
  const starterResolver = useRef<((result: InstallStarterStep) => void) | null>(null);
  const restartTerminal = useRef<(() => void) | null>(null);

  // -----------------------------------------------> Handle Cloning
  const doneClone = useCallback(
    (dir: string) => {
      if (cloneResolver.current) {
        cloneResolver.current(dir);
        cloneResolver.current = null;
      }
    },
    [cloneResolver],
  );

  const handleClone = useCallback(
    async (url: string): ReturnType<InstallStepperType['clone']> => {
      return new Promise(resolve => {
        cloneResolver.current = resolve;
        updateState({cloneUrl: url, body: 'clone'});
      });
    },
    [cloneResolver],
  );

  // -----------------------------------------------> Handle Finishing
  const setInstalled = useCallback(
    (dir: string) => {
      rendererIpc.storageUtils.addInstalledCard({dir, id: cardId});
    },
    [cardId],
  );

  const handleDone = useCallback((type: 'success' | 'error', title: string, description?: string) => {
    updateState({doneAll: {type, title, description}, body: 'done'});
  }, []);

  // -----------------------------------------------> Handle Terminal
  const onDoneTerminal = useCallback(() => {
    if (terminalResolver.current) {
      rendererIpc.pty.customProcess('stop');
      terminalResolver.current();
      terminalResolver.current = null;
    }
  }, [terminalResolver]);

  const executeTerminalFile = useCallback(
    async (dir: string, file: string): ReturnType<InstallStepperType['execTerminalFile']> => {
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

  const execTerminalCommands = useCallback(
    async (commands?: string | string[], dir?: string): ReturnType<InstallStepperType['execTerminalCommands']> => {
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

  // -----------------------------------------------> Handle Files
  const downloadFile = useCallback(
    async (url: string): ReturnType<InstallStepperType['downloadFile']> => {
      return new Promise(resolve => {
        setProgressInfo(undefined);
        updateState({body: 'progress'});
        setDownloadFileUrl(url);
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

  const decompressFile = useCallback(async (filePath: string): Promise<string> => {
    return rendererIpc.utils.decompressFile(filePath);
  }, []);

  const validateGitDir = useCallback(async (dir: string, url: string): Promise<boolean> => {
    return new Promise(resolve => {
      rendererIpc.git.validateGitDir(dir, url).then(resolve);
    });
  }, []);

  const checkFilesExist = useCallback(async (dir: string, filesName: string[]): Promise<boolean> => {
    return new Promise(resolve => {
      rendererIpc.file.checkFilesExist(dir, filesName).then(resolve);
    });
  }, []);

  const starterStep = useCallback(async (): Promise<InstallStarterStep> => {
    return new Promise(resolve => {
      starterResolver.current = resolve;
      updateState({body: 'starter'});
    });
  }, []);

  const utils: InstallStepperType['utils'] = useMemo(() => {
    return {decompressFile, validateGitDir, checkFilesExist};
  }, [decompressFile, validateGitDir]);

  // -----------------------------------------------> Initial Stepper
  const stepper = useMemo(() => {
    return new InstallStepper(
      setSteps,
      setCurrentStep,
      handleClone,
      setInstalled,
      handleDone,
      executeTerminalFile,
      execTerminalCommands,
      downloadFile,
      starterStep,
      utils,
    );
  }, [
    setSteps,
    setCurrentStep,
    handleClone,
    setInstalled,
    handleDone,
    executeTerminalFile,
    execTerminalCommands,
    downloadFile,
    decompressFile,
    starterStep,
  ]);

  useEffect(() => {
    if (isOpen && methods && stepper) {
      methods.startInstall(stepper);
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

  const locate = useCallback(() => {
    rendererIpc.file.openDlg('openDirectory').then(dir => {
      if (dir) starterResolver.current?.({chosen: 'locate', dir});
    });
  }, [starterResolver]);

  const renderBody = () => {
    switch (state.body) {
      case 'clone':
        return <CloneRepo done={doneClone} url={state.cloneUrl} start={state.startClone} />;
      case 'terminal':
        return <TerminalStep />;
      case 'progress':
        return progressInfo?.stage === 'failed' ? (
          <Result
            status="error"
            title="Download Failed"
            subTitle="Please check your internet connection and try again."
          />
        ) : (
          <div className="my-6">
            <Progress color="secondary" aria-label="aaaa" value={progressInfo?.percentage} showValueLabel />
            <Descriptions size="small" layout="vertical">
              <DescriptionsItem label="File Name">
                {progressInfo?.fileName ? capitalize(progressInfo.fileName) : 'Unknown'}
              </DescriptionsItem>
              <DescriptionsItem label="Downloaded So Far">
                {progressInfo?.downloaded ? formatSize(progressInfo.downloaded) : 'Calculating...'}
              </DescriptionsItem>
              <DescriptionsItem label="Total File Size">
                {progressInfo?.total ? formatSize(progressInfo.total) : 'Calculating...'}
              </DescriptionsItem>
            </Descriptions>
          </div>
        );
      case 'done':
        return <Result title={state.doneAll.title} status={state.doneAll.type} subTitle={state.doneAll.description} />;
      case 'starter':
        return (
          <div className="my-6 space-y-6 text-center">
            <p className="text-xl font-semibold">
              You're about to install <span className="font-bold">{capitalize(title)}</span>
            </p>
            <p>Choose an option below to proceed with the installation or locate a pre-existing installation.</p>
          </div>
        );
    }
    return <Fragment />;
  };

  const renderHeaderStepper = () => {
    return (
      <Steps
        items={steps.map(step => {
          return {title: <span className="text-foreground/80">{step}</span>};
        })}
        type="inline"
        current={currentStep}
        className="!w-full scale-125 items-center justify-center bg-foreground-200 dark:bg-foreground-100"
      />
    );
  };

  const renderFooterButtons = () => {
    return (
      <>
        <Button
          variant="flat"
          onPress={handleClose}
          className="cursor-default"
          color={state.body === 'done' ? 'success' : 'danger'}>
          {state.body === 'done' ? 'OK' : 'Cancel'}
        </Button>
        {state.body === 'terminal' && (
          <>
            <Popconfirm
              okText="Confirm"
              cancelText="Cancel"
              placement="topLeft"
              title="Confirm Terminal Restart"
              onConfirm={restartTerminal.current!}
              okButtonProps={{type: 'text', className: 'cursor-default'}}
              description="Are you sure you want to restart the terminal?"
              cancelButtonProps={{type: 'text', className: 'cursor-default !text-danger'}}>
              <Button variant="flat" color="warning" className="cursor-default">
                Restart Terminal
              </Button>
            </Popconfirm>
            <Popconfirm
              okText="All good"
              placement="topLeft"
              cancelText="Found error"
              onConfirm={onDoneTerminal}
              title="Installation complete?"
              okButtonProps={{type: 'text', className: 'cursor-default !text-success'}}
              cancelButtonProps={{type: 'text', className: 'cursor-default !text-danger'}}
              description="Please confirm that all commands finished successfully without any errors.">
              <Button variant="flat" color="success" className="cursor-default">
                Next
              </Button>
            </Popconfirm>
          </>
        )}
        {state.body === 'starter' && (
          <>
            <Button variant="flat" onPress={locate} className="cursor-default">
              Locate
            </Button>
            <Button
              variant="flat"
              color="success"
              className="cursor-default"
              onPress={() => starterResolver.current?.({chosen: 'install'})}>
              Start Installation
            </Button>
          </>
        )}
        {state.body === 'clone' && !state.startClone && (
          <Button
            variant="flat"
            color="success"
            className="cursor-default"
            onPress={() => updateState({startClone: true})}>
            Download
          </Button>
        )}
        {progressInfo?.stage === 'failed' && downloadFileUrl && (
          <Button variant="flat" className="cursor-default" onPress={() => downloadFile(downloadFileUrl)}>
            Try Again
          </Button>
        )}
      </>
    );
  };

  return (
    <Modal
      size="2xl"
      radius="sm"
      shadow="lg"
      isOpen={isOpen}
      backdrop="blur"
      isDismissable={false}
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      className={`${state.body === 'terminal' && 'max-w-[80%]'}`}
      classNames={{backdrop: 'top-10', closeButton: 'cursor-default', wrapper: 'top-10'}}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <ModalHeader className="shrink-0 overflow-hidden bg-foreground-200 shadow-md dark:bg-foreground-100">
          {renderHeaderStepper()}
        </ModalHeader>
        <ModalBody className="scrollbar-hide">{renderBody()}</ModalBody>
        <ModalFooter className="shrink-0 justify-between overflow-hidden bg-foreground-200 dark:bg-foreground-100">
          <ButtonGroup radius="sm" fullWidth>
            {renderFooterButtons()}
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
