import {Button, Checkbox} from '@heroui/react';
import {Typography} from 'antd';
import {useEffect, useState} from 'react';

import rendererIpc from '../../src/App/RendererIpc';
import {isLinuxPortable} from '../../src/App/Utils/UtilHooks';
import {SetElementsType, SetWidthSizeType} from './ContextHooks';

const hideWindow = () => rendererIpc.contextMenu.hideWindow();

export function useCloseAppMenu(setElements: SetElementsType, setWidthSize: SetWidthSizeType) {
  const [toggle, setToggle] = useState<boolean>(false);

  const onShowConfirm = () => {};
  const onCancel = () => {};
  const onRestart = () => {};
  const onClose = () => {};

  useEffect(() => {
    setElements([
      <div className="py-4 px-8" key="close_app_confirm">
        <span className="self-start text-medium font-semibold">Confirm Exit</span>
        <div className="mt-2 flex flex-col space-y-1">
          <Typography.Text>Are you sure you want to exit the application?</Typography.Text>
          <Checkbox size="sm" onValueChange={onShowConfirm}>
            Always exit without confirmation
          </Checkbox>
        </div>
        <div className="mt-2 flex w-full flex-row justify-between">
          <Button size="sm" color="success" onPress={onCancel}>
            Stay
          </Button>
          <div className="space-x-2">
            {!isLinuxPortable && (
              <Button size="sm" color="warning" onPress={onRestart}>
                Restart
              </Button>
            )}
            <Button size="sm" color="danger" onPress={onClose}>
              Exit
            </Button>
          </div>
        </div>
      </div>,
    ]);
  }, [toggle]);

  useEffect(() => {
    rendererIpc.contextMenu.onCloseApp(() => {
      setToggle(prevState => !prevState);

      setWidthSize('lg');

      rendererIpc.contextMenu.showWindow();
    });

    return () => {
      rendererIpc.contextMenu.offCloseApp();
    };
  }, [setElements, setWidthSize]);
}

export function useTerminateTabMenu(setElements: SetElementsType, setWidthSize: SetWidthSizeType) {
  const [id, setId] = useState<string>('');
  const [toggle, setToggle] = useState<boolean>(false);

  const onShowConfirm = (enabled: boolean) => {
    rendererIpc.storageUtils.setShowConfirm('closeTabConfirm', !enabled);
  };
  const onKeepRun = () => hideWindow();
  const removeTab = () => {
    rendererIpc.contextMenu.removeTab(id);
    hideWindow();
  };

  useEffect(() => {
    setElements([
      <div key="terminate_tab" className="py-4 px-5">
        <span className="self-start text-medium font-semibold">Close Terminal Tab?</span>

        <div className="mt-2 flex flex-col space-y-1">
          <Typography.Text>This will terminate running processes.</Typography.Text>

          <Checkbox size="sm" onValueChange={onShowConfirm}>
            Always close terminal tabs without confirmation
          </Checkbox>
        </div>

        <div className="mt-2 flex w-full flex-row justify-between">
          <Button size="sm" onPress={onKeepRun}>
            Cancel
          </Button>
          <div className="space-x-2">
            <Button size="sm" color="danger" onPress={removeTab}>
              Close Tab
            </Button>
          </div>
        </div>
      </div>,
    ]);
  }, [id, toggle]);

  useEffect(() => {
    rendererIpc.contextMenu.onTerminateTab((_, webID) => {
      setToggle(prevState => !prevState);
      setId(webID);

      setWidthSize('lg');

      rendererIpc.contextMenu.showWindow();
    });

    return () => {
      rendererIpc.contextMenu.offTerminateTab();
    };
  }, [setElements, setWidthSize]);
}

export function useTerminateAIMenu(setElements: SetElementsType, setWidthSize: SetWidthSizeType) {
  const [id, setId] = useState<string>('');
  const [toggle, setToggle] = useState<boolean>(false);

  const onShowConfirm = (enabled: boolean) => {
    rendererIpc.storageUtils.setShowConfirm('terminateAIConfirm', !enabled);
  };
  const onStop = () => {
    rendererIpc.contextMenu.stopAI(id);
    hideWindow();
  };
  const onRelaunch = () => {
    rendererIpc.contextMenu.relaunchAI(id);
    hideWindow();
  };

  useEffect(() => {
    setElements([
      <div className="py-4 px-5" key="terminate_ai_confirm">
        <span className="self-start text-medium font-semibold">Terminate AI Execution</span>
        <div className="mt-2 flex flex-col space-y-1">
          <Typography.Text>
            Stopping the AI will end its execution immediately.
            <br /> Unsaved data will be lost. Continue?
          </Typography.Text>
          <Checkbox size="sm" onValueChange={onShowConfirm}>
            Always terminate without confirmation
          </Checkbox>
        </div>
        <div className="mt-2 flex w-full flex-row justify-between">
          <Button size="sm" color="success" onPress={hideWindow}>
            Keep Running
          </Button>
          <div className="space-x-2">
            <Button size="sm" color="warning" onPress={onRelaunch}>
              Relaunch
            </Button>
            <Button size="sm" color="danger" onPress={onStop}>
              Terminate
            </Button>
          </div>
        </div>
      </div>,
    ]);
  }, [id, toggle]);

  useEffect(() => {
    rendererIpc.contextMenu.onTerminateAI((_, targetID) => {
      setToggle(prevState => !prevState);
      setId(targetID);

      setWidthSize('lg');

      rendererIpc.contextMenu.showWindow();
    });

    return () => {
      rendererIpc.contextMenu.offTerminateAI();
    };
  }, [setElements, setWidthSize]);
}
