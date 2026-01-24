import {Button, ButtonGroup} from '@heroui/react';
import {isLinuxPortable} from '@lynx/hooks/utils';
import {GitHub_Icon} from '@lynx_assets/icons';
import {ISSUE_PAGE} from '@lynx_common/consts';
import {isDev} from '@lynx_common/utils';
import applicationIpc from '@lynx_shared/ipc/application';
import {Result} from 'antd';
import {useCallback, useEffect} from 'react';
import {FallbackProps} from 'react-error-boundary';

import CopyClipboard from './CopyClipboard';

export default function ErrorWrapper({error, resetErrorBoundary}: FallbackProps) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleRestart = useCallback(() => {
    applicationIpc.send.changeWinState('restart');
  }, []);

  const handleClose = useCallback(() => {
    applicationIpc.send.changeWinState('close');
  }, []);

  const openIssues = () => applicationIpc.send.openUrlDefaultBrowser(ISSUE_PAGE);

  useEffect(() => {
    if (isDev()) console.error(errorObj);
  }, [errorObj]);

  return (
    <div className="bg-foreground-100 absolute inset-0">
      <div
        className={
          'absolute inset-2 rounded-lg bg-background flex items-center justify-center draggable overflow-hidden'
        }>
        <Result
          subTitle={
            <div className="text-danger flex items-center justify-center gap-2">
              {errorObj.message}
              <CopyClipboard
                className="notDraggable"
                tooltipTitle="Copy full error message"
                contentToCopy={`Message:\n${errorObj.message}\n\n\nStack:\n${errorObj.stack}`}
              />
            </div>
          }
          extra={
            <ButtonGroup fullWidth>
              <Button size="sm" key="retry" className="notDraggable" onPress={resetErrorBoundary}>
                Retry
              </Button>
              <Button size="sm" key="reload" color="warning" onPress={handleReload} className="notDraggable">
                Reload
              </Button>
              <Button
                size="sm"
                key="restart"
                color="danger"
                className="notDraggable"
                onPress={isLinuxPortable ? handleClose : handleRestart}>
                {isLinuxPortable ? 'Exit' : 'Restart'}
              </Button>
            </ButtonGroup>
          }
          status="403"
          className="text-center"
          title="Oops! Something went wrong."
        />
        <div className="flex flex-col gap-y-4 w-full bottom-0 absolute inset-x-0 text-center">
          <span className="text-warning">If the issue persists, please consider reporting it on GitHub issues.</span>
          <Button
            radius="none"
            variant="flat"
            color="warning"
            onPress={openIssues}
            className="notDraggable"
            startContent={<GitHub_Icon />}>
            GtiHub Issues
          </Button>
        </div>
      </div>
    </div>
  );
}
