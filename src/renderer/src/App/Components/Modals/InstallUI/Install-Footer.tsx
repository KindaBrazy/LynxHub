import {Button, ButtonGroup, ModalFooter} from '@nextui-org/react';
import {Popconfirm} from 'antd';
import {memo, MutableRefObject, useCallback} from 'react';

import {DownloadProgress} from '../../../../../../cross/IpcChannelAndTypes';
import {InstallationMethod, UserInputResult} from '../../../Modules/types';
import rendererIpc from '../../../RendererIpc';
import {InstallState} from './types';

type Props = {
  state: InstallState;
  handleClose: () => void;
  restartTerminal: MutableRefObject<(() => void) | null>;
  starterResolver: MutableRefObject<((result: InstallationMethod) => void) | null>;
  terminalResolver: MutableRefObject<(() => void) | null>;
  updateState: (newState: Partial<InstallState>) => void;
  userInputResolver: MutableRefObject<((result: UserInputResult[]) => void) | null>;
  userElementsReturn: UserInputResult[];
  downloadFileFromUrl: (url: string) => Promise<string>;
  urlToDownload: string | undefined;
  progressInfo: DownloadProgress | undefined;
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
}: Props) => {
  const onDoneTerminal = useCallback(() => {
    if (terminalResolver.current) {
      rendererIpc.pty.customProcess('stop');
      terminalResolver.current();
      terminalResolver.current = null;
    }
  }, [terminalResolver]);

  const locate = useCallback(() => {
    rendererIpc.file.openDlg('openDirectory').then(targetDirectory => {
      if (targetDirectory) starterResolver.current?.({chosen: 'locate', targetDirectory});
    });
  }, [starterResolver]);

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
      <ButtonGroup radius="sm" fullWidth>
        {renderFooterButtons()}
      </ButtonGroup>
    </ModalFooter>
  );
};
export default memo(InstallFooter);
