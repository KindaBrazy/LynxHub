import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

/** Manage confirmation modals */
export default function SettingsGeneralConfirm() {
  const closeConfirm = useSettingsState('closeConfirm');
  const closeTabConfirm = useSettingsState('closeTabConfirm');
  const terminateAIConfirm = useSettingsState('terminateAIConfirm');

  const dispatch = useDispatch<AppDispatch>();

  const onCloseConfirmChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('app', {closeConfirm: selected});
      dispatch(settingsActions.setSettingsState({key: 'closeConfirm', value: selected}));
    },
    [dispatch],
  );

  const onCloseTabConfirmChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('app', {closeTabConfirm: selected});
      dispatch(settingsActions.setSettingsState({key: 'closeTabConfirm', value: selected}));
    },
    [dispatch],
  );

  const onTerminateAIConfirmChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('app', {terminateAIConfirm: selected});
      dispatch(settingsActions.setSettingsState({key: 'terminateAIConfirm', value: selected}));
    },
    [dispatch],
  );

  return (
    <>
      <LynxSwitch
        description="Show a confirmation window when closing the app.
         (Hold CTRL and click on close to bypass this confirmation.)"
        enabled={closeConfirm}
        title="Close Confirmation"
        onEnabledChange={onCloseConfirmChange}
      />
      <LynxSwitch
        description="Show a confirmation window when closing tab with terminal open.
         (Hold CTRL and click on terminate to bypass this confirmation.)"
        enabled={closeTabConfirm}
        title="Close Tab Confirmation"
        onEnabledChange={onCloseTabConfirmChange}
      />
      <LynxSwitch
        description="Show a confirmation window when terminating running AI.
         (Hold CTRL and click on terminate to bypass this confirmation.)"
        enabled={terminateAIConfirm}
        title="Terminate AI Confirmation"
        onEnabledChange={onTerminateAIConfirmChange}
      />
    </>
  );
}
