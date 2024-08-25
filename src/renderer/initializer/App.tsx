import {Button} from '@nextui-org/react';
import {ConfigProvider, Popconfirm, Steps, theme} from 'antd';
import {useCallback, useState} from 'react';

import {APP_ICON_TRANSPARENT, APP_NAME} from '../../cross/CrossConstants';
import {getIconByName} from '../src/assets/icons/SvgIconsContainer';
import initializerIpc from './InitializerIpc';
import {useGitValidation} from './Steps/GitValidation';
import {useMainModuleInstallation} from './Steps/MainModuleInstallation';
import {usePythonValidation} from './Steps/PythonValidation';

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
    usePythonValidation(currentState === 1, nextState),
    useMainModuleInstallation(currentState === 2, nextState, setPercent),
    {
      subTitle: currentState >= 3 ? '😃' : '',
      title: 'All Done',
      description: `${APP_NAME} is ready to launch.`,
    },
  ];

  return (
    <ConfigProvider theme={{algorithm: theme.darkAlgorithm}}>
      <div
        className={
          'draggable absolute flex size-full flex-col content-center ' +
          ' justify-between bg-LynxRaisinBlack text-center text-white'
        }>
        {/*#region Header */}
        <header className="size-14 w-full shrink-0 content-center space-x-2 bg-white/5 shadow-xl">
          <img alt="App Icon" src={APP_ICON_TRANSPARENT} className="absolute left-4 top-4 size-5" />
          <span>One-time Initial</span>
          <Button
            size="sm"
            variant="light"
            onPress={minimize}
            className="notDraggable absolute right-2 top-2 cursor-default text-white"
            isIconOnly>
            {getIconByName('Minimize')}
          </Button>
        </header>
        {/*#endregion */}

        {/*#region Body */}
        <main className="flex size-full flex-col items-center justify-center px-16">
          <Steps items={steps} percent={percent} className="w-full" direction="vertical" current={currentState} />
        </main>
        {/*#endregion */}

        {/*#region Footer */}
        <footer className="m-3 flex flex-col items-center">
          {currentState >= 3 ? (
            <Button radius="sm" color="success" onPress={startApp} className="notDraggable dark" fullWidth>
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
              <Button color="danger" variant="flat" className="notDraggable cursor-default dark" fullWidth>
                Exit
              </Button>
            </Popconfirm>
          )}
        </footer>
        {/*#endregion */}
      </div>
    </ConfigProvider>
  );
}
