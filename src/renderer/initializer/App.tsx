import {Button} from '@heroui/react';
import {ConfigProvider, Popconfirm, Steps, theme} from 'antd';
import {useCallback, useState} from 'react';

import {APP_ICON_TRANSPARENT, APP_NAME} from '../../cross/CrossConstants';
import {Minimize_Icon} from '../src/assets/icons/SvgIcons/SvgIcons2';
import initializerIpc from './InitializerIpc';
import {useGitValidation} from './Steps/GitValidation';
import {useMainModuleInstallation} from './Steps/MainModuleInstallation';

/** Main application component for initialization process */
export default function App() {
  const [currentState, setCurrentState] = useState<number>(0);
  const [percent, setPercent] = useState<number | undefined>(undefined);

  const minimize = useCallback(() => initializerIpc.minimize(), []);
  const close = useCallback(() => initializerIpc.close(), []);
  const startApp = useCallback(() => initializerIpc.startApp(), []);

  const nextState = useCallback(() => {
    setCurrentState(prevState => prevState + 1);
  }, []);

  const steps = [
    useGitValidation(currentState === 0, nextState),
    useMainModuleInstallation(currentState === 1, nextState, setPercent),
    {
      title: 'All Done',
      description: `${APP_NAME} is ready to launch.`,
    },
  ];

  return (
    <ConfigProvider theme={{algorithm: theme.darkAlgorithm}}>
      <div
        className={
          'draggable absolute flex size-full flex-col content-center dark' +
          ' justify-between bg-LynxRaisinBlack text-center text-white'
        }>
        {/*#region Header */}
        <header
          className={
            'h-16 w-full shrink-0 content-center space-x-2 bg-white/5 shadow-xl border-b border-foreground-50/15'
          }>
          <img alt="App Icon" src={APP_ICON_TRANSPARENT} className="absolute left-4 top-4 size-8" />
          <span className="font-semibold">Checking Requirements...</span>
          <Button
            size="sm"
            variant="light"
            onPress={minimize}
            className="notDraggable absolute right-2 top-2 cursor-default text-white"
            isIconOnly>
            <Minimize_Icon />
          </Button>
        </header>
        {/*#endregion */}

        {/*#region Body */}
        <main className="flex size-full flex-col items-center justify-center mt-4 px-7">
          <Steps items={steps} percent={percent} className="w-full" direction="vertical" current={currentState} />
        </main>
        {/*#endregion */}

        {/*#region Footer */}
        <footer className="m-3 flex flex-col items-center">
          {currentState >= 3 ? (
            <Button radius="sm" color="success" onPress={startApp} className="notDraggable" fullWidth>
              Launch {APP_NAME}
            </Button>
          ) : (
            <Popconfirm
              title="Exit"
              okText="Exit"
              onConfirm={close}
              cancelText="Continue"
              rootClassName="notDraggable"
              okButtonProps={{danger: true}}
              cancelButtonProps={{type: 'primary'}}
              description="Are you sure you want to exit the initial process?">
              <Button color="danger" variant="faded" className="notDraggable cursor-default dark" fullWidth>
                Cancel
              </Button>
            </Popconfirm>
          )}
        </footer>
        {/*#endregion */}
      </div>
    </ConfigProvider>
  );
}
