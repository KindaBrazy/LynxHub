import {Stepper} from '@mantine/core';
import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@nextui-org/react';
import CloneRepo from '@renderer/App/Components/Modals/InstallUI/CloneRepo';
import LocateRepo from '@renderer/App/Components/Modals/InstallUI/LocateRepo';
import TerminalStep from '@renderer/App/Components/Modals/InstallUI/TerminalStep';
import {useModules} from '@renderer/App/Modules/ModulesContext';
import {CardRendererMethods, InstallCloneResult, InstallStepperType, InstallSteps} from '@renderer/App/Modules/types';
import {modalActions, useModalsState} from '@renderer/App/Redux/AI/ModalsReducer';
import {AppDispatch} from '@renderer/App/Redux/Store';
import rendererIpc from '@renderer/App/RendererIpc';
import {getColor} from '@renderer/App/Utils/Constants';
import {Popconfirm, Result} from 'antd';
import {Fragment, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import InstallStepper from './InstallStepper';

type BodyState = 'clone' | 'terminal' | 'done' | '';

type InstallState = {
  body: BodyState;
  cloneUrl: string;
  doneAll: {title: string; desc?: string};
  startClone: boolean;
};

const initialState: InstallState = {
  body: '',
  cloneUrl: '',
  doneAll: {title: '', desc: ''},
  startClone: false,
};

export default function InstallUIModal() {
  const dispatch = useDispatch<AppDispatch>();
  const {getMethod} = useModules();
  const {isOpen, cardId} = useModalsState('installUIModal');

  // -----------------------------------------------> States
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<InstallSteps[]>([]);
  const [state, setState] = useState<InstallState>(initialState);
  const updateState = useCallback((newState: Partial<InstallState>) => {
    setState(prevState => ({...prevState, ...newState}));
  }, []);

  const [methods, setMethods] = useState<CardRendererMethods['installUI']>();
  useEffect(() => {
    setMethods(getMethod(cardId, 'installUI'));
  }, [cardId]);

  // -----------------------------------------------> Resolvers
  const cloneResolver = useRef<((result: InstallCloneResult) => void) | null>(null);
  const terminalResolver = useRef<(() => void) | null>(null);
  const restartTerminal = useRef<(() => void) | null>(null);

  // -----------------------------------------------> Handle Cloning
  const doneClone = useCallback(
    (result: InstallCloneResult) => {
      if (cloneResolver.current) {
        cloneResolver.current(result);
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

  const handleLocated = useCallback((dir: string) => {
    doneClone({dir, locatedPreInstall: true});
  }, []);

  // -----------------------------------------------> Handle Finishing
  const setInstalled = useCallback(
    (dir: string) => {
      rendererIpc.storageUtils.addInstalledCard({dir, id: cardId});
    },
    [cardId],
  );

  const handleDone = useCallback((title: string, description?: string) => {
    updateState({doneAll: {title, desc: description}, body: 'done'});
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
    );
  }, [setSteps, setCurrentStep, handleClone, setInstalled, handleDone, executeTerminalFile, execTerminalCommands]);

  useEffect(() => {
    if (isOpen && methods && stepper) {
      methods.startInstall(stepper);
    }
  }, [isOpen, methods, stepper]);

  // -----------------------------------------------> Handle UI
  const handleClose = useCallback(() => {
    if (state.body === 'terminal') rendererIpc.pty.customProcess('stop');
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

  const renderBody = () => {
    switch (state.body) {
      case 'clone':
        return <CloneRepo done={doneClone} url={state.cloneUrl} start={state.startClone} />;
      case 'terminal':
        return <TerminalStep />;
      case 'done':
        return <Result status="success" title={state.doneAll.title} subTitle={state.doneAll.desc} />;
    }
    return <Fragment />;
  };

  const renderHeaderStepper = () => {
    return (
      <Stepper size="sm" className="w-full" active={currentStep} color={getColor('primary')}>
        {steps.map(step => (
          <Stepper.Step key={step.title} label={step.title} description={step.description} />
        ))}
      </Stepper>
    );
  };

  const renderFooterButtons = () => {
    return (
      <>
        <Button
          variant="light"
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
              <Button variant="light" color="warning" className="cursor-default">
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
              <Button color="success" variant="light" className="cursor-default">
                Next
              </Button>
            </Popconfirm>
          </>
        )}
        {state.body === 'clone' && !state.startClone && (
          <>
            <LocateRepo id={cardId} done={handleLocated} url={state.cloneUrl} />
            <Button
              variant="light"
              color="success"
              className="cursor-default"
              onPress={() => updateState({startClone: true})}>
              Install
            </Button>
          </>
        )}
      </>
    );
  };

  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      isDismissable={false}
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      className={`${state.body === 'terminal' && 'max-w-[80%]'}`}
      classNames={{backdrop: 'top-10', closeButton: 'cursor-default', wrapper: 'top-10'}}
      hideCloseButton>
      <ModalContent>
        <ModalHeader>{renderHeaderStepper()}</ModalHeader>
        <ModalBody className="scrollbar-hide">{renderBody()}</ModalBody>
        <ModalFooter>{renderFooterButtons()}</ModalFooter>
      </ModalContent>
    </Modal>
  );
}
