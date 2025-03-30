import {Button, ButtonGroup, ModalFooter} from '@heroui/react';
import {memo, RefObject, useCallback, useState} from 'react';

import {DownloadProgress} from '../../../../../../cross/IpcChannelAndTypes';
import {InstallationMethod, UserInputResult} from '../../../Modules/types';
import rendererIpc from '../../../RendererIpc';
import FooterTerminal from './Footer-Terminal';
import {InstallState} from './types';
import LocateWarning from './Utils/LocateWarning';

type Props = {
  state: InstallState;
  handleClose: () => void;
  restartTerminal: RefObject<(() => void) | null>;
  starterResolver: RefObject<((result: InstallationMethod) => void) | null>;
  terminalResolver: RefObject<(() => void) | null>;
  updateState: (newState: Partial<InstallState>) => void;
  userInputResolver: RefObject<((result: UserInputResult[]) => void) | null>;
  userElementsReturn: UserInputResult[];
  downloadFileFromUrl: (url: string) => Promise<string>;
  urlToDownload: string | undefined;
  progressInfo: DownloadProgress | undefined;
  cardId: string;
};

const InstallFooter = ({
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
}: Props) => {
  const [locateWarnIsOpen, setLocateWarnIsOpen] = useState<boolean>(false);
  const onDoneTerminal = useCallback(() => {
    if (terminalResolver.current) {
      rendererIpc.pty.customProcess(cardId, 'stop');
      terminalResolver.current();
      terminalResolver.current = null;
    }
  }, [terminalResolver]);

  const locate = useCallback(() => {
    rendererIpc.file.openDlg({properties: ['openDirectory']}).then(targetDirectory => {
      if (targetDirectory) {
        rendererIpc.appData.isAppDir(targetDirectory).then(isAppDir => {
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
        <LocateWarning isOpen={locateWarnIsOpen} setIsOpen={setLocateWarnIsOpen} />
        <Button
          variant="flat"
          onPress={handleClose}
          className="cursor-default"
          color={state.body === 'done' ? 'success' : 'danger'}>
          {state.body === 'done' ? 'OK' : 'Cancel'}
        </Button>
        {state.body === 'terminal' && (
          <FooterTerminal onDoneTerminal={onDoneTerminal} restartTerminal={restartTerminal} />
        )}
        {state.body === 'starter' && (
          <>
            {!state.disableSelectDir && (
              <Button variant="flat" onPress={locate} className="cursor-default">
                Locate
              </Button>
            )}
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
        {state.body === 'user-input' && (
          <Button
            onPress={() => {
              userInputResolver.current?.(userElementsReturn);
            }}
            variant="flat"
            color="success"
            className="cursor-default">
            Next
          </Button>
        )}
        {progressInfo?.stage === 'failed' && urlToDownload && (
          <Button variant="flat" className="cursor-default" onPress={() => downloadFileFromUrl(urlToDownload)}>
            Try Again
          </Button>
        )}
      </>
    );
  };

  return (
    <ModalFooter className="shrink-0 justify-between overflow-hidden bg-foreground-200 dark:bg-foreground-100">
      <ButtonGroup fullWidth>{renderFooterButtons()}</ButtonGroup>
    </ModalFooter>
  );
};
export default memo(InstallFooter);
