import {Button, ButtonGroup} from '@heroui/react';
import {Result} from 'antd';
import {useCallback, useEffect} from 'react';

import {ISSUE_PAGE} from '../../../cross/CrossConstants';
import {isDev} from '../../../cross/CrossUtils';
import {GitHub_Icon} from '../../shared/assets/icons';
import {isLinuxPortable} from '../hooks/utils';
import rendererIpc from '../services/RendererIpc';
import CopyClipboard from './CopyClipboard';

type Props = {error: Error; resetErrorBoundary: () => void};

export default function ErrorWrapper({error, resetErrorBoundary}: Props) {
  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleRestart = useCallback(() => {
    rendererIpc.win.changeWinState('restart');
  }, []);

  const handleClose = useCallback(() => {
    rendererIpc.win.changeWinState('close');
  }, []);

  const openIssues = () => rendererIpc.win.openUrlDefaultBrowser(ISSUE_PAGE);

  useEffect(() => {
    if (isDev()) console.error(error);
  }, [error]);

  return (
    <div className="bg-foreground-100 absolute inset-0">
      <div
        className={
          'absolute inset-2 rounded-lg bg-background flex items-center justify-center draggable overflow-hidden'
        }>
        <Result
          subTitle={
            <div className="text-danger flex items-center justify-center gap-2">
              {error.message}
              <CopyClipboard
                className="notDraggable"
                tooltipTitle="Copy full error message"
                contentToCopy={`Message:\n${error.message}\n\n\nStack:\n${error.stack}`}
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
