import {Button} from '@heroui/react';
import {useEffect, useState} from 'react';

import {ToastWindow_MessageType} from '../../cross/CrossTypes';
import {
  AlertCircle_Icon,
  AlertTriangle_Icon,
  CheckCircle_Icon,
  CloseSimple_Icon,
  Info_Icon,
  Power_Icon,
  Refresh3_Icon,
} from '../src/assets/icons/SvgIcons/SvgIcons';

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle_Icon className="w-6 h-6 text-emerald-500" />;
    case 'warning':
      return <AlertTriangle_Icon className="w-6 h-6 text-amber-500" />;
    case 'error':
      return <AlertCircle_Icon className="w-6 h-6 text-red-500" />;
    case 'info':
      return <Info_Icon className="w-6 h-6 text-blue-500" />;
    default:
      return <Info_Icon className="w-6 h-6 text-gray-500" />;
  }
};

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20';
    case 'warning':
      return 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20';
    case 'error':
      return 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20';
    case 'info':
      return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20';
    default:
      return 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-950/20';
  }
};

export default function ToastContent() {
  const [toastMessage, setToastMessage] = useState<ToastWindow_MessageType | null>(null);

  useEffect(() => {
    window.ipc.on('show_message', (_, result: ToastWindow_MessageType) => {
      setToastMessage(result);
      document.title = result.title;
      document.body.className = 'overflow-hidden dark bg-background scrollbar-hide';
    });
  }, []);

  const handleClose = () => {
    window.ipc.send('close_toast');
  };

  const handleExitApp = () => {
    window.ipc.send('exit_app');
  };

  const handleRestart = () => {
    window.ipc.send('restart_app');
  };

  if (!toastMessage) {
    return null;
  }

  return (
    <div
      className={`
          ${getTypeStyles(toastMessage.type)}
          relative indent-0 overflow-hidden border-l-8 bg-white/95 dark:bg-gray-900/95 
          backdrop-blur-xl shadow-2xl transition-all duration-300 ease-out draggable
          `}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{getIcon(toastMessage.type)}</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{toastMessage.title}</h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{toastMessage.message}</div>
      </div>

      {/* Footer with subtle pattern */}
      <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center">
          <div>
            {toastMessage.buttons.includes('close') && (
              <Button
                size={'sm'}
                onPress={handleClose}
                className={'notDraggable'}
                startContent={<CloseSimple_Icon className={'size-3.5'} />}>
                Close Toast
              </Button>
            )}
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {toastMessage.buttons.includes('exit') && (
              <Button
                size={'sm'}
                color={'danger'}
                onPress={handleExitApp}
                className={'notDraggable'}
                startContent={<Power_Icon className={'size-3.5'} />}>
                Exit LynxHub
              </Button>
            )}
            {toastMessage.buttons.includes('restart') && (
              <Button
                size={'sm'}
                color={'primary'}
                onPress={handleRestart}
                className={'notDraggable'}
                startContent={<Refresh3_Icon className={'size-3.5'} />}>
                Restart LynxHub
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Subtle shine effect */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
         -skew-x-12 animate-pulse opacity-30 pointer-events-none"
      />
    </div>
  );
}
