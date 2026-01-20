import storageIpc from '@lynx_shared/ipc/storage';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../components/LynxSwitch';
import {settingsActions, useSettingsState} from '../../../../redux/reducers/settings';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';

/** Manage confirmation modals */
export default function Confirm() {
  const closeConfirm = useSettingsState('closeConfirm');
  const closeTabConfirm = useSettingsState('closeTabConfirm');
  const terminateAIConfirm = useSettingsState('terminateAIConfirm');

  const dispatch = useDispatch<AppDispatch>();

  const onCloseConfirmChange = useCallback(
    (selected: boolean) => {
      storageIpc.update('app', {closeConfirm: selected});
      dispatch(settingsActions.setSettingsState({key: 'closeConfirm', value: selected}));
    },
    [dispatch],
  );

  const onCloseTabConfirmChange = useCallback(
    (selected: boolean) => {
      storageIpc.update('app', {closeTabConfirm: selected});
      dispatch(settingsActions.setSettingsState({key: 'closeTabConfirm', value: selected}));
    },
    [dispatch],
  );

  const onTerminateAIConfirmChange = useCallback(
    (selected: boolean) => {
      storageIpc.update('app', {terminateAIConfirm: selected});
      dispatch(settingsActions.setSettingsState({key: 'terminateAIConfirm', value: selected}));
    },
    [dispatch],
  );

  return (
    <>
      <SettingsFilterItem
        searchTexts={['Close Confirmation', 'close app', 'confirmation window', 'ctrl', 'bypass confirmation']}>
        <LynxSwitch
          description="Show a confirmation window when closing the app.
         (Hold CTRL and click on close to bypass this confirmation.)"
          enabled={closeConfirm}
          title="Close Confirmation"
          onEnabledChange={onCloseConfirmChange}
        />
      </SettingsFilterItem>
      <SettingsFilterItem
        searchTexts={[
          'Close Tab Confirmation',
          'close tab',
          'terminal tab',
          'confirmation window',
          'ctrl',
          'bypass confirmation',
        ]}>
        <LynxSwitch
          description="Show a confirmation window when closing tab with terminal open.
         (Hold CTRL and click on terminate to bypass this confirmation.)"
          enabled={closeTabConfirm}
          title="Close Tab Confirmation"
          onEnabledChange={onCloseTabConfirmChange}
        />
      </SettingsFilterItem>
      <SettingsFilterItem
        searchTexts={[
          'Terminate AI Confirmation',
          'terminate ai',
          'stop ai',
          'confirmation window',
          'ctrl',
          'bypass confirmation',
        ]}>
        <LynxSwitch
          description="Show a confirmation window when terminating running AI.
         (Hold CTRL and click on terminate to bypass this confirmation.)"
          enabled={terminateAIConfirm}
          title="Terminate AI Confirmation"
          onEnabledChange={onTerminateAIConfirmChange}
        />
      </SettingsFilterItem>
    </>
  );
}
