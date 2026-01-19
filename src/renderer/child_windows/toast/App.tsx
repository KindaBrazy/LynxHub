import {Button} from '@heroui/react';
import {Power_Icon} from '@lynx_assets/icons';
import {appWindowChannels} from '@lynx_cross/consts/ipc';
import {ToastWindow_MessageType} from '@lynx_cross/types';
import {CheckCircle, DangerCircle, InfoCircle, Refresh, ShieldCross} from '@solar-icons/react-perf/BoldDuotone';
import {X} from 'lucide-react';
import {useEffect, useState} from 'react';

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="size-7 text-emerald-500" />;
    case 'warning':
      return <DangerCircle className="size-7 text-amber-500" />;
    case 'error':
      return <ShieldCross className="size-7 text-red-500" />;
    case 'info':
      return <InfoCircle className="size-7 text-blue-500" />;
    default:
      return <InfoCircle className="size-7 text-foreground" />;
  }
};

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-l-emerald-500';
    case 'warning':
      return 'border-l-amber-500';
    case 'error':
      return 'border-l-red-500';
    case 'info':
      return 'border-l-blue-500';
    default:
      return 'border-l-gray-500';
  }
};

export default function ToastContent() {
  const [toastMessage, setToastMessage] = useState<ToastWindow_MessageType | null>(null);

  useEffect(() => {
    const offMessage = window.electron.ipcRenderer.on('show_message', (_, result: ToastWindow_MessageType) => {
      setToastMessage(result);
      document.title = result.title;
    });
    return () => {
      offMessage();
    };
  }, []);

  const handleClose = () => {
    window.electron.ipcRenderer.send('close_toast');
  };

  const handleExitApp = () => {
    window.electron.ipcRenderer.send('exit_app');
  };

  const handleRestart = () => {
    window.electron.ipcRenderer.send('restart_app');
  };

  if (!toastMessage) return null;

  return (
    <div
      className={
        `${getTypeStyles(toastMessage.type)} size-full overflow-hidden scrollbar-hide ` +
        ` border-l-8 transition-all duration-300 ease-out draggable flex flex-col dark:bg-LynxRaisinBlack bg-white`
      }>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-foreground-100">
        <div className="flex items-center gap-3">
          <div className="shrink-0">{getIcon(toastMessage.type)}</div>
          <h2 className="text-lg font-semibold text-foreground-800">{toastMessage.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-foreground-500">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Content */}
      <div className="h-33 overflow-hidden notDraggable">
        <div className="px-4 py-2 overflow-y-auto size-full">
          <span className="text-foreground-600 leading-relaxed">{toastMessage.message}</span>
        </div>
      </div>

      {/* Footer with subtle pattern */}
      <div className="px-7 h-14 flex justify-between items-center border-foreground-100">
        <div>
          {toastMessage.buttons && toastMessage.buttons.includes('close') && (
            <Button
              size={'sm'}
              onPress={handleClose}
              className={'notDraggable'}
              startContent={<X className={'size-3.5'} />}>
              Close Toast
            </Button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {toastMessage.buttons && toastMessage.buttons.includes('restart') && (
            <Button
              size={'sm'}
              color={'primary'}
              onPress={handleRestart}
              className={'notDraggable'}
              startContent={<Refresh className={'size-3.5'} />}>
              Restart LynxHub
            </Button>
          )}
          {toastMessage.buttons && toastMessage.buttons.includes('exit') && (
            <Button
              size={'sm'}
              color={'danger'}
              onPress={handleExitApp}
              className={'notDraggable'}
              startContent={<Power_Icon className={'size-3.5'} />}>
              Exit LynxHub
            </Button>
          )}

          {toastMessage.customButtons &&
            toastMessage.customButtons.map(btn => (
              <Button
                size="sm"
                key={btn.id}
                color={btn.color}
                className={`notDraggable ${btn.cursor === 'default' && 'cursor-default'}`}
                onPress={() => window.electron.ipcRenderer.send(appWindowChannels.toastBtnPress, btn.id)}>
                {btn.label}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
