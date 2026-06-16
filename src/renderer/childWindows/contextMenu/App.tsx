import {useElementResizing} from '@lynx/utils/hooks';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';

import {MenuTypes} from './consts';
import BrowserScale from './layouts/BrowserScale';
import CloseApp from './layouts/confirm_warn/CloseApp';
import ProcessExitSignal from './layouts/confirm_warn/ProcessExitSignal';
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
import useShowEvents from './useShowEvents';

/**
 * Main Context Menu component.
 * Renders different layouts based on the active layout state.
 * Handles window resizing based on content.
 */
export default function ContextMenu() {
  const activeLayout = useContextState('activeLayout');
  const containerRef = useElementResizing(contextMenuIpc.send.resizeWindow);

  useShowEvents();

  return (
    <div ref={containerRef} className={`flex size-fit flex-col overflow-hidden bg-surface`}>
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
      {activeLayout === MenuTypes.ProcessExitSignal && <ProcessExitSignal />}
    </div>
  );
}
