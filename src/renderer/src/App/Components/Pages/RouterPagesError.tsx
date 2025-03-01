import {Button} from '@heroui/react';
import {Result, Typography} from 'antd';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {isRouteErrorResponse, useNavigate, useRouteError} from 'react-router';

import {appActions, useAppState} from '../../Redux/Reducer/AppReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import {isLinuxPortable} from '../../Utils/UtilHooks';
import {homeRoutePath} from './ContentPages/Home/HomePage';
import Page from './Page';

// Page when router id is not valid
export default function RouterPagesError() {
  const error = useRouteError();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const darkMode = useAppState('darkMode');

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

  const handleBackHome = useCallback(() => {
    navigate(homeRoutePath);
    dispatch(appActions.setAppState({key: 'currentPage', value: homeRoutePath}));
  }, [navigate, dispatch]);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleRestart = useCallback(() => {
    rendererIpc.win.changeWinState('restart');
  }, []);

  const handleClose = useCallback(() => {
    rendererIpc.win.changeWinState('close');
  }, []);

  return (
    <Page>
      <OverlayScrollbarsComponent
        options={{
          overflow: {x: 'hidden', y: 'scroll'},
          scrollbars: {
            autoHide: 'scroll',
            clickScroll: true,
            theme: darkMode ? 'os-theme-light' : 'os-theme-dark',
          },
        }}
        element="div"
        className="size-full">
        <Result
          extra={[
            <Button size="sm" key="home" color="primary" onPress={handleBackHome}>
              Back Home
            </Button>,
            <Button size="sm" key="reload" color="warning" onPress={handleReload}>
              Reload
            </Button>,
            <Button size="sm" key="restart" color="danger" onPress={isLinuxPortable ? handleClose : handleRestart}>
              {isLinuxPortable ? 'Exit' : 'Restart'}
            </Button>,
          ]}
          title={title}
          subTitle={subTitle}
          className="text-center"
          status={status as '403' | '404' | '500' | 'success' | 'error' | 'info' | 'warning'}>
          <Typography.Paragraph type="warning" strong>
            <span>If you continue to experience problems, please open a new issue on my GitHub repository.</span>
            <br />
            <span>This will allow me to investigate and address the issue more effectively.</span>
          </Typography.Paragraph>
        </Result>
      </OverlayScrollbarsComponent>
    </Page>
  );
}
