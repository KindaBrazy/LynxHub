import {useRef} from 'react';

import {MenuTypes} from './consts';
import {useResize} from './hooks/useResize';
import useShowEvents from './hooks/useShowEvents';
import BrowserScale from './layouts/BrowserScale';
import CloseApp from './layouts/confirm_warn/CloseApp';
import TerminateProcess from './layouts/confirm_warn/TerminateProcess';
import TerminateTab from './layouts/confirm_warn/TerminateTab';
import DownloadMenu from './layouts/downloads';
import FindInPage from './layouts/FindInPage';
import RightClick from './layouts/right_click';
import VolumeMenu from './layouts/Volume';
import AlertWindow from './layouts/window_dialogs/Alert';
import ConfirmWindow from './layouts/window_dialogs/Confirm';
import PromptWindow from './layouts/window_dialogs/Prompt';
import {useContextState} from './redux/reducer';

export default function ContextMenu() {
  const windowWidth = useContextState('windowWidth');
  const activeLayout = useContextState('activeLayout');

  const divRef = useRef<HTMLDivElement | null>(null);

  useResize(divRef);
  useShowEvents();

  if (!activeLayout) return null;

  return (
    <div
      ref={divRef}
      className={`size-fit flex flex-col dark:bg-LynxRaisinBlack bg-white overflow-hidden ${windowWidth}`}>
      {activeLayout === MenuTypes.BrowserScale && <BrowserScale />}
      {activeLayout === MenuTypes.FindInPage && <FindInPage />}
      {activeLayout === MenuTypes.RightClick && <RightClick />}
      {activeLayout === MenuTypes.CloseAppConfirm && <CloseApp />}
      {activeLayout === MenuTypes.TerminateProcessConfirm && <TerminateProcess />}
      {activeLayout === MenuTypes.TerminateTabConfirm && <TerminateTab />}
      {activeLayout === MenuTypes.Volume && <VolumeMenu />}
      {activeLayout === MenuTypes.Downloads && <DownloadMenu />}
      {activeLayout === MenuTypes.Prompt && <PromptWindow />}
      {activeLayout === MenuTypes.Alert && <AlertWindow />}
      {activeLayout === MenuTypes.Confirm && <ConfirmWindow />}
    </div>
  );
}
