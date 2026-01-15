import {Button, Checkbox} from '@heroui/react';
import {Forward2, Restart} from '@solar-icons/react-perf/BoldDuotone';
import {Typography} from 'antd';
import {X} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';

import rendererIpc from '../../src/App/RendererIpc';
import {isLinuxPortable} from '../../src/App/Utils/UtilHooks';
import {Power_Icon} from '../../src/assets/icons/SvgIcons/SvgIcons';
import {SetElementsType, SetWidthSizeType} from './ContextHooks';

const hideWindow = () => rendererIpc.contextMenu.hideWindow();

export function useCloseAppMenu(setElements: SetElementsType, setWidthSize: SetWidthSizeType) {
  const [toggle, setToggle] = useState<boolean>(false);
  const [showConfirmValue, setShowConfirmValue] = useState<boolean>(false);

  const onShowConfirm = (enabled: boolean) => {
    rendererIpc.storageUtils.setShowConfirm('closeConfirm', !enabled);
    setShowConfirmValue(enabled);
  };
  const onRestart = () => rendererIpc.win.changeWinState('restart');
  const onClose = () => rendererIpc.win.changeWinState('close');

  useEffect(() => {
    rendererIpc.storage.get('app').then(({closeConfirm}) => {
      setShowConfirmValue(!closeConfirm);
    });
    setElements([
      <div className="py-4 px-8" key="close_app_confirm">
        <span className="self-start text-medium font-semibold">Confirm Exit</span>
        <div className="mt-2 flex flex-col space-y-1">
          <Typography.Text>Are you sure you want to exit the application?</Typography.Text>
          <Checkbox size="sm" isSelected={showConfirmValue} onValueChange={onShowConfirm}>
            Always exit without confirmation
          </Checkbox>
        </div>
        <div className="mt-2 flex w-full flex-row justify-between">
          <Button size="sm" color="success" onPress={hideWindow} startContent={<Forward2 className="rotate-180" />}>
            Stay
          </Button>
          <div className="space-x-2">
            {!isLinuxPortable && (
              <Button size="sm" color="warning" onPress={onRestart} startContent={<Restart />}>
                Restart
              </Button>
            )}
            <Button size="sm" color="danger" onPress={onClose} startContent={<Power_Icon />}>
              Exit
            </Button>
          </div>
        </div>
      </div>,
    ]);
  }, [toggle, showConfirmValue]);

  useEffect(() => {
    const offCloseApp = rendererIpc.contextMenu.onCloseApp(() => {
      setToggle(prevState => !prevState);

      setWidthSize('lg');

      rendererIpc.contextMenu.showWindow();
    });

    return () => offCloseApp();
  }, [setElements, setWidthSize]);
}

export function useTerminateTabMenu(setElements: SetElementsType, setWidthSize: SetWidthSizeType) {
  const [id, setId] = useState<string>('');
  const [toggle, setToggle] = useState<boolean>(false);
  const [showConfirmValue, setShowConfirmValue] = useState<boolean>(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onShowConfirm = (enabled: boolean) => {
    rendererIpc.storageUtils.setShowConfirm('closeTabConfirm', !enabled);
    setShowConfirmValue(enabled);
  };
  const removeTab = () => {
    rendererIpc.contextMenu.removeTab(id);
    hideWindow();
  };

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    rendererIpc.storage.get('app').then(({closeTabConfirm}) => {
      setShowConfirmValue(!closeTabConfirm);
    });
    setElements([
      <div key="terminate_tab" className="py-4 px-5">
        <span className="self-start text-medium font-semibold">Close Terminal Tab?</span>

        <div className="mt-2 flex flex-col space-y-1">
          <Typography.Text>This will terminate running processes.</Typography.Text>

          <Checkbox size="sm" isSelected={showConfirmValue} onValueChange={onShowConfirm}>
            Always close terminal tabs without confirmation
          </Checkbox>
        </div>

        <div className="mt-2 flex w-full flex-row justify-between">
          <Button size="sm" onPress={hideWindow} startContent={<Forward2 className="rotate-180" />}>
            Cancel
          </Button>
          <Button
            size="sm"
            color="danger"
            onPress={removeTab}
            ref={closeButtonRef}
            startContent={<X className="size-3.5" />}>
            Close Tab
          </Button>
        </div>
      </div>,
    ]);

    // Auto-focus the close button when dialog appears
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    focusTimeoutRef.current = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);
  }, [id, toggle, showConfirmValue]);

  useEffect(() => {
    const offTerminateTab = rendererIpc.contextMenu.onTerminateTab((_, webID) => {
      setToggle(prevState => !prevState);
      setId(webID);

      setWidthSize('lg');

      rendererIpc.contextMenu.showWindow();
    });

    return () => offTerminateTab();
  }, [setElements, setWidthSize]);
}

export function useTerminateAIMenu(setElements: SetElementsType, setWidthSize: SetWidthSizeType) {
  const [id, setId] = useState<string>('');
  const [toggle, setToggle] = useState<boolean>(false);
  const [showConfirmValue, setShowConfirmValue] = useState<boolean>(false);

  const onShowConfirm = (enabled: boolean) => {
    rendererIpc.storageUtils.setShowConfirm('terminateAIConfirm', !enabled);
    setShowConfirmValue(enabled);
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
    rendererIpc.storage.get('app').then(({terminateAIConfirm}) => {
      setShowConfirmValue(!terminateAIConfirm);
    });
    setElements([
      <div className="py-4 px-5" key="terminate_ai_confirm">
        <span className="self-start text-medium font-semibold">Terminate AI Execution</span>
        <div className="mt-2 flex flex-col space-y-1">
          <Typography.Text>
            Stopping the AI will end its execution immediately.
            <br /> Unsaved data will be lost. Continue?
          </Typography.Text>
          <Checkbox size="sm" isSelected={showConfirmValue} onValueChange={onShowConfirm}>
            Always terminate without confirmation
          </Checkbox>
        </div>
        <div className="mt-2 flex w-full flex-row justify-between">
          <Button size="sm" color="success" onPress={hideWindow} startContent={<Forward2 className="rotate-180" />}>
            Keep Running
          </Button>
          <div className="space-x-2">
            <Button size="sm" color="warning" onPress={onRelaunch} startContent={<Restart />}>
              Relaunch
            </Button>
            <Button size="sm" color="danger" onPress={onStop} startContent={<Power_Icon />}>
              Terminate
            </Button>
          </div>
        </div>
      </div>,
    ]);
  }, [id, toggle, showConfirmValue]);

  useEffect(() => {
    const offTerminateAI = rendererIpc.contextMenu.onTerminateAI((_, targetID) => {
      setToggle(prevState => !prevState);
      setId(targetID);

      setWidthSize('lg');

      rendererIpc.contextMenu.showWindow();
    });

    return () => offTerminateAI();
  }, [setElements, setWidthSize]);
}
