import {ToastWindowMessageType} from '@lynx_common/types';
import toastWindowIpc from '@lynx_shared/ipc/toastWindow';
import {useEffect, useState} from 'react';

export type UseToastMessageReturn = {
  toastMessage: ToastWindowMessageType | null;
  handlers: {
    handleClose: () => void;
    handleExitApp: () => void;
    handleRestart: () => void;
    handleCustomBtnClick: (id: string) => void;
  };
};

/**
 * Custom hook to manage toast message state and IPC interactions.
 * @returns {UseToastMessageReturn} The current toast message and event handlers.
 */
export function useToastMessage(): UseToastMessageReturn {
  const [toastMessage, setToastMessage] = useState<ToastWindowMessageType | null>(null);

  useEffect(() => {
    const offMessage = toastWindowIpc.onShowMessage(data => {
      setToastMessage(data);
      document.title = data.title;
    });

    return () => offMessage();
  }, []);

  const handlers = {
    handleClose: () => toastWindowIpc.closeToast(),
    handleExitApp: () => toastWindowIpc.exitApp(),
    handleRestart: () => toastWindowIpc.restartApp(),
    handleCustomBtnClick: (id: string) => toastWindowIpc.customBtnPressed(id),
  };

  return {toastMessage, handlers};
}
