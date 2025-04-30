import {Button, ButtonGroup} from '@heroui/react';
import {Result} from 'antd';
import {useCallback} from 'react';

import {ISSUE_PAGE} from '../../cross/CrossConstants';
import CopyClipboard from './App/Components/Reusable/CopyClipboard';
import rendererIpc from './App/RendererIpc';
import {isLinuxPortable} from './App/Utils/UtilHooks';
import {GitHub_Icon} from './assets/icons/SvgIcons/SvgIcons2';

type Props = {error: Error; resetErrorBoundary: () => void};

export default function ErrorComponent({error, resetErrorBoundary}: Props) {
  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleRestart = useCallback(() => {
    rendererIpc.win.changeWinState('restart');
  }, []);

  const handleClose = useCallback(() => {
    rendererIpc.win.changeWinState('close');
  }, []);

  const openIssues = () => window.open(ISSUE_PAGE);

  return (
    <div className="absolute inset-2 rounded-lg bg-black flex items-center justify-center draggable overflow-hidden">
      <Result
        subTitle={
          <div className="text-danger flex items-center justify-center gap-2">
            {error.message}
            <CopyClipboard
              className="notDraggable"
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
        title={<span className="text-white">Oops! Something went wrong.</span>}>
        <div className="flex flex-col gap-y-2 w-full bottom-0 absolute inset-x-0">
          <span className="text-warning">If the issue persists, please consider reporting it on GitHub issues.</span>
          <Button
            size="sm"
            radius="none"
            variant="light"
            color="warning"
            onPress={openIssues}
            className="notDraggable"
            startContent={<GitHub_Icon />}>
            GtiHub Issues
          </Button>
        </div>
      </Result>
    </div>
  );
}
