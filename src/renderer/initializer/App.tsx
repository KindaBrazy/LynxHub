import {Button} from '@heroui/react';
import {ConfigProvider, Steps, theme} from 'antd';
import {useCallback, useState} from 'react';

import {APP_ICON_TRANSPARENT, APP_NAME} from '../../cross/CrossConstants';
import initializerIpc from './InitializerIpc';
import {useGitValidation} from './Steps/GitValidation';
import {useMainModuleInstallation} from './Steps/MainModuleInstallation';
import CancelBtn from './CancelBtn';
import {isLinuxPortable} from '../src/App/Utils/UtilHooks';

// Are you sure you want to exit the initial process?

/** Main application component for initialization process */
export default function App() {
  const [currentState, setCurrentState] = useState<number>(0);
  const [percent, setPercent] = useState<number | undefined>(undefined);

  const startApp = useCallback(() => initializerIpc.startApp(), []);

  const nextState = useCallback(() => {
    setCurrentState(prevState => prevState + 1);
  }, []);

  const steps = [
    useGitValidation(currentState === 0, nextState),
    useMainModuleInstallation(currentState === 1, nextState, setPercent),
    {
      title: 'All Done!',
      description: `${APP_NAME} is ready to launch.`,
    },
  ];

  const close = useCallback(() => initializerIpc.close(), []);

  return (
    <ConfigProvider theme={{algorithm: theme.darkAlgorithm}}>
      <div
        className={
          'draggable absolute flex size-full flex-col content-center dark' +
          ' justify-between bg-LynxRaisinBlack text-center text-white'
        }>
        <header className={'h-16 w-full shrink-0 flex justify-between items-center bg-white/5 shadow-sm px-4'}>
          <img alt="App Icon" src={APP_ICON_TRANSPARENT} className="size-8" />
          <span className="font-semibold">Checking Requirements...</span>
          <div />
        </header>

        <main className="flex size-full flex-col items-center justify-center mt-4 px-7">
          <Steps items={steps} percent={percent} className="w-full" direction="vertical" current={currentState} />
        </main>

        <footer className="m-3 flex flex-col items-center">
          {currentState >= 3 ? (
            <Button color="success" onPress={isLinuxPortable ? close : startApp} className="notDraggable" fullWidth>
              {isLinuxPortable ? <span>Exit Initializer</span> : <span>Launch {APP_NAME}</span>}
            </Button>
          ) : (
            <CancelBtn />
          )}
        </footer>
      </div>
    </ConfigProvider>
  );
}
