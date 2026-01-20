import storageIpc from '@lynx_shared/ipc/storage';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../components/LynxSwitch';
import {settingsActions, useSettingsState} from '../../../../redux/reducers/settings';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function LastSize() {
  const dispatch = useDispatch<AppDispatch>();
  const openLastSize = useSettingsState('openLastSize');

  const onOpenLastSizeChange = useCallback(
    (selected: boolean) => {
      storageIpc.update('app', {openLastSize: selected});
      dispatch(settingsActions.setSettingsState({key: 'openLastSize', value: selected}));
    },
    [dispatch],
  );

  return (
    <SettingsFilterItem
      searchTexts={[
        'Start in Last Window Size and Position',
        'start in last window size',
        'last position',
        'startup',
        'window size',
        'window position',
      ]}>
      <LynxSwitch
        enabled={openLastSize}
        onEnabledChange={onOpenLastSizeChange}
        title="Start in Last Window Size and Position"
        description="Start the app in the same window size and position as when it was last closed."
      />
    </SettingsFilterItem>
  );
}
