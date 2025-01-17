import {Button} from '@heroui/react';
import {Result} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {isRouteErrorResponse, useRouteError} from 'react-router';

import rendererIpc from '../../RendererIpc';

// Page when router id is not valid
export default function RouterMainError() {
  const error = useRouteError();

  const [status, setStatus] = useState<string>('500');
  const [title, setTitle] = useState<string>('Oops! Something went wrong.');
  const [subTitle, setSubTitle] = useState<string>('Sorry, an unexpected error has occurred.');

  useEffect(() => {
    if (isRouteErrorResponse(error)) {
      setStatus(error.status.toString());
      setTitle(error.statusText);
      setSubTitle(error.data?.message || 'An error occurred while loading this page.');
    } else if (error instanceof Error) {
      setSubTitle(error.message);
    }
  }, [error]);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleRestart = useCallback(() => {
    rendererIpc.win.changeWinState('restart');
  }, []);

  return (
    <Result
      extra={[
        <Button key="reload" color="warning" onPress={handleReload} className="notDraggable">
          Reload
        </Button>,
        <Button key="restart" color="danger" onPress={handleRestart} className="notDraggable">
          Restart
        </Button>,
      ]}
      title={<span className="text-foreground">{title}</span>}
      subTitle={<span className="text-foreground-500">{subTitle}</span>}
      className="draggable absolute inset-0 bg-GradientLight dark:bg-GradientDark"
      status={status as '403' | '404' | '500' | 'success' | 'error' | 'info' | 'warning'}
    />
  );
}
