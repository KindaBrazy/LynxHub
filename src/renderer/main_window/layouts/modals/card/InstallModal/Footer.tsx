import {Button, ButtonGroup, ModalFooter} from '@heroui/react';
import {DownloadProgress} from '@lynx_common/types/ipc';
import {InstallationMethod, UserInputResult} from '@lynx_common/types/plugins/modules';
import applicationIpc from '@lynx_shared/ipc/application';
import filesIpc from '@lynx_shared/ipc/files';
import ptyIpc from '@lynx_shared/ipc/pty';
import {ArrowRight, Download, FolderOpen, Restart} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead} from '@solar-icons/react-perf/LineDuotone';
import {X} from 'lucide-react';
import {memo, RefObject, useCallback, useState} from 'react';

import LocateWarning from './LocateWarning';
import FooterTerminal from './TerminalStepFooter';
import {InstallState} from './types';

type Props = {
  state: InstallState;
  handleClose: () => void;
  restartTerminal: RefObject<(() => void) | null>;
  starterResolver: RefObject<((result: InstallationMethod) => void) | null>;
  terminalResolver: RefObject<(() => void) | null>;
  updateState: (newState: Partial<InstallState> | ((prev: InstallState) => Partial<InstallState>)) => void;
  userInputResolver: RefObject<((result: UserInputResult[]) => void) | null>;
  userElementsReturn: UserInputResult[];
  downloadFileFromUrl: (url: string) => Promise<string>;
  urlToDownload: string | undefined;
  progressInfo: DownloadProgress | undefined;
  cardId: string;
  tabId: string;
  canContinue: boolean;
  nextStep: () => void;
};

const InstallFooter = memo(
  ({
    state,
    handleClose,
    restartTerminal,
    starterResolver,
    updateState,
    userInputResolver,
    userElementsReturn,
    terminalResolver,
    downloadFileFromUrl,
    urlToDownload,
    progressInfo,
    cardId,
    tabId,
    canContinue,
    nextStep,
  }: Props) => {
    const [locateWarnIsOpen, setLocateWarnIsOpen] = useState<boolean>(false);
    const onDoneTerminal = useCallback(() => {
      if (terminalResolver.current) {
        ptyIpc.stop(cardId);
        terminalResolver.current();
        terminalResolver.current = null;
      }
    }, [terminalResolver]);

    const locate = useCallback(() => {
      filesIpc.openDlg({properties: ['openDirectory']}).then(targetDirectory => {
        if (targetDirectory) {
          applicationIpc.invoke.isValidDataPath(targetDirectory).then(isAppDir => {
            if (isAppDir) {
              setLocateWarnIsOpen(true);
            } else {
              starterResolver.current?.({chosen: 'locate', targetDirectory});
            }
          });
        }
      });
    }, [starterResolver]);

    const renderFooterButtons = () => {
      return (
        <>
          <LocateWarning tabId={tabId} isOpen={locateWarnIsOpen} setIsOpen={setLocateWarnIsOpen} />
          <Button
            variant="flat"
            onPress={handleClose}
            color={state.body === 'done' ? 'success' : 'danger'}
            startContent={state.body === 'done' ? <CheckRead className="size-4" /> : <X className="size-3.5" />}>
            {state.body === 'done' ? 'OK' : 'Cancel'}
          </Button>
          {state.body === 'terminal' && (
            <FooterTerminal onDoneTerminal={onDoneTerminal} restartTerminal={restartTerminal} />
          )}
          {state.body === 'starter' && (
            <>
              {!state.disableSelectDir && (
                <Button variant="flat" onPress={locate} startContent={<FolderOpen />}>
                  Locate
                </Button>
              )}
              <Button
                variant="flat"
                color="success"
                endContent={<ArrowRight className="size-4" />}
                onPress={() => starterResolver.current?.({chosen: 'install'})}>
                Start Installation
              </Button>
            </>
          )}
          {state.body === 'clone' && !state.startClone && (
            <Button
              variant="flat"
              color="success"
              startContent={<Download className="size-4" />}
              onPress={() => updateState({startClone: true})}>
              Download
            </Button>
          )}
          {state.body === 'user-input' && (
            <Button
              onPress={() => {
                userInputResolver.current?.(userElementsReturn);
              }}
              variant="flat"
              color="success"
              isDisabled={!canContinue}
              endContent={<ArrowRight className="size-4" />}>
              Next
            </Button>
          )}
          {state.body === 'extension-custom' && (
            <Button variant="flat" color="success" onPress={nextStep} endContent={<ArrowRight className="size-4" />}>
              Next
            </Button>
          )}
          {progressInfo?.stage === 'failed' && urlToDownload && (
            <Button
              variant="flat"
              startContent={<Restart className="size-4" />}
              onPress={() => downloadFileFromUrl(urlToDownload)}>
              Try Again
            </Button>
          )}
        </>
      );
    };

    return (
      <ModalFooter className="shrink-0 justify-between overflow-hidden bg-foreground-100">
        <ButtonGroup fullWidth>{renderFooterButtons()}</ButtonGroup>
      </ModalFooter>
    );
  },
);

export default InstallFooter;
